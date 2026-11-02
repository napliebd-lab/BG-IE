import { useState, useEffect } from 'react';
import { Operation, MachineType, SectionType } from '../../types';
import { X, Wrench, Sparkles } from 'lucide-react';

interface OperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (opData: Omit<Operation, 'id'>, editId?: string) => void;
  editingOp?: Operation | null;
  totalOpsCount: number;
}

const MACHINE_OPTIONS: { value: MachineType; label: string; desc: string }[] = [
  { value: 'SNLS', label: 'SNLS', desc: 'Single Needle Lockstitch' },
  { value: 'DNLS', label: 'DNLS', desc: 'Double Needle Lockstitch' },
  { value: 'OL-4D', label: 'Overlock 4-Thread', desc: '4-Thread Safety Overlock' },
  { value: 'OL-5D', label: 'Overlock 5-Thread', desc: '5-Thread Heavy Overlock' },
  { value: 'FL', label: 'Flatlock / Interlock', desc: 'Bottom Hemming / Collar coverstitch' },
  { value: 'KANSAI', label: 'Kansai Special', desc: 'Multi-needle chainstitch / Waistband' },
  { value: 'FEED-OFF-ARM', label: 'Feed-off-the-Arm', desc: 'Felling & lap seam join' },
  { value: 'BARTACK', label: 'Bartack Auto', desc: 'Pocket corners & belt loops' },
  { value: 'BUTTON_HOLE', label: 'Buttonhole', desc: 'Placket eyelet or straight hole' },
  { value: 'BUTTON_ATTACH', label: 'Button Attach', desc: 'Automatic button sewer' },
  { value: 'MANUAL', label: 'Manual Helper', desc: 'Trimming, turning, marking, bundle handling' },
  { value: 'IRON', label: 'Steam Iron', desc: 'Intermediate or final pressing' },
  { value: 'QC', label: 'Inline QC / Inspection', desc: 'Quality audit & check' },
];

const SECTION_OPTIONS: SectionType[] = [
  'Component',
  'Front',
  'Back',
  'Collar & Cuff',
  'Assembly',
  'Finishing',
  'Packaging',
];

export function OperationModal({
  isOpen,
  onClose,
  onSave,
  editingOp,
  totalOpsCount,
}: OperationModalProps) {
  const [name, setName] = useState('');
  const [machine, setMachine] = useState<MachineType>('SNLS');
  const [section, setSection] = useState<SectionType>('Assembly');
  const [smv, setSmv] = useState<number | ''>(0.75);
  const [ops, setOps] = useState<number | ''>(1);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (editingOp) {
      setName(editingOp.name);
      setMachine(editingOp.machine);
      setSection(editingOp.section);
      setSmv(editingOp.smv);
      setOps(editingOp.ops);
      setRemarks(editingOp.remarks || '');
    } else {
      setName('');
      setMachine('SNLS');
      setSection('Assembly');
      setSmv(0.75);
      setOps(1);
      setRemarks('');
    }
  }, [editingOp, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedSmv = typeof smv === 'number' ? smv : parseFloat(smv) || 0.5;
    const parsedOps = typeof ops === 'number' ? ops : parseFloat(ops) || 1;

    onSave(
      {
        seq: editingOp ? editingOp.seq : totalOpsCount + 1,
        name: name.trim(),
        machine,
        section,
        smv: parsedSmv,
        ops: parsedOps,
        isManual: machine === 'MANUAL',
        remarks: remarks.trim(),
      },
      editingOp?.id
    );
    onClose();
  };

  const calculatedCapacity = smv && ops && Number(smv) > 0 ? Math.round((60 / Number(smv)) * Number(ops)) : 0;
  const cycleTime = smv && ops && Number(ops) > 0 ? (Number(smv) / Number(ops)).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingOp ? 'Edit Operation' : 'Add New Garment Operation'}
              </h2>
              <p className="text-xs text-slate-400">Define machine type, section, SMV and operator allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Operation Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Collar Band Stitch or Sleeve Hemming"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Machine Type
              </label>
              <select
                value={machine}
                onChange={(e) => setMachine(e.target.value as MachineType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {MACHINE_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} ({m.desc})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Section / Area
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as SectionType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {SECTION_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Standard SMV / SAM (min) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.05"
                  max="15"
                  required
                  value={smv}
                  onChange={(e) => setSmv(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0.75"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">
                  {smv ? `${(Number(smv) * 60).toFixed(0)} sec` : '0s'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Allocated Operators *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                required
                value={ops}
                onChange={(e) => setOps(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-sky-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick IE metrics preview */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Workstation Cycle Time:</span>
              <span className="ml-1.5 font-mono font-bold text-amber-300">{cycleTime} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Target Capacity:</span>
              <span className="font-mono font-bold text-emerald-400">{calculatedCapacity} pcs/hr</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Work Instruction / Folder / Gauge Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Use 1/4 inch gauge folder, notch match point"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition"
            >
              {editingOp ? 'Update Operation' : 'Add to Bulletin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
