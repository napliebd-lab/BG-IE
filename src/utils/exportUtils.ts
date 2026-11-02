import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GarmentStyle, TimeStudyLap, DowntimeLog } from '../types';
import { calculateIEKPIs } from './ieCalculations';

export function exportBulletinToPDF(style: GarmentStyle) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const kpis = calculateIEKPIs(style.operations, style.targetHourly);

  // Header Title
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GARMENTS OPERATION BULLETIN & LINE LAYOUT', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text(`Industrial Engineering Department | Factory Floor Technical Sheet`, 14, 18);

  // Metadata Panel
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  // Left column metadata
  doc.text(`Style Name: ${style.name}`, 14, 34);
  doc.setFont('helvetica', 'normal');
  doc.text(`Style Code: ${style.styleCode}`, 14, 40);
  doc.text(`Line Assignment: ${style.lineNo}`, 14, 46);
  if (style.buyer) {
    doc.text(`Buyer / Customer: ${style.buyer}`, 14, 52);
  }

  // Right column metadata
  doc.setFont('helvetica', 'normal');
  doc.text(`Target Output / Hr: ${style.targetHourly} pcs`, 120, 34);
  doc.text(`Working Hours / Day: ${style.workingHours} hrs`, 120, 40);
  doc.text(`Total Garment SMV: ${kpis.totalSmv.toFixed(2)} min`, 120, 46);
  doc.text(`Allocated Operators: ${kpis.totalOps} ops | Pitch: ${kpis.pitchTime.toFixed(2)} min`, 120, 52);

  // Table Data preparation
  const tableData = style.operations.map((op, idx) => {
    const smv = Number(op.smv) || 0;
    const ops = Number(op.ops) || 1;
    const capacityHr = smv > 0 ? Math.round((60 / smv) * ops) : 0;
    const cycleTime = ops > 0 ? (smv / ops).toFixed(2) : smv.toFixed(2);
    const isBottleneck = parseFloat(cycleTime) > (kpis.pitchTime * 1.02);

    return [
      idx + 1,
      op.name,
      op.machine,
      op.section,
      smv.toFixed(2),
      ops.toString(),
      `${cycleTime}m`,
      `${capacityHr} pcs`,
      isBottleneck ? 'Bottleneck' : 'Normal',
    ];
  });

  autoTable(doc, {
    startY: 58,
    head: [['#', 'Operation Name', 'Machine', 'Section', 'SMV (min)', 'Ops', 'Cycle Time', 'Cap/Hr', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129], // emerald-500
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 50 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 24 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 12 },
      6: { halign: 'center', cellWidth: 18 },
      7: { halign: 'center', cellWidth: 18 },
      8: { halign: 'center', cellWidth: 20 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 8) {
        if (data.cell.raw === 'Bottleneck') {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    },
  });

  // KPI Summary box below table
  // @ts-expect-error autoTable adds lastAutoTable to doc
  const finalY = (doc.lastAutoTable?.finalY || 180) + 8;

  if (finalY < 250) {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, finalY, 182, 22, 'FD');
    doc.setDrawColor(203, 213, 225);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('LINE BALANCING & INDUSTRIAL ENGINEERING SUMMARY', 18, finalY + 6);

    doc.setFont('helvetica', 'normal');
    doc.text(
      `Line Efficiency: ${kpis.lineEfficiency}%   |   Pitch Time: ${kpis.pitchTime.toFixed(2)} min   |   Balancing Loss: ${kpis.balancingLoss}%   |   Smoothness Index: ${kpis.smoothnessIndex}`,
      18,
      finalY + 12
    );
    doc.text(
      `Theoretical Operators: ${kpis.theoreticalOps}   |   Actual Operators: ${kpis.totalOps}   |   Daily Target (8h): ${style.targetHourly * style.workingHours} pcs`,
      18,
      finalY + 17
    );

    // Signatures
    const signY = finalY + 30;
    if (signY < 280) {
      doc.setFontSize(8);
      doc.text('_______________________', 20, signY);
      doc.text('Prepared By (IE Dept)', 20, signY + 5);

      doc.text('_______________________', 85, signY);
      doc.text('Line Supervisor', 85, signY + 5);

      doc.text('_______________________', 150, signY);
      doc.text('Approved By (Factory Manager)', 150, signY + 5);
    }
  }

  doc.save(`Garment_Operation_Bulletin_${style.styleCode}.pdf`);
}

