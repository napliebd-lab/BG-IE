import { useState, useMemo } from 'react';
import { GarmentStyle, Operation, SectionType } from '../../types';
import { calculateIEKPIs } from '../../utils/ieCalculations';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Timer,
  AlertTriangle,
  Clock,
  Users,
  Target,
  Gauge,
} from 'lucide-react';

interface BulletinTabProps {
  style: GarmentStyle;
  onOpenAddOp: () => void;
  onEditOp: (op: Operation) => void;
  onDeleteOp: (opId: string) => void;
  onDuplicateOp: (op: Operation) => void;
  onMoveOp: (opId: string, direction: 'up' | 'down') => void;
  onSwitchToTimeStudy: (opId: string) => void;
  onUpdateTargetHourly: (target: number) => void;
}

export function BulletinTab({
  style,
  onOpenAddOp,
  onEditOp,
  onDeleteOp,
  onDuplicateOp,
  onMoveOp,
  onSwitchToTimeStudy,
  onUpdateTargetHourly,
}: BulletinTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(style.targetHourly);

  const kpis = useMemo(() => {
    return calculateIEKPIs(style.operations, style.targetHourly);
  }, [style.operations, style.targetHourly]);

  const sectionsList = useMemo(() => {
    const s = new Set<string>();
    style.operations.forEach((op) => s.add(op.section));
    return ['All', ...Array.from(s)];
  }, [style.operations]);

  const filteredOps = useMemo(() => {
    return style.operations.filter((op) => {
      const matchSearch =
        op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (op.remarks && op.remarks.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchSection = selectedSection === 'All' || op.section === selectedSection;
      return matchSearch && matchSection;
    });
  }, [style.operations, searchTerm, selectedSection]);

  const handleTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTargetHourly(Number(tempTarget) || 180);
    setIsEditingTarget(false);
  };

  return (
    <div className="space-y-4">
      {/* Active Bulletin Overview Banner */}
      <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE OPERATION BULLETIN
              </span>
              <span className="text-xs text-slate-400">{style.buyer || 'Standard'}</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              {style.name} <span className="text-slate-400 font-mono text-base font-normal">#{style.styleCode}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Assigned to <strong className="text-slate-200">{style.lineNo}</strong> · {style.operations.length} operations configured
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={onOpenAddOp}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Operation</span>
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Total SMV</span>
            </div>
            <p className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
              {kpis.totalSmv.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">min</span>
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {(kpis.totalSmv * 60).toFixed(0)} sec / piece
            </p>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
              <Users className="w-3 h-3 text-amber-400" />
              <span>Allocated Ops</span>
            </div>
            <p className="text-xl font-extrabold text-amber-400 font-mono mt-0.5">
              {kpis.totalOps}
              <span className="text-xs font-normal text-slate-400 ml-1">operators</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Theo: {kpis.theoreticalOps} req.
            </p>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
              <Target className="w-3 h-3 text-sky-400" />
              <span>Target Output</span>
            </div>
            {isEditingTarget ? (
              <form onSubmit={handleTargetSubmit} className="flex items-center gap-1 justify-center mt-1">
                <input
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(Number(e.target.value))}
                  className="w-16 bg-slate-800 border border-slate-700 text-xs text-white font-mono font-bold px-1.5 py-0.5 rounded text-center"
                  autoFocus
                />
                <button type="submit" className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                  OK
                </button>
              </form>
            ) : (
              <p
                onClick={() => setIsEditingTarget(true)}
                className="text-xl font-extrabold text-sky-400 font-mono mt-0.5 cursor-pointer hover:underline"
                title="Click to edit target output"
              >
                {style.targetHourly}
                <span className="text-xs font-normal text-slate-400 ml-1">pcs/hr</span>
              </p>
            )}
            <p className="text-[10px] text-slate-500 mt-0.5">
              {style.targetHourly * style.workingHours} pcs / {style.workingHours}h shift
            </p>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
              <Gauge className="w-3 h-3 text-purple-400" />
              <span>Pitch Time</span>
            </div>
            <p className="text-xl font-extrabold text-purple-400 font-mono mt-0.5">
              {kpis.pitchTime.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">min</span>
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {(kpis.pitchTime * 60).toFixed(0)}s takt pace
            </p>
          </div>
        </div>

        {/* Machine Breakdown Badges */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Machine Lineup:</span>
          {Object.entries(kpis.machineBreakdown).map(([machine, count]) => (
            <span
              key={machine}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700/60"
            >
              {count}x {machine}
            </span>
          ))}
          {kpis.bottleneckCount > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              {kpis.bottleneckCount} Bottleneck{kpis.bottleneckCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search operations, machine type, or instruction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1 mr-0.5" />
          {sectionsList.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedSection === sec
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Operations List */}
      <div className="space-y-2">
        {filteredOps.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-sm">No operations found matching your criteria.</p>
            <button
              onClick={onOpenAddOp}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Operation
            </button>
          </div>
        ) : (
          filteredOps.map((op, index) => {
            const smv = Number(op.smv) || 0;
            const ops = Number(op.ops) || 1;
            const capacityHr = smv > 0 ? Math.round((60 / smv) * ops) : 0;
            const cycleTime = ops > 0 ? smv / ops : smv;
            const isBottleneck = cycleTime > kpis.pitchTime * 1.02;

            return (
              <div
                key={op.id}
                className={`group bg-slate-900/90 rounded-2xl p-3 sm:p-4 border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isBottleneck
                    ? 'border-rose-500/40 hover:border-rose-500/60 bg-rose-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left: Sequence + Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => onMoveOp(op.id, 'up')}
                      disabled={index === 0}
                      title="Move Up"
                      className="text-slate-600 hover:text-slate-300 disabled:opacity-20 transition"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                      {op.seq || index + 1}
                    </div>
                    <button
                      onClick={() => onMoveOp(op.id, 'down')}
                      disabled={index === filteredOps.length - 1}
                      title="Move Down"
                      className="text-slate-600 hover:text-slate-300 disabled:opacity-20 transition"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold text-white leading-tight truncate">
                        {op.name}
                      </h2>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {op.machine}
                      </span>
                      {isBottleneck && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                          Bottleneck ({cycleTime.toFixed(2)}m)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="text-slate-400 font-medium">Sec: {op.section}</span>
                      <span>·</span>
                      <span>
                        Capacity: <strong className="text-emerald-400 font-mono">{capacityHr} pcs/hr</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Cycle Time: <strong className="text-sky-300 font-mono">{cycleTime.toFixed(2)} min</strong>
                      </span>
                      {op.remarks && (
                        <>
                          <span>·</span>
                          <span className="text-slate-500 italic truncate max-w-[200px]">
                            {op.remarks}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: SMV, Ops & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-black text-emerald-400 font-mono leading-none">
                      {smv.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">min</span>
                    </p>
                    <p className="text-[10px] text-amber-400 font-mono font-semibold mt-0.5">
                      {ops} Op{ops > 1 ? 's' : ''} ({(smv * 60).toFixed(0)}s)
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSwitchToTimeStudy(op.id)}
                      title="Floor Time Study this Operation"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded-lg border border-slate-700/80 transition"
                    >
                      <Timer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDuplicateOp(op)}
                      title="Duplicate Operation"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700/80 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditOp(op)}
                      title="Edit Operation"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 rounded-lg border border-slate-700/80 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteOp(op.id)}
                      title="Delete Operation"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 rounded-lg border border-slate-700/80 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
