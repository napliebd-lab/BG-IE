import { useState, useEffect, useRef } from 'react';
import { GarmentStyle, TimeStudyLap } from '../../types';
import { calculateTimeStudyValues } from '../../utils/ieCalculations';
import { exportTimeStudyToCSV } from '../../utils/exportUtils';
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  CheckCircle,
  Download,
  Trash2,
  Sliders,
  Plus,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface TimeStudyTabProps {
  style: GarmentStyle;
  selectedOpId: string;
  onSelectOpId: (id: string) => void;
  onApplyCalculatedSMV: (opId: string, newSmv: number) => void;
}

export function TimeStudyTab({
  style,
  selectedOpId,
  onSelectOpId,
  onApplyCalculatedSMV,
}: TimeStudyTabProps) {
  // Active operation to study
  const currentOp = style.operations.find((o) => o.id === selectedOpId) || style.operations[0];

  // Stopwatch State
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Laps list
  const [laps, setLaps] = useState<TimeStudyLap[]>([]);
  const [manualSecondsInput, setManualSecondsInput] = useState('');

  // Rating and Allowances
  const [rating, setRating] = useState(100); // 100% normal performance
  const [pfaAllowance, setPfaAllowance] = useState(10); // Personal & Fatigue allowance %
  const [machineAllowance, setMachineAllowance] = useState(3); // Machine delay allowance %
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const totalAllowance = pfaAllowance + machineAllowance;

  // Sync animation frame for high precision
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedMs;

      const updateTimer = () => {
        setElapsedMs(performance.now() - startTimeRef.current);
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };

      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  // Formatted timer string
  const totalSeconds = elapsedMs / 1000;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const hundredths = Math.floor((elapsedMs % 1000) / 10);
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedMs(0);
  };

  const recordLap = () => {
    if (totalSeconds <= 0.2) return;

    const newLap: TimeStudyLap = {
      id: `lap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      lapNumber: laps.length + 1,
      timeSeconds: Number(totalSeconds.toFixed(2)),
      isOutlier: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setLaps((prev) => [newLap, ...prev]);
    resetTimer();
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualSecondsInput);
    if (!val || val <= 0) return;

    const newLap: TimeStudyLap = {
      id: `lap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      lapNumber: laps.length + 1,
      timeSeconds: Number(val.toFixed(2)),
      isOutlier: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setLaps((prev) => [newLap, ...prev]);
    setManualSecondsInput('');
  };

  const toggleOutlier = (lapId: string) => {
    setLaps((prev) =>
      prev.map((l) => (l.id === lapId ? { ...l, isOutlier: !l.isOutlier } : l))
    );
  };

  const deleteLap = (lapId: string) => {
    setLaps((prev) => prev.filter((l) => l.id !== lapId));
  };

  const clearAllLaps = () => {
    setLaps([]);
  };

  // Valid cycle times for formula
  const validTimes = laps.filter((l) => !l.isOutlier).map((l) => l.timeSeconds);
  const studyMetrics = calculateTimeStudyValues(validTimes, rating, totalAllowance);

  const handleApplySmv = () => {
    if (!currentOp || studyMetrics.samMinutes <= 0) return;
    onApplyCalculatedSMV(currentOp.id, studyMetrics.samMinutes);

    setAppliedNotification(
      `Successfully updated ${currentOp.name} to ${studyMetrics.samMinutes} min SMV!`
    );
    setTimeout(() => setAppliedNotification(null), 3500);
  };

  const handleExportCSV = () => {
    if (!currentOp) return;
    exportTimeStudyToCSV(
      style.styleCode,
      currentOp.name,
      laps,
      rating,
      totalAllowance,
      studyMetrics.samMinutes
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {appliedNotification && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{appliedNotification}</span>
        </div>
      )}

      {/* Target Operation Selector */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Select Operation for Time Study
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <select
            value={currentOp?.id || ''}
            onChange={(e) => {
              onSelectOpId(e.target.value);
              resetTimer();
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            {style.operations.map((op, idx) => (
              <option key={op.id} value={op.id}>
                #{idx + 1}. {op.name} ({op.machine}) - Current: {op.smv.toFixed(2)}m
              </option>
            ))}
          </select>

          {currentOp && (
            <div className="flex items-center justify-between sm:justify-end gap-3 px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400">Current SMV:</span>
                <span className="ml-1.5 font-mono font-bold text-emerald-400">
                  {currentOp.smv.toFixed(2)} min
                </span>
                <span className="text-slate-500 text-[10px] ml-1">
                  ({(currentOp.smv * 60).toFixed(0)}s)
                </span>
              </div>
              <div>
                <span className="text-slate-400">Machine:</span>
                <span className="ml-1.5 font-mono font-bold text-sky-400">
                  {currentOp.machine}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floor Digital Stopwatch Card */}
      <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-800 text-center relative overflow-hidden shadow-lg">
        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
          <span>Shop-Floor Digital Stopwatch</span>
          {isRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          )}
        </div>

        {/* Huge Digital Timer Display */}
        <div className="text-5xl sm:text-6xl font-mono font-black text-white tracking-widest my-4 select-none drop-shadow">
          {formattedTime}
        </div>

        <p className="text-xs text-slate-400 font-medium">
          {totalSeconds > 0 ? `${totalSeconds.toFixed(2)} seconds elapsed` : 'Ready to record cycle'}
        </p>

        {/* Big Touch Controls */}
        <div className="flex items-center justify-center gap-3 mt-5 max-w-md mx-auto">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{elapsedMs > 0 ? 'RESUME' : 'START'}</span>
              </>
            )}
          </button>

          <button
            onClick={recordLap}
            disabled={elapsedMs === 0}
            className="flex-1 py-4 px-6 bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:hover:bg-sky-600 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 active:scale-95 transition"
          >
            <Flag className="w-5 h-5 fill-current" />
            <span>LAP / CYCLE</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl active:scale-95 transition"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Manual Time Input Row */}
        <form onSubmit={handleManualAdd} className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 max-w-sm mx-auto">
          <input
            type="number"
            step="0.01"
            placeholder="Add manual seconds (e.g. 42.5)"
            value={manualSecondsInput}
            onChange={(e) => setManualSecondsInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl shrink-0 flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </form>
      </div>

      {/* Industrial Engineering Rating & Allowance Calculator */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              IE Rating & Allowance Calculations
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">
            Valid Laps: {validTimes.length} / {laps.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Performance Rating */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-slate-400">
                Performance Rating %
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">{rating}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="130"
              step="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 mt-1">
              <button onClick={() => setRating(90)} className="hover:text-slate-300">90% Slow</button>
              <button onClick={() => setRating(100)} className="font-bold text-slate-300">100% Normal</button>
              <button onClick={() => setRating(110)} className="hover:text-slate-300">110% Fast</button>
              <button onClick={() => setRating(120)} className="hover:text-slate-300">120% Expert</button>
            </div>
          </div>

          {/* Personal & Fatigue Allowance */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-slate-400">
                Personal & Fatigue (PFA) %
              </label>
              <span className="text-xs font-mono font-bold text-sky-400">{pfaAllowance}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={pfaAllowance}
              onChange={(e) => setPfaAllowance(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 mt-1">
              <span>8% Light</span>
              <span className="font-bold text-slate-300">10% Standard</span>
              <span>15% Heavy</span>
            </div>
          </div>

          {/* Machine Delay Allowance */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-slate-400">
                Machine Delay Allowance %
              </label>
              <span className="text-xs font-mono font-bold text-purple-400">{machineAllowance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={machineAllowance}
              onChange={(e) => setMachineAllowance(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 mt-1">
              <span>0% Manual</span>
              <span className="font-bold text-slate-300">3% Lockstitch</span>
              <span>5% Complex</span>
            </div>
          </div>
        </div>

        {/* Calculated SMV Callout Bar */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Observed Avg (Tobs):</span>
              <span className="font-mono font-bold text-slate-200">
                {studyMetrics.averageSeconds}s ({(studyMetrics.averageSeconds / 60).toFixed(3)}m)
              </span>
              <span>·</span>
              <span className="text-xs text-slate-400 font-medium">Basic Time:</span>
              <span className="font-mono font-bold text-slate-200">
                {studyMetrics.basicTimeMin}m
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Calculated Standard SAM / SMV:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {studyMetrics.samMinutes} <span className="text-xs font-normal text-slate-400">min</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({(studyMetrics.samMinutes * 60).toFixed(0)} sec)
              </span>
            </div>
          </div>

          <button
            onClick={handleApplySmv}
            disabled={studyMetrics.samMinutes <= 0}
            className="w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
          >
            <span>Apply SMV to Bulletin</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Recorded Cycle Times Table */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Recorded Cycles ({laps.length})
            </h2>
            <p className="text-[11px] text-slate-400">
              Click outlier flag to exclude abnormal cycles (e.g. needle break)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {laps.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 transition"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={clearAllLaps}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {laps.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/60">
            <p className="text-xs text-slate-500">
              No cycles recorded yet. Start the stopwatch and tap "LAP / CYCLE" when operator completes one garment piece.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
            {laps.map((lap) => (
              <div
                key={lap.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                  lap.isOutlier
                    ? 'bg-rose-950/20 border-rose-900/40 text-slate-500 line-through'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500 font-semibold w-8">
                    #{lap.lapNumber}
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {lap.timeSeconds.toFixed(2)}s
                  </span>
                  <span className="font-mono text-slate-400">
                    ({(lap.timeSeconds / 60).toFixed(3)} min)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleOutlier(lap.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      lap.isOutlier
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lap.isOutlier ? 'Ignored' : 'Mark Outlier'}
                  </button>
                  <button
                    onClick={() => deleteLap(lap.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
