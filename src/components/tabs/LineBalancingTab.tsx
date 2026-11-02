import { useState, useMemo } from 'react';
import { GarmentStyle, Operation } from '../../types';
import { calculateIEKPIs, generateBalancingSuggestions } from '../../utils/ieCalculations';
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Info,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface LineBalancingTabProps {
  style: GarmentStyle;
  onUpdateOperations: (newOps: Operation[]) => void;
}

export function LineBalancingTab({ style, onUpdateOperations }: LineBalancingTabProps) {
  // Local simulated operator allocations for real-time what-if scenario planning
  const [simulatedOps, setSimulatedOps] = useState<Record<string, number>>({});
  const [isSimulatorActive, setIsSimulatorActive] = useState(false);
  const [hoveredOpId, setHoveredOpId] = useState<string | null>(null);

  // Compute active operations incorporating simulation if active
  const activeOperations: Operation[] = useMemo(() => {
    if (!isSimulatorActive) return style.operations;
    return style.operations.map((op) => ({
      ...op,
      ops: simulatedOps[op.id] !== undefined ? simulatedOps[op.id] : op.ops,
    }));
  }, [style.operations, isSimulatorActive, simulatedOps]);

  const kpis = useMemo(() => {
    return calculateIEKPIs(activeOperations, style.targetHourly);
  }, [activeOperations, style.targetHourly]);

  const suggestions = useMemo(() => {
    return generateBalancingSuggestions(activeOperations, kpis.pitchTime);
  }, [activeOperations, kpis.pitchTime]);

  // Baseline comparison
  const baselineKpis = useMemo(() => {
    return calculateIEKPIs(style.operations, style.targetHourly);
  }, [style.operations, style.targetHourly]);

  const startSimulator = () => {
    const initial: Record<string, number> = {};
    style.operations.forEach((op) => {
      initial[op.id] = op.ops;
    });
    setSimulatedOps(initial);
    setIsSimulatorActive(true);
  };

  const updateSimulatedOp = (opId: string, delta: number) => {
    setSimulatedOps((prev) => {
      const current = prev[opId] !== undefined ? prev[opId] : (style.operations.find(o => o.id === opId)?.ops || 1);
      const updated = Math.max(0.5, Number((current + delta).toFixed(1)));
      return { ...prev, [opId]: updated };
    });
  };

  const resetSimulator = () => {
    setIsSimulatorActive(false);
    setSimulatedOps({});
  };

  const applySimulationToBulletin = () => {
    onUpdateOperations(activeOperations);
    setIsSimulatorActive(false);
    setSimulatedOps({});
  };

  // Chart data calculations
  const chartHeight = 240;
  const maxCycleTimeValue = Math.max(kpis.maxCycleTime * 1.25, kpis.pitchTime * 1.35, 1.0);

  return (
    <div className="space-y-4">
      {/* Top Balancing KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Line Efficiency
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-black font-mono ${
                kpis.lineEfficiency >= 85
                  ? 'text-emerald-400'
                  : kpis.lineEfficiency >= 70
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {kpis.lineEfficiency}%
            </span>
            {isSimulatorActive && (
              <span
                className={`text-xs font-mono font-bold ${
                  kpis.lineEfficiency >= baselineKpis.lineEfficiency
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {kpis.lineEfficiency >= baselineKpis.lineEfficiency ? '+' : ''}
                {kpis.lineEfficiency - baselineKpis.lineEfficiency}%
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Target: {style.targetEfficiency}%</p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Pitch Time (Takt)
          </p>
          <p className="text-2xl font-black text-sky-400 font-mono mt-1">
            {kpis.pitchTime.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1">min</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {(kpis.pitchTime * 60).toFixed(0)}s target cycle pace
          </p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Balancing Loss
          </p>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            {kpis.balancingLoss}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Smoothness Index: {kpis.smoothnessIndex}
          </p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Bottlenecks
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p
              className={`text-2xl font-black font-mono ${
                kpis.bottleneckCount === 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {kpis.bottleneckCount}
            </p>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                kpis.bottleneckCount === 0
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {kpis.bottleneckCount === 0 ? 'Optimal' : 'Action Req.'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Ops exceeding Pitch Time</p>
        </div>
      </div>

      {/* Bottleneck Visual SVG Bar Chart */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Workstation Cycle Time vs. Line Pitch Time</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Red bars indicate bottleneck operations causing line delay. Green bars are within takt pace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isSimulatorActive ? (
              <button
                onClick={startSimulator}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-400 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Simulate Balancing</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={resetSimulator}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={applySimulationToBulletin}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Simulation to Line</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Responsive Interactive SVG Chart */}
        <div className="relative w-full overflow-x-auto custom-scrollbar pt-4 pb-2">
          <div className="min-w-[620px] h-[260px] relative select-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 240"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              <line x1="40" y1="20" x2="790" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="75" x2="790" y2="75" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="790" y2="130" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="185" x2="790" y2="185" stroke="#334155" />

              {/* Y Axis Labels */}
              <text x="32" y="24" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                {maxCycleTimeValue.toFixed(1)}m
              </text>
              <text x="32" y="79" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                {(maxCycleTimeValue * 0.66).toFixed(1)}m
              </text>
              <text x="32" y="134" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                {(maxCycleTimeValue * 0.33).toFixed(1)}m
              </text>
              <text x="32" y="189" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                0m
              </text>

              {/* Pitch Time (Takt) Horizontal Line */}
              {kpis.pitchTime > 0 && (
                (() => {
                  const pitchY = 185 - (kpis.pitchTime / maxCycleTimeValue) * 165;
                  return (
                    <g>
                      <line
                        x1="40"
                        y1={pitchY}
                        x2="790"
                        y2={pitchY}
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      <rect
                        x="700"
                        y={Math.max(5, pitchY - 14)}
                        width="85"
                        height="18"
                        rx="4"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth="1"
                      />
                      <text
                        x="742"
                        y={Math.max(17, pitchY - 2)}
                        fill="#38bdf8"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        Pitch {kpis.pitchTime.toFixed(2)}m
                      </text>
                    </g>
                  );
                })()
              )}

              {/* Render Bars */}
              {activeOperations.map((op, idx) => {
                const totalOpsLen = activeOperations.length;
                const availableWidth = 740;
                const slotWidth = availableWidth / totalOpsLen;
                const barWidth = Math.min(Math.max(slotWidth - 8, 14), 45);
                const x = 45 + idx * slotWidth + (slotWidth - barWidth) / 2;

                const ops = Number(op.ops) || 1;
                const smv = Number(op.smv) || 0;
                const cycleTime = ops > 0 ? smv / ops : smv;
                const isBottleneck = cycleTime > kpis.pitchTime * 1.02;
                const isHovered = hoveredOpId === op.id;

                const barHeight = Math.min(165, (cycleTime / maxCycleTimeValue) * 165);
                const y = 185 - barHeight;

                return (
                  <g
                    key={op.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredOpId(op.id)}
                    onMouseLeave={() => setHoveredOpId(null)}
                  >
                    {/* Bar Background highlight */}
                    <rect
                      x={x - 2}
                      y={y}
                      width={barWidth + 4}
                      height={barHeight}
                      rx="4"
                      fill={isBottleneck ? '#f43f5e' : '#10b981'}
                      fillOpacity={isHovered ? 1 : 0.85}
                      stroke={isHovered ? '#ffffff' : 'transparent'}
                      strokeWidth="1.5"
                    />

                    {/* Op Sequence Label on Bottom */}
                    <text
                      x={x + barWidth / 2}
                      y="202"
                      fill={isHovered ? '#38bdf8' : '#94a3b8'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      #{idx + 1}
                    </text>

                    {/* Cycle Time Label on Top of Bar */}
                    <text
                      x={x + barWidth / 2}
                      y={Math.max(16, y - 4)}
                      fill={isBottleneck ? '#f43f5e' : '#10b981'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {cycleTime.toFixed(2)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Hovered Operation Detail Pill */}
        {hoveredOpId && (
          (() => {
            const hOp = activeOperations.find((o) => o.id === hoveredOpId);
            if (!hOp) return null;
            const ops = Number(hOp.ops) || 1;
            const smv = Number(hOp.smv) || 0;
            const cycleTime = ops > 0 ? smv / ops : smv;
            const isBottleneck = cycleTime > kpis.pitchTime * 1.02;

            return (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-400">#{hOp.seq}</span>
                  <span className="font-bold text-white">{hOp.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                    {hOp.machine}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span>SMV: <strong className="text-emerald-400 font-mono">{smv.toFixed(2)}m</strong></span>
                  <span>Allocated Ops: <strong className="text-amber-400 font-mono">{ops}</strong></span>
                  <span>Cycle Time: <strong className={`font-mono ${isBottleneck ? 'text-rose-400 font-bold' : 'text-sky-300'}`}>{cycleTime.toFixed(2)}m</strong></span>
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Simulator Operator Controls (When active) */}
      {isSimulatorActive && (
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-sky-500/40 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                Interactive Line Balancing Simulator
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Adjust operators to eliminate bottlenecks & watch efficiency update
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
            {activeOperations.map((op, idx) => {
              const ops = op.ops;
              const smv = op.smv;
              const cycleTime = ops > 0 ? smv / ops : smv;
              const isBottleneck = cycleTime > kpis.pitchTime * 1.02;

              return (
                <div
                  key={op.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                    isBottleneck
                      ? 'bg-rose-950/20 border-rose-900/40'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate text-xs">
                      #{idx + 1}. {op.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      SMV: {smv.toFixed(2)}m · Cycle: <span className={isBottleneck ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{cycleTime.toFixed(2)}m</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateSimulatedOp(op.id, -0.5)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs"
                      title="Decrease Operator"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-sky-400">
                      {ops}
                    </span>
                    <button
                      onClick={() => updateSimulatedOp(op.id, 0.5)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs"
                      title="Increase Operator"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* IE Smart Line Balancing Suggestions */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Industrial Engineering Line Balancing Action Items
          </h2>
        </div>

        {suggestions.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300">
                Line is in perfect equilibrium!
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                All operation cycle times are below or equal to the Pitch Time ({kpis.pitchTime.toFixed(2)} min). No line starving or blockage detected.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {suggestions.map((sug) => (
              <div
                key={sug.opId}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-300">
                        Op #{sug.opSeq}: {sug.opName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                        {sug.machine}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      Cycle time (<strong className="text-rose-400 font-mono">{sug.currentCycleTime}m</strong>) exceeds Pitch Time ({sug.pitchTime}m). {sug.action}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-[11px] text-slate-400">
                    Recommended: <strong className="text-emerald-400 font-mono">{sug.recommendedOps} ops</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