export function exportBulletinToCSV(style: GarmentStyle) {
  const kpis = calculateIEKPIs(style.operations, style.targetHourly);
  let csv = 'Seq,Operation Name,Machine Type,Section,SMV (Minutes),SMV (Seconds),Operators,Cycle Time (Min),Hourly Capacity (Pcs),Status\n';

  style.operations.forEach((op, idx) => {
    const smv = Number(op.smv) || 0;
    const ops = Number(op.ops) || 1;
    const capacityHr = smv > 0 ? Math.round((60 / smv) * ops) : 0;
    const cycleTime = ops > 0 ? (smv / ops).toFixed(2) : smv.toFixed(2);
    const isBottleneck = parseFloat(cycleTime) > (kpis.pitchTime * 1.02);

    csv += `${idx + 1},"${op.name.replace(/"/g, '""')}",${op.machine},"${op.section}",${smv.toFixed(2)},${(smv * 60).toFixed(1)},${ops},${cycleTime},${capacityHr},${isBottleneck ? 'Bottleneck' : 'Normal'}\n`;
  });

  csv += `\nTotal SMV,${kpis.totalSmv}\nTotal Operators,${kpis.totalOps}\nPitch Time,${kpis.pitchTime}\nLine Efficiency,${kpis.lineEfficiency}%\n`;

  downloadFile(csv, `Bulletin_${style.styleCode}.csv`, 'text/csv;charset=utf-8;');
}

export function exportTimeStudyToCSV(
  styleCode: string,
  opName: string,
  laps: TimeStudyLap[],
  rating: number,
  allowance: number,
  samMinutes: number
) {
  let csv = `Time Study Report - Style: ${styleCode}\n`;
  csv += `Operation: "${opName.replace(/"/g, '""')}"\n`;
  csv += `Rating: ${rating}%,Allowance: ${allowance}%,Calculated SAM: ${samMinutes.toFixed(2)} min\n\n`;
  csv += `Cycle Number,Observed Time (Sec),Observed Time (Min),Status,Notes,Recorded At\n`;

  laps.forEach((lap, idx) => {
    csv += `${idx + 1},${lap.timeSeconds.toFixed(2)},${(lap.timeSeconds / 60).toFixed(3)},${lap.isOutlier ? 'Ignored (Outlier)' : 'Valid'},"${(lap.note || '').replace(/"/g, '""')}",${lap.timestamp}\n`;
  });

  downloadFile(csv, `TimeStudy_${styleCode}_Op.csv`, 'text/csv;charset=utf-8;');
}

export function exportProductionToCSV(
  style: GarmentStyle,
  hourlyOutputs: number[],
  downtimeLogs: DowntimeLog[] = []
) {
  let csv = `Production Report - Style: ${style.styleCode} (${style.name})\n`;
  csv += `Line: ${style.lineNo},Target Hourly: ${style.targetHourly} pcs\n\n`;
  csv += `Hour,Target (Pcs),Actual Output (Pcs),Variance (Pcs),Efficiency (%)\n`;

  let cumTarget = 0;
  let cumActual = 0;

  hourlyOutputs.forEach((output, idx) => {
    const h = idx + 1;
    const target = style.targetHourly;
    const variance = output - target;
    const eff = target > 0 ? Math.round((output / target) * 100) : 0;
    cumTarget += target;
    cumActual += output;

    csv += `Hour ${h},${target},${output},${variance >= 0 ? '+' : ''}${variance},${eff}%\n`;
  });

  const totalEff = cumTarget > 0 ? Math.round((cumActual / cumTarget) * 100) : 0;
  csv += `Total,${cumTarget},${cumActual},${cumActual - cumTarget},${totalEff}%\n\n`;

  if (downtimeLogs.length > 0) {
    csv += `Downtime & Stoppage Logs\nHour,Minutes Lost,Reason,Note\n`;
    downtimeLogs.forEach(dt => {
      csv += `Hour ${dt.hour},${dt.minutesLost},"${dt.reason}","${(dt.note || '').replace(/"/g, '""')}"\n`;
    });
  }

  downloadFile(csv, `Production_${style.styleCode}.csv`, 'text/csv;charset=utf-8;');
}

export function downloadJSON(data: unknown, filename: string) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
