import React, { useState, useEffect } from 'react';
import {
  Eye,
  Calculator,
  Layers,
  FileDown,
  Cpu,
  Server,
  Cable,
  LayoutGrid,
  Menu,
  X,
  Sparkles,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenCalibration: () => void;
  onOpenExportModal: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCalibration,
  onOpenExportModal,
  activeTab = 'dashboard',
  onSelectTab
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (tabId: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subtitle: 'Overview & Presets',
      icon: LayoutGrid,
      color: 'text-blue-400',
      badge: 'Home'
    },
    {
      id: 'optical',
      label: 'Optical Acuity',
      subtitle: 'Retinal Physics & PPI',
      icon: Eye,
      color: 'text-amber-400',
      badge: 'Step 1'
    },
    {
      id: 'cabinet',
      label: 'Cabinet & HVAC',
      subtitle: 'Mechanical & Power',
      icon: Calculator,
      color: 'text-blue-400',
      badge: 'Step 2'
    },
    {
      id: 'compatibility',
      label: 'Compatibility',
      subtitle: 'COEX 5G vs 1G Matrix',
      icon: Cpu,
      color: 'text-purple-400',
      badge: 'Step 3'
    },
    {
      id: 'directory',
      label: '121+ Directory',
      subtitle: 'Hardware Catalog',
      icon: Server,
      color: 'text-emerald-400',
      badge: 'Step 4'
    },
    {
      id: 'ports',
      label: 'Hardware BOM',
      subtitle: 'Port & Cable Specifier',
      icon: Cable,
      color: 'text-rose-400',
      badge: 'Step 5'
    }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-16">
            {/* Zone 1: Wordmark & Logo */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <button
                onClick={() => handleNavClick('dashboard')}
                className="flex items-center gap-2 sm:gap-2.5 text-left group min-w-0"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-white shadow shadow-blue-900/40 group-hover:scale-105 transition-transform shrink-0">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-base font-bold tracking-tight text-white truncate group-hover:text-blue-400 transition-colors">
                    NovaStar LED Studio
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono -mt-0.5 hidden md:block">
                    Multi-Page Architecture System
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Desktop Navigation Bar */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-300">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleNavClick(item.id, e)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-900/50'
                        : 'hover:text-white hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.color}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions + Mobile Menu Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Desktop / Tablet utilities */}
              <div className="hidden sm:flex items-center gap-2">
                <PWAInstallButton />
                <button
                  onClick={onOpenExportModal}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden md:inline">Export BOM</span>
                </button>
                <button
                  onClick={onOpenCalibration}
                  className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <span>1:1 Calibrate</span>
                </button>
              </div>

              {/* Mobile quick calibrate icon (compact) */}
              <button
                onClick={onOpenCalibration}
                className="sm:hidden p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-xs font-medium transition-colors"
                title="1:1 Screen Calibration"
                aria-label="Calibrate Screen"
              >
                <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              </button>

              {/* HIGH VISIBILITY MOBILE MENU BUTTON - Guaranteed visible on all mobile viewports */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className={`lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all font-bold text-xs shadow-md border ${
                  mobileMenuOpen
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border-blue-500/50'
                }`}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />}
                <span className="font-semibold">{mobileMenuOpen ? 'Close' : 'Menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* FULL MOBILE NAVIGATION DRAWER & MODAL */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-start">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-Down Drawer Container */}
            <div className="relative z-10 bg-slate-900 border-b border-slate-800 shadow-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">NovaStar Architecture</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Select Engineering Module</p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Grid / List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Workspace Pages
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={(e) => handleNavClick(item.id, e)}
                        className={`p-3 rounded-xl transition-all flex items-center justify-between text-left border ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-lg shadow-blue-600/30'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-blue-700 text-white' : 'bg-slate-900 border border-slate-800'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{item.label}</div>
                            <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400 font-mono'}`}>
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                            isActive ? 'bg-blue-800 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Utilities &amp; Tools
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCalibration();
                    }}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors flex items-center gap-2.5"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">1:1 Calibrate</div>
                      <div className="text-[10px] text-slate-400 font-mono">Screen ruler &amp; PPI</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenExportModal();
                    }}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors flex items-center gap-2.5"
                  >
                    <FileDown className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Export BOM</div>
                      <div className="text-[10px] text-slate-400 font-mono">PDF &amp; Excel Specs</div>
                    </div>
                  </button>
                </div>

                <div className="pt-1">
                  <PWAInstallButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE BOTTOM NAVIGATION DOCK (Persistent thumb-reachable mobile bar) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 lg:hidden px-2 py-1.5 shadow-2xl flex items-center justify-around"
      >
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => handleNavClick('optical')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeTab === 'optical' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Optical</span>
        </button>

        <button
          onClick={() => handleNavClick('cabinet')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeTab === 'cabinet' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Cabinet</span>
        </button>

        <button
          onClick={() => handleNavClick('ports')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            activeTab === 'ports' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cable className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">BOM</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
            mobileMenuOpen ? 'text-white bg-blue-600 px-3' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </nav>
    </>
  );
};



