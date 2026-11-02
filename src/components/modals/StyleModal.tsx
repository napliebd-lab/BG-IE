import { useState } from 'react';
import { GarmentStyle } from '../../types';
import { X, Plus, Check, Copy, Trash2, Shirt } from 'lucide-react';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  styles: GarmentStyle[];
  activeStyleId: string;
  onSelectStyle: (style: GarmentStyle) => void;
  onCreateStyle: (newStyle: Omit<GarmentStyle, 'id'>) => void;
  onDuplicateStyle: (styleId: string) => void;
  onDeleteStyle: (styleId: string) => void;
}

export function StyleModal({
  isOpen,
  onClose,
  styles,
  activeStyleId,
  onSelectStyle,
  onCreateStyle,
  onDuplicateStyle,
  onDeleteStyle,
}: StyleModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [styleCode, setStyleCode] = useState('');
  const [lineNo, setLineNo] = useState('');
  const [buyer, setBuyer] = useState('');
  const [targetHourly, setTargetHourly] = useState(180);
  const [workingHours, setWorkingHours] = useState(8);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !styleCode.trim()) return;

    onCreateStyle({
      name: name.trim(),
      styleCode: styleCode.trim(),
      lineNo: lineNo.trim() || 'Line 01',
      buyer: buyer.trim() || 'General Garment',
      targetHourly: Number(targetHourly) || 180,
      workingHours: Number(workingHours) || 8,
      targetEfficiency: 85,
      operations: [],
      hourlyOutputs: Array(Number(workingHours) || 8).fill(Number(targetHourly) || 180),
      downtimeLogs: [],
    });

    setName('');
    setStyleCode('');
    setLineNo('');
    setBuyer('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Garment Style Bulletins</h2>
              <p className="text-xs text-slate-400">Manage apparel styles, tech packs & lines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Active / List of Styles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Available Styles ({styles.length})
              </span>
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Style
                </button>
              )}
            </div>

            <div className="space-y-2">
              {styles.map((style) => {
                const isSelected = style.id === activeStyleId;
                const totalSmv = style.operations.reduce((acc, o) => acc + (Number(o.smv) || 0), 0);

                return (
                  <div
                    key={style.id}
                    className={`group p-4 rounded-2xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      onClick={() => {
                        onSelectStyle(style);
                        onClose();
                      }}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{style.name}</span>
                        {isSelected && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>Code: <strong className="text-slate-200">{style.styleCode}</strong></span>
                        <span>·</span>
                        <span>{style.lineNo}</span>
                        <span>·</span>
                        <span>{style.operations.length} Ops</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-mono font-medium">{totalSmv.toFixed(2)} SMV</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-3">
                      <button
                        title="Duplicate Style"
                        onClick={() => onDuplicateStyle(style.id)}
                        className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-xl transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {styles.length > 1 && (
                        <button
                          title="Delete Style"
                          onClick={() => onDeleteStyle(style.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to Create New Style */}
          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Create New Garment Bulletin
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Garment Name / Style Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hooded Sweatshirt or Cargo Pant"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Style Code / PO # *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HD-402"
                      value={styleCode}
                      onChange={(e) => setStyleCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Sewing Line #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Line 05"
                      value={lineNo}
                      onChange={(e) => setLineNo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Buyer / Brand
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nike"
                      value={buyer}
                      onChange={(e) => setBuyer(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Target / Hr (Pcs)
                    </label>
                    <input
                      type="number"
                      value={targetHourly}
                      onChange={(e) => setTargetHourly(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Working Hours
                    </label>
                    <input
                      type="number"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition text-sm"
                >
                  Create Style Bulletin
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
