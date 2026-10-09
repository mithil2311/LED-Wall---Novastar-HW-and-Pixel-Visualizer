import React from 'react';
import {
  Eye,
  Calculator,
  Cpu,
  Server,
  Cable,
  LayoutGrid,
  ChevronUp,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Maximize2,
  Check
} from 'lucide-react';

export type WorkspaceTabId = 'overview' | 'optical' | 'cabinet' | 'compatibility' | 'directory' | 'ports';

interface WorkspaceControllerProps {
  activeTab: WorkspaceTabId;
  onSelectTab: (tab: WorkspaceTabId) => void;
  isSingleToolMode: boolean;
  onToggleViewMode: () => void;
  currentPitch: number;
  onPitchChange: (pitch: number) => void;
  wallResolution: { width: number; height: number };
  allExpanded?: boolean;
  onToggleExpandAll?: () => void;
}

export const WORKSPACE_TABS = [
  {
    id: 'overview' as WorkspaceTabId,
    name: 'Executive Studio',
    shortName: 'Overview',
    description: 'All-in-one studio overview with collapsible engineering tools',
    icon: LayoutGrid,
    badge: 'Hub',
    color: 'blue'
  },
  {
    id: 'optical' as WorkspaceTabId,
    name: 'Optical Physics & Acuity',
    shortName: 'Optical',
    description: 'Retinal Acuity, PPI, 20/20 Vision Limits, 3D Venue & Moire',
    icon: Eye,
    badge: 'Physics',
    color: 'amber'
  },
  {
    id: 'cabinet' as WorkspaceTabId,
    name: 'Cabinet & HVAC Architect',
    shortName: 'Cabinet',
    description: 'Indoor Fine-Pitch, Golden Ratio 16:9, MicroLED, Power & Rigging',
    icon: Calculator,
    badge: 'Mechanics',
    color: 'cyan'
  },
  {
    id: 'compatibility' as WorkspaceTabId,
    name: 'Protocol & Controller Matrix',
    shortName: 'Compatibility',
    description: 'COEX 5G vs Traditional 1G, H-Series Modular & Receiving Cards',
    icon: Cpu,
    badge: 'Protocol',
    color: 'purple'
  },
  {
    id: 'directory' as WorkspaceTabId,
    name: 'Hardware Directory (121 Models)',
    shortName: '121+ Hardware',
    description: 'Complete NovaStar hardware ecosystem directory with filter & specs',
    icon: Server,
    badge: '121 Models',
    color: 'emerald'
  },
  {
    id: 'ports' as WorkspaceTabId,
    name: 'Port & Processing Specifier',
    shortName: 'Port Spec',
    description: 'RJ45, 5G Base-T & 10G Optical Pipeline Bandwidth & Port Loading',
    icon: Cable,
    badge: 'BOM',
    color: 'rose'
  }
];

export const WorkspaceController: React.FC<WorkspaceControllerProps> = ({
  activeTab,
  onSelectTab,
  isSingleToolMode,
  onToggleViewMode,
  currentPitch,
  onPitchChange,
  wallResolution,
  allExpanded,
  onToggleExpandAll
}) => {
  const commonPitches = [0.93, 1.25, 1.56, 1.87, 2.6, 3.91];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      {/* Top Workspace Command Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          {/* Left: Quick Pitch & Canvas Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>Canvas Pitch:</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {commonPitches.map((p) => (
                <button
                  key={p}
                  onClick={() => onPitchChange(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                    Math.abs(currentPitch - p) < 0.05
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  P{p}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800 text-slate-400 font-mono text-[11px]">
              <span>Resolution:</span>
              <span className="text-amber-400 font-bold">
                {wallResolution.width} × {wallResolution.height}
              </span>
            </div>
          </div>

          {/* Right: View Mode Toggle */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            {activeTab === 'overview' && onToggleExpandAll && (
              <button
                onClick={onToggleExpandAll}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                title={allExpanded ? 'Collapse all tool sections' : 'Expand all tool sections'}
              >
                {allExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3 text-slate-400" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                    <span>Expand All</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onToggleViewMode}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1.5 shadow-sm ${
                isSingleToolMode
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 hover:bg-blue-600/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>
                {isSingleToolMode ? 'Focused Tool Mode (No Scroll)' : 'Studio All-Tools Mode'}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Selection Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3">
          {WORKSPACE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-left group relative ${
                  isActive
                    ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500 shadow-md shadow-blue-950/40'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                      isActive
                        ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </div>

                <span
                  className={`text-xs font-bold block leading-tight ${
                    isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {tab.shortName}
                </span>

                <span className="text-[10px] text-slate-500 truncate w-full block mt-0.5 font-medium">
                  {tab.name}
                </span>

                {isActive && (
                  <div className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Navigation Pill (Quick Jump Dock) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 bg-slate-900/95 border border-slate-700/80 rounded-full shadow-2xl backdrop-blur-lg text-xs">
        {WORKSPACE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onSelectTab(tab.id);
                if (!isSingleToolMode && tab.id !== 'overview') {
                  const el = document.getElementById(
                    tab.id === 'optical'
                      ? 'visualizer'
                      : tab.id === 'cabinet'
                      ? 'cabinet-specifier'
                      : tab.id === 'compatibility'
                      ? 'compatibility'
                      : tab.id === 'directory'
                      ? 'directory'
                      : 'port-specifier'
                  );
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              title={tab.name}
              className={`p-2 rounded-full transition-all relative flex items-center justify-center ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {isActive && (
                <span className="sr-only">(Active: {tab.name})</span>
              )}
            </button>
          );
        })}

        <div className="w-[1px] h-4 bg-slate-700 mx-1" />

        <button
          onClick={scrollToTop}
          title="Scroll to top"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
