import { useState, useEffect, useMemo } from 'react';
import { GarmentStyle, Operation, ActiveTab } from './types';
import { PRESET_STYLES } from './data/presetStyles';
import { calculateIEKPIs } from './utils/ieCalculations';
import { exportBulletinToPDF } from './utils/exportUtils';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BulletinTab } from './components/tabs/BulletinTab';
import { TimeStudyTab } from './components/tabs/TimeStudyTab';
import { LineBalancingTab } from './components/tabs/LineBalancingTab';
import { ProductionTab } from './components/tabs/ProductionTab';
import { ReportsTab } from './components/tabs/ReportsTab';
import { StyleModal } from './components/modals/StyleModal';
import { OperationModal } from './components/modals/OperationModal';

const STORAGE_KEY_STYLES = 'garmentflow_ie_styles_v1';
const STORAGE_KEY_ACTIVE_ID = 'garmentflow_ie_active_style_v1';
const STORAGE_KEY_VIEW_MODE = 'garmentflow_ie_view_mode_v1';

export default function App() {
  // Styles State initialized with localStorage or preset styles
  const [styles, setStyles] = useState<GarmentStyle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STYLES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return PRESET_STYLES;
  });

  const [activeStyleId, setActiveStyleId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (saved && styles.some((s) => s.id === saved)) return saved;
    } catch {
      // Fallback
    }
    return styles[0]?.id || PRESET_STYLES[0].id;
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('breakdown');

  // Selected Op for Time Study
  const [selectedOpIdForStudy, setSelectedOpIdForStudy] = useState<string>('');

  // View Mode: 'desktop' or 'mobile'
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VIEW_MODE);
      if (saved === 'mobile' || saved === 'desktop') return saved;
    } catch {
      // Fallback
    }
    return 'desktop';
  });

  // Modals state
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<Operation | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STYLES, JSON.stringify(styles));
    } catch {
      // Ignore
    }
  }, [styles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeStyleId);
    } catch {
      // Ignore
    }
  }, [activeStyleId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VIEW_MODE, viewMode);
    } catch {
      // Ignore
    }
  }, [viewMode]);

  // Current active style
  const activeStyle = useMemo(() => {
    return styles.find((s) => s.id === activeStyleId) || styles[0] || PRESET_STYLES[0];
  }, [styles, activeStyleId]);

  // If selectedOpIdForStudy is empty or invalid, default to first op
  useEffect(() => {
    if (!selectedOpIdForStudy && activeStyle.operations.length > 0) {
      setSelectedOpIdForStudy(activeStyle.operations[0].id);
    } else if (
      selectedOpIdForStudy &&
      !activeStyle.operations.some((o) => o.id === selectedOpIdForStudy) &&
      activeStyle.operations.length > 0
    ) {
      setSelectedOpIdForStudy(activeStyle.operations[0].id);
    }
  }, [activeStyle.operations, selectedOpIdForStudy]);

  const kpis = useMemo(() => {
    return calculateIEKPIs(activeStyle.operations, activeStyle.targetHourly);
  }, [activeStyle.operations, activeStyle.targetHourly]);

  // Operations CRUD
  const handleSaveOperation = (opData: Omit<Operation, 'id'>, editId?: string) => {
    setStyles((prev) =>
      prev.map((s) => {
        if (s.id !== activeStyle.id) return s;

        let updatedOps: Operation[];
        if (editId) {
          updatedOps = s.operations.map((o) => (o.id === editId ? { ...opData, id: editId } : o));
        } else {
          const newOp: Operation = {
            ...opData,
            id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            seq: s.operations.length + 1,
          };
          updatedOps = [...s.operations, newOp];
        }

        // Re-index sequences
        updatedOps = updatedOps.map((op, idx) => ({ ...op, seq: idx + 1 }));
        return { ...s, operations: updatedOps };
      })
    );
  };

  const handleDeleteOperation = (opId: string) => {
    setStyles((prev) =>
      prev.map((s) => {
        if (s.id !== activeStyle.id) return s;
        const remaining = s.operations.filter((o) => o.id !== opId);
        const resequenced = remaining.map((op, idx) => ({ ...op, seq: idx + 1 }));
        return { ...s, operations: resequenced };
      })
    );
  };

  const handleDuplicateOperation = (op: Operation) => {
    setStyles((prev) =>
      prev.map((s) => {
        if (s.id !== activeStyle.id) return s;
        const newOp: Operation = {
          ...op,
          id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: `${op.name} (Copy)`,
          seq: s.operations.length + 1,
        };
        const updated = [...s.operations, newOp].map((o, idx) => ({ ...o, seq: idx + 1 }));
        return { ...s, operations: updated };
      })
    );
  };

  const handleMoveOperation = (opId: string, direction: 'up' | 'down') => {
    setStyles((prev) =>
      prev.map((s) => {
        if (s.id !== activeStyle.id) return s;
        const index = s.operations.findIndex((o) => o.id === opId);
        if (index === -1) return s;
        if (direction === 'up' && index === 0) return s;
        if (direction === 'down' && index === s.operations.length - 1) return s;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const copy = [...s.operations];
        const [moved] = copy.splice(index, 1);
        copy.splice(targetIndex, 0, moved);

        const resequenced = copy.map((o, idx) => ({ ...o, seq: idx + 1 }));
        return { ...s, operations: resequenced };
      })
    );
  };

  const handleApplyCalculatedSMV = (opId: string, newSmv: number) => {
    setStyles((prev) =>
      prev.map((s) => {
        if (s.id !== activeStyle.id) return s;
        return {
          ...s,
          operations: s.operations.map((o) => (o.id === opId ? { ...o, smv: newSmv } : o)),
        };
      })
    );
  };

  const handleUpdateOperations = (newOps: Operation[]) => {
    setStyles((prev) =>
      prev.map((s) => (s.id === activeStyle.id ? { ...s, operations: newOps } : s))
    );
  };

  const handleUpdateTargetHourly = (newTarget: number) => {
    setStyles((prev) =>
      prev.map((s) => (s.id === activeStyle.id ? { ...s, targetHourly: newTarget } : s))
    );
  };

  const handleUpdateStyleProduction = (
    targetHourly: number,
    workingHours: number,
    hourlyOutputs: number[],
    downtimeLogs: GarmentStyle['downtimeLogs']
  ) => {
    setStyles((prev) =>
      prev.map((s) =>
        s.id === activeStyle.id
          ? { ...s, targetHourly, workingHours, hourlyOutputs, downtimeLogs }
          : s
      )
    );
  };

  // Switch to time study tab for specific op
  const handleSwitchToTimeStudy = (opId: string) => {
    setSelectedOpIdForStudy(opId);
    setActiveTab('timestudy');
  };

  // Styles CRUD
  const handleCreateStyle = (newStyleData: Omit<GarmentStyle, 'id'>) => {
    const newStyle: GarmentStyle = {
      ...newStyleData,
      id: `style-${Date.now()}`,
    };
    setStyles((prev) => [...prev, newStyle]);
    setActiveStyleId(newStyle.id);
  };

  const handleDuplicateStyle = (styleId: string) => {
    const source = styles.find((s) => s.id === styleId);
    if (!source) return;

    const dup: GarmentStyle = {
      ...source,
      id: `style-${Date.now()}`,
      name: `${source.name} (Copy)`,
      styleCode: `${source.styleCode}-DUP`,
      operations: source.operations.map((o) => ({ ...o, id: `op-${Date.now()}-${Math.random()}` })),
    };
    setStyles((prev) => [...prev, dup]);
    setActiveStyleId(dup.id);
  };

  const handleDeleteStyle = (styleId: string) => {
    if (styles.length <= 1) return;
    setStyles((prev) => prev.filter((s) => s.id !== styleId));
    if (activeStyleId === styleId) {
      const remaining = styles.filter((s) => s.id !== styleId);
      if (remaining.length > 0) {
        setActiveStyleId(remaining[0].id);
      }
    }
  };

  const handleImportStyles = (imported: GarmentStyle[]) => {
    setStyles(imported);
    if (imported.length > 0) {
      setActiveStyleId(imported[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Wrapper based on ViewMode */}
      {viewMode === 'mobile' ? (
        /* Mobile Frame Mode - Centered shop floor phone frame */
        <div className="flex-1 flex items-center justify-center p-0 sm:py-6">
          <div className="w-full max-w-[480px] h-screen sm:h-[92vh] sm:max-h-[920px] bg-slate-950 sm:rounded-[36px] sm:border-8 sm:border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
            <Header
              activeStyle={activeStyle}
              onOpenStyleModal={() => setIsStyleModalOpen(true)}
              onOpenAddOpModal={() => {
                setEditingOp(null);
                setIsOpModalOpen(true);
              }}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode('desktop')}
              onExportPDF={() => exportBulletinToPDF(activeStyle)}
            />

            <main className="flex-1 overflow-y-auto p-3 sm:p-4 pb-20 custom-scrollbar">
              {activeTab === 'breakdown' && (
                <BulletinTab
                  style={activeStyle}
                  onOpenAddOp={() => {
                    setEditingOp(null);
                    setIsOpModalOpen(true);
                  }}
                  onEditOp={(op) => {
                    setEditingOp(op);
                    setIsOpModalOpen(true);
                  }}
                  onDeleteOp={handleDeleteOperation}
                  onDuplicateOp={handleDuplicateOperation}
                  onMoveOp={handleMoveOperation}
                  onSwitchToTimeStudy={handleSwitchToTimeStudy}
                  onUpdateTargetHourly={handleUpdateTargetHourly}
                />
              )}

              {activeTab === 'timestudy' && (
                <TimeStudyTab
                  style={activeStyle}
                  selectedOpId={selectedOpIdForStudy}
                  onSelectOpId={setSelectedOpIdForStudy}
                  onApplyCalculatedSMV={handleApplyCalculatedSMV}
                />
              )}

              {activeTab === 'balancing' && (
                <LineBalancingTab
                  style={activeStyle}
                  onUpdateOperations={handleUpdateOperations}
                />
              )}

              {activeTab === 'production' && (
                <ProductionTab
                  style={activeStyle}
                  onUpdateStyleProduction={handleUpdateStyleProduction}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsTab
                  style={activeStyle}
                  allStyles={styles}
                  onImportStyles={handleImportStyles}
                />
              )}
            </main>

            <BottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              bottlenecksCount={kpis.bottleneckCount}
            />
          </div>
        </div>
      ) : (
        /* Full Responsive Desktop / Multi-Column Engineering View */
        <div className="flex-1 flex flex-col min-h-screen">
          <Header
            activeStyle={activeStyle}
            onOpenStyleModal={() => setIsStyleModalOpen(true)}
            onOpenAddOpModal={() => {
              setEditingOp(null);
              setIsOpModalOpen(true);
            }}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode('mobile')}
            onExportPDF={() => exportBulletinToPDF(activeStyle)}
          />

          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 flex flex-col">
            {activeTab === 'breakdown' && (
              <BulletinTab
                style={activeStyle}
                onOpenAddOp={() => {
                  setEditingOp(null);
                  setIsOpModalOpen(true);
                }}
                onEditOp={(op) => {
                  setEditingOp(op);
                  setIsOpModalOpen(true);
                }}
                onDeleteOp={handleDeleteOperation}
                onDuplicateOp={handleDuplicateOperation}
                onMoveOp={handleMoveOperation}
                onSwitchToTimeStudy={handleSwitchToTimeStudy}
                onUpdateTargetHourly={handleUpdateTargetHourly}
              />
            )}

            {activeTab === 'timestudy' && (
              <TimeStudyTab
                style={activeStyle}
                selectedOpId={selectedOpIdForStudy}
                onSelectOpId={setSelectedOpIdForStudy}
                onApplyCalculatedSMV={handleApplyCalculatedSMV}
              />
            )}

            {activeTab === 'balancing' && (
              <LineBalancingTab
                style={activeStyle}
                onUpdateOperations={handleUpdateOperations}
              />
            )}

            {activeTab === 'production' && (
              <ProductionTab
                style={activeStyle}
                onUpdateStyleProduction={handleUpdateStyleProduction}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsTab
                style={activeStyle}
                allStyles={styles}
                onImportStyles={handleImportStyles}
              />
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 z-40 pb-2">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-md">
              <BottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                bottlenecksCount={kpis.bottleneckCount}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <StyleModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        styles={styles}
        activeStyleId={activeStyle.id}
        onSelectStyle={(s) => setActiveStyleId(s.id)}
        onCreateStyle={handleCreateStyle}
        onDuplicateStyle={handleDuplicateStyle}
        onDeleteStyle={handleDeleteStyle}
      />

      <OperationModal
        isOpen={isOpModalOpen}
        onClose={() => {
          setIsOpModalOpen(false);
          setEditingOp(null);
        }}
        onSave={handleSaveOperation}
        editingOp={editingOp}
        totalOpsCount={activeStyle.operations.length}
      />
    </div>
  );
}
