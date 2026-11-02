import { useRef } from 'react';
import { GarmentStyle } from '../../types';
import {
  exportBulletinToPDF,
  exportBulletinToCSV,
  exportProductionToCSV,
  downloadJSON,
} from '../../utils/exportUtils';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  Upload,
  Database,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface ReportsTabProps {
  style: GarmentStyle;
  allStyles: GarmentStyle[];
  onImportStyles: (imported: GarmentStyle[]) => void;
}

export function ReportsTab({ style, allStyles, onImportStyles }: ReportsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      styles: allStyles,
    };
    downloadJSON(backupData, `GarmentFlow_IE_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.styles && Array.isArray(parsed.styles)) {
          onImportStyles(parsed.styles);
          alert(`Successfully imported ${parsed.styles.length} styles into GarmentFlow!`);
        } else if (Array.isArray(parsed)) {
          onImportStyles(parsed);
          alert(`Successfully imported ${parsed.length} styles into GarmentFlow!`);
        } else {
          alert('Invalid backup file format. Expected a styles array.');
        }
      } catch (err) {
        alert('Failed to read JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Intro Card */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-1">
          Export Industrial Engineering Documentation
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Generate printable PDF bulletins for factory sewing lines, downloadable CSV/Excel reports for management analysis, or complete workspace backups.
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* PDF Operation Bulletin */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Operation Bulletin PDF</h3>
              <p className="text-xs text-slate-400 mt-1">
                Formatted factory layout tech sheet with machine breakdown, pitch takt times, and signature authorization fields.
              </p>
            </div>
          </div>

          <button
            onClick={() => exportBulletinToPDF(style)}
            className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-between transition"
          >
            <span>Download Bulletin PDF</span>
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Excel / CSV Operation Breakdown */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Excel / CSV Operation Breakdown</h3>
              <p className="text-xs text-slate-400 mt-1">
                Spreadsheet ready format with raw SMVs, allocated operators, calculated workstation capacities, and bottleneck classifications.
              </p>
            </div>
          </div>

          <button
            onClick={() => exportBulletinToCSV(style)}
            className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-between transition"
          >
            <span>Download Bulletin CSV</span>
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Shift Production Report */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Production Shift Report CSV</h3>
              <p className="text-xs text-slate-400 mt-1">
                Full shift log including hourly outputs, cumulative variance, overall line efficiency %, and recorded machine downtime logs.
              </p>
            </div>
          </div>

          <button
            onClick={() => exportProductionToCSV(style, style.hourlyOutputs, style.downtimeLogs)}
            className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/20 flex items-center justify-between transition"
          >
            <span>Download Shift CSV</span>
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Factory Print Direct */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Print Shop-Floor Sheet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Print physical layout sheet directly via factory office printer or thermal printer for line notice board.
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="mt-4 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-between transition"
          >
            <span>Print Layout Sheet</span>
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* JSON Backup & Restore System */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Workspace Backup & Migration (JSON)
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Save your complete collection of styles, operation bulletins, and line setups as a single JSON file. You can restore it on any computer or mobile browser without losing data.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download All Data JSON ({allStyles.length} Styles)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Restore / Import JSON File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
