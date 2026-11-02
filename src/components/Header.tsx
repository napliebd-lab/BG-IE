import { GarmentStyle } from '../types';
import { Shirt, Layers, Smartphone, Monitor, Download, Plus } from 'lucide-react';

interface HeaderProps {
  activeStyle: GarmentStyle;
  onOpenStyleModal: () => void;
  onOpenAddOpModal: () => void;
  viewMode: 'mobile' | 'desktop';
  onToggleViewMode: () => void;
  onExportPDF: () => void;
}

export function Header({
  activeStyle,
  onOpenStyleModal,
  onOpenAddOpModal,
  viewMode,
  onToggleViewMode,
  onExportPDF,
}: HeaderProps) {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
          <Shirt className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap">
              GarmentFlow IE
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PRO IE
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium truncate max-w-[200px] sm:max-w-xs leading-none mt-0.5">
            {activeStyle.name} · {activeStyle.lineNo}
          </p>
        </div>
      </div>

      {/* Zone 2: Style Switcher & Viewport Mode */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenStyleModal}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-2 transition"
          title="Select Garment Style Bulletin"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span className="max-w-[130px] truncate sm:max-w-[180px]">{activeStyle.styleCode}</span>
        </button>

        {/* Floor Handset vs Desktop Toggle */}
        <button
          onClick={onToggleViewMode}
          className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 items-center gap-1.5 transition"
          title={viewMode === 'mobile' ? 'Switch to Fullscreen Desktop View' : 'Switch to Shop-Floor Mobile View'}
        >
          {viewMode === 'mobile' ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span>Desktop View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Mobile Floor Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenAddOpModal}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span className="hidden sm:inline">Add Op</span>
        </button>

        <button
          onClick={onExportPDF}
          title="Quick PDF Export"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline">PDF</span>
        </button>
      </div>
    </header>
  );
}
