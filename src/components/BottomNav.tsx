import { ActiveTab } from '../types';
import {
  ListOrdered,
  Timer,
  Scale,
  TrendingUp,
  FileDown,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  bottlenecksCount: number;
}

export function BottomNav({ activeTab, onTabChange, bottlenecksCount }: BottomNavProps) {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'breakdown', label: 'Bulletin', icon: ListOrdered },
    { id: 'timestudy', label: 'Time Study', icon: Timer },
    { id: 'balancing', label: 'Balancing', icon: Scale },
    { id: 'production', label: 'Production', icon: TrendingUp },
    { id: 'reports', label: 'Export', icon: FileDown },
  ];

  return (
    <nav className="bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-1.5 flex justify-around items-center z-20 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition relative ${
              isActive
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {tab.id === 'balancing' && bottlenecksCount > 0 && (
                <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
