import { useState, useMemo } from 'react';
import { GarmentStyle, DowntimeLog } from '../../types';
import { exportProductionToCSV } from '../../utils/exportUtils';
import {
  TrendingUp,
  Clock,
  AlertOctagon,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ProductionTabProps {
  style: GarmentStyle;
  onUpdateStyleProduction: (
    targetHourly: number,
    workingHours: number,
    hourlyOutputs: number[],
    downtimeLogs: DowntimeLog[]
  ) => void;
}

export function ProductionTab({ style, onUpdateStyleProduction }: ProductionTabProps) {
  const [targetHourly, setTargetHourly] = useState(style.targetHourly);
  const [workingHours, setWorkingHours] = useState(style.workingHours || 8);
  const [outputs, setOutputs] = useState<number[]>(() => {
    const arr = [...(style.hourlyOutputs || [])];
    while (arr.length < workingHours) arr.push(targetHourly);
    return arr.slice(0, workingHours);
  });
  const [downtimeLogs, setDowntimeLogs] = useState<DowntimeLog[]>(style.downtimeLogs || []);

  // New downtime log input state
  const [newDtHour, setNewDtHour] = useState(1);
  const [newDtMinutes, setNewDtMinutes] = useState(10);
  const [newDtReason, setNewDtReason] = useState<DowntimeLog['reason']>('Machine Breakdown');
  const [newDtNote, setNewDtNote] = useState('');
  const [showAddDt, setShowAddDt] = useState(false);

  // Sync working hours count
  const handleWorkingHoursChange = (hours: number) => {
    const h = Math.max(1, Math.min(16, hours));
    setWorkingHours(h);
    const newArr = [...outputs];
    while (newArr.length < h) newArr.push(targetHourly);
    const truncated = newArr.slice(0, h);
    setOutputs(truncated);
    onUpdateStyleProduction(targetHourly, h, truncated, downtimeLogs);
  };

  const handleTargetChange = (target: number) => {
    const t = Math.max(1, target);
    setTargetHourly(t);
    onUpdateStyleProduction(t, workingHours, outputs, downtimeLogs);
  };

  const handleOutputChange = (index: number, val: number) => {
    const updated = [...outputs];
    updated[index] = Math.max(0, val);
    setOutputs(updated);
    onUpdateStyleProduction(targetHourly, workingHours, updated, downtimeLogs);
  };

  const handleAddDowntime = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DowntimeLog = {
      id: `dt-${Date.now()}`,
      hour: newDtHour,
      minutesLost: Number(newDtMinutes) || 5,
      reason: newDtReason,
      note: newDtNote.trim(),
    };
    const updated = [...downtimeLogs, newLog];
    setDowntimeLogs(updated);
    onUpdateStyleProduction(targetHourly, workingHours, outputs, updated);
    setNewDtNote('');
    setShowAddDt(false);
  };

  const handleDeleteDowntime = (id: string) => {
    const updated = downtimeLogs.filter((d) => d.id !== id);
    setDowntimeLogs(updated);
    onUpdateStyleProduction(targetHourly, workingHours, outputs, updated);
  };

  // Production Calculations
  const totalActual = outputs.reduce((a, b) => a + b, 0);
  const totalTarget = targetHourly * workingHours;
  const variance = totalActual - totalTarget;

  // Garments standard efficiency formula:
  // (Total Actual Output * Total Garment SMV) / (Total Allocated Operators * Total Shift Worked Minutes) * 100
  const totalSmv = style.operations.reduce((acc, o) => acc + (Number(o.smv) || 0), 0);
  const totalOps = style.operations.reduce((acc, o) => acc + (Number(o.ops) || 1), 0);
  const totalWorkedMinutes = workingHours * 60;

  const actualProducedMinutes = totalActual * totalSmv;
  const availableOperatorMinutes = totalOps * totalWorkedMinutes;

  const lineEfficiency =
    availableOperatorMinutes > 0
      ? Math.min(120, Math.round((actualProducedMinutes / availableOperatorMinutes) * 100))
      : 0;

  // Total lost downtime minutes
  const totalLostMinutes = downtimeLogs.reduce((acc, d) => acc + (Number(d.minutesLost) || 0), 0);
  const lostPcsCapacity = totalSmv > 0 ? Math.round((totalLostMinutes / totalSmv) * totalOps) : 0;

  const handleExportCSV = () => {
    exportProductionToCSV(style, outputs, downtimeLogs);
  };

  return (
    <div className="space-y-4">
      {/* Target & Shift Parameter Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Production Shift Configuration</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Set hourly line target and shift duration to calculate real-time efficiency
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Target Line Output / Hour (Pcs)
            </label>
            <input
              type="number"
              value={targetHourly}
              onChange={(e) => handleTargetChange(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-sky-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Working Hours / Day
            </label>
            <div className="flex items-center gap-2">
              {[8, 9, 10, 12].map((h) => (
                <button
                  key={h}
                  onClick={() => handleWorkingHoursChange(h)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition ${
                    workingHours === h
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {h} hrs
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Production Output Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Total Actual Output
          </p>
          <p className="text-2xl font-black text-white font-mono mt-1">
            {totalActual} <span className="text-xs font-normal text-slate-400">pcs</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Target: {totalTarget} pcs</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Overall Line Efficiency
          </p>
          <p
            className={`text-2xl font-black font-mono mt-1 ${
              lineEfficiency >= style.targetEfficiency
                ? 'text-emerald-400'
                : lineEfficiency >= 70
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {lineEfficiency}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Target: {style.targetEfficiency}%</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Production Variance
          </p>
          <p
            className={`text-2xl font-black font-mono mt-1 ${
              variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {variance >= 0 ? `+${variance}` : variance}{' '}
            <span className="text-xs font-normal text-slate-400">pcs</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {variance >= 0 ? 'Ahead of target' : 'Behind schedule'}
          </p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Total Lost Time
          </p>
          <p className="text-2xl font-black text-rose-400 font-mono mt-1">
            {totalLostMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            ~{lostPcsCapacity} pcs lost capacity
          </p>
        </div>
      </div>

      {/* Hourly Output Log Grid */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Hourly Production Tracker</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {workingHours} hours recorded
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {outputs.map((val, idx) => {
            const h = idx + 1;
            const diff = val - targetHourly;
            const hourEff = targetHourly > 0 ? Math.round((val / targetHourly) * 100) : 0;
            const isMet = val >= targetHourly;

            return (
              <div
                key={h}
                className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-300">Hour {h}</span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isMet ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {hourEff}%
                  </span>
                </div>

                <div className="flex items-center gap-2 my-1">
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => handleOutputChange(idx, Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-center font-mono font-bold text-base text-white py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-mono">pcs</span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Target: {targetHourly}</span>
                  <span className={diff >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {diff >= 0 ? `+${diff}` : diff}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Factory Floor Downtime & Line Stoppage Log */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Line Stoppage & Downtime Log ({downtimeLogs.length})
            </h2>
          </div>
          <button
            onClick={() => setShowAddDt(!showAddDt)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Stoppage</span>
          </button>
        </div>

        {/* Add Downtime Form */}
        {showAddDt && (
          <form
            onSubmit={handleAddDowntime}
            className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 animate-in fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Shift Hour</label>
                <select
                  value={newDtHour}
                  onChange={(e) => setNewDtHour(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  {Array.from({ length: workingHours }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      Hour {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Minutes Lost</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={newDtMinutes}
                  onChange={(e) => setNewDtMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Reason</label>
                <select
                  value={newDtReason}
                  onChange={(e) => setNewDtReason(e.target.value as DowntimeLog['reason'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="Machine Breakdown">Machine Breakdown</option>
                  <option value="Needle Break">Needle Break</option>
                  <option value="Fabric Defect">Fabric Defect</option>
                  <option value="Thread Breakage">Thread Breakage</option>
                  <option value="Operator Absence">Operator Absence</option>
                  <option value="Quality Rework">Quality Rework</option>
                  <option value="Other">Other Stoppage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Notes / Description</label>
              <input
                type="text"
                placeholder="e.g. SNLS motor belt loose, mechanics called"
                value={newDtNote}
                onChange={(e) => setNewDtNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddDt(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition"
              >
                Save Stoppage
              </button>
            </div>
          </form>
        )}

        {/* List of Stoppages */}
        {downtimeLogs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4 bg-slate-950/40 rounded-xl">
            No line stoppages logged for this shift. Continuous flow maintained.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {downtimeLogs.map((dt) => (
              <div
                key={dt.id}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-400">
                    Hour {dt.hour}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {dt.reason}
                  </span>
                  <span className="font-mono font-bold text-rose-400">
                    {dt.minutesLost} min lost
                  </span>
                  {dt.note && (
                    <span className="text-slate-400 italic">· {dt.note}</span>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteDowntime(dt.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
