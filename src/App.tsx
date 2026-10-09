/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OpticalVisualizer } from './components/OpticalVisualizer';
import { CabinetSpecifier } from './components/CabinetSpecifier';
import { CompatibilityEngine } from './components/CompatibilityEngine';
import { ProductDirectory } from './components/ProductDirectory';
import { HardwarePortSpecifier } from './components/HardwarePortSpecifier';
import { CalibrationModal } from './components/CalibrationModal';
import { ExportModal } from './components/ExportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DashboardPage } from './components/DashboardPage';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  LayoutGrid,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Home
} from 'lucide-react';

export type PageId = 'dashboard' | 'optical' | 'cabinet' | 'compatibility' | 'directory' | 'ports';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [currentPitch, setCurrentPitch] = useState<number>(2.6);
  const [screenPpi, setScreenPpi] = useState<number>(96);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [syncedResolution, setSyncedResolution] = useState<{ width: number; height: number }>({
    width: 3840,
    height: 2160
  });

  // URL Hash synchronization for multi-page navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
      const validPages: PageId[] = ['dashboard', 'optical', 'cabinet', 'compatibility', 'directory', 'ports'];
      if (validPages.includes(hash as PageId)) {
        setCurrentPage(hash as PageId);
      } else if (!hash) {
        setCurrentPage('dashboard');
      }
    };

    // Initial check on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: PageId) => {
    setCurrentPage(page);
    window.location.hash = page === 'dashboard' ? '#/' : `#/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleSyncToPortSpecifier = (w: number, h: number) => {
    setSyncedResolution({ width: w, height: h });
    showToast(`Canvas resolution (${w} × ${h} px) synced to Hardware Port Specifier`);
    navigateTo('ports');
  };

  const commonPitches = [0.93, 1.25, 1.56, 1.87, 2.6, 3.91];

  const workflowSteps: { id: PageId; title: string; stepNum: number }[] = [
    { id: 'optical', title: 'Optical Physics & Acuity', stepNum: 1 },
    { id: 'cabinet', title: 'Cabinet Architecture & Indoor Specifier', stepNum: 2 },
    { id: 'compatibility', title: 'Protocol & Compatibility Engine', stepNum: 3 },
    { id: 'directory', title: '121+ Hardware Directory', stepNum: 4 },
    { id: 'ports', title: 'Hardware Port & BOM Specifier', stepNum: 5 }
  ];

  const currentStepIndex = workflowSteps.findIndex((s) => s.id === currentPage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* Modern Header Navigation */}
        <Header
          onOpenCalibration={() => setIsCalibrationOpen(true)}
          onOpenExportModal={() => setIsExportOpen(true)}
          activeTab={currentPage}
          onSelectTab={(tab) => navigateTo(tab as PageId)}
        />

        {/* Page Container */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 flex-1 w-full pb-24 lg:pb-8">
          {/* ========================================================
              PAGE 0: EXECUTIVE DASHBOARD
              ======================================================== */}
          {currentPage === 'dashboard' && (
            <DashboardPage
              currentPitch={currentPitch}
              onPitchChange={setCurrentPitch}
              wallResolution={syncedResolution}
              onNavigate={(page) => navigateTo(page as PageId)}
              onOpenExportModal={() => setIsExportOpen(true)}
              onOpenCalibration={() => setIsCalibrationOpen(true)}
            />
          )}

          {/* ========================================================
              PAGE 1: OPTICAL PHYSICS & RETINAL ACUITY
              ======================================================== */}
          {currentPage === 'optical' && (
            <>
              {/* Page Header Banner */}
              <section id="optical-page-header" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <button
                      onClick={() => navigateTo('dashboard')}
                      className="hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-amber-400 font-bold">Step 1: Optical Physics &amp; Acuity</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    LED Optical Physics, PPI &amp; Retinal Acuity Visualizer
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 px-1">Pitch:</span>
                  {commonPitches.map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPitch(p)}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                        Math.abs(currentPitch - p) < 0.05
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      P{p}
                    </button>
                  ))}
                </div>
              </section>

              {/* Tool Component */}
              <OpticalVisualizer
                currentPitch={currentPitch}
                onPitchChange={setCurrentPitch}
                onOpenCalibration={() => setIsCalibrationOpen(true)}
                screenPpi={screenPpi}
              />

              {/* Page Footer Step Navigation */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Dashboard</span>
                </button>

                <div className="font-mono text-slate-400 text-xs hidden sm:block text-center">
                  Step 1 of 5: Optical Physics
                </div>

                <button
                  onClick={() => navigateTo('cabinet')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
                >
                  <span>Next: Cabinet Architecture</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* ========================================================
              PAGE 2: CABINET ARCHITECTURE & INDOOR SPECIFIER
              ======================================================== */}
          {currentPage === 'cabinet' && (
            <>
              {/* Page Header Section (Section:nth-of-type(1) of main) */}
              <section id="cabinet-page-header" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <button
                      onClick={() => navigateTo('dashboard')}
                      className="hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-blue-400 font-bold">Step 2: Cabinet Architecture &amp; HVAC</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    LED Cabinet Architecture, Electrical &amp; HVAC Estimator
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 px-1">Pitch:</span>
                  {commonPitches.map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPitch(p)}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                        Math.abs(currentPitch - p) < 0.05
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      P{p}
                    </button>
                  ))}
                </div>
              </section>

              {/* Tool Component (Section#cabinet-specifier is Section:nth-of-type(2) of main) */}
              <CabinetSpecifier
                currentPitch={currentPitch}
                onSyncToPortSpecifier={handleSyncToPortSpecifier}
                viewerDistanceM={3.5}
              />

              {/* Page Footer Step Navigation */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => navigateTo('optical')}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous: Optical Physics</span>
                </button>

                <div className="font-mono text-slate-400 text-xs hidden sm:block text-center">
                  Step 2 of 5: Cabinet Mechanics
                </div>

                <button
                  onClick={() => navigateTo('compatibility')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
                >
                  <span>Next: Protocol Matrix</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* ========================================================
              PAGE 3: NOVASTAR PROTOCOL & COMPATIBILITY MATRIX
              ======================================================== */}
          {currentPage === 'compatibility' && (
            <>
              {/* Page Header Banner */}
              <section id="compatibility-page-header" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <button
                      onClick={() => navigateTo('dashboard')}
                      className="hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-purple-400 font-bold">Step 3: NovaStar Ecosystem Compatibility</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Interactive NovaStar Compatibility &amp; Protocol Engine
                  </h1>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-800/60 text-blue-300 font-bold">
                    COEX 5G vs 1G VMP Ecosystem
                  </span>
                </div>
              </section>

              {/* Tool Component */}
              <CompatibilityEngine />

              {/* Page Footer Step Navigation */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => navigateTo('cabinet')}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous: Cabinet Architecture</span>
                </button>

                <div className="font-mono text-slate-400 text-xs hidden sm:block text-center">
                  Step 3 of 5: Protocol Matrix
                </div>

                <button
                  onClick={() => navigateTo('directory')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
                >
                  <span>Next: 121+ Hardware Directory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* ========================================================
              PAGE 4: COMPREHENSIVE PRODUCT DIRECTORY (121 MODELS)
              ======================================================== */}
          {currentPage === 'directory' && (
            <>
              {/* Page Header Banner */}
              <section id="directory-page-header" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <button
                      onClick={() => navigateTo('dashboard')}
                      className="hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-emerald-400 font-bold">Step 4: Hardware Ecosystem Directory</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Comprehensive NovaStar Product Ecosystem Directory (121 Models)
                  </h1>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-300 font-bold">
                    121 Models Active
                  </span>
                </div>
              </section>

              {/* Tool Component */}
              <ProductDirectory />

              {/* Page Footer Step Navigation */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => navigateTo('compatibility')}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous: Protocol Matrix</span>
                </button>

                <div className="font-mono text-slate-400 text-xs hidden sm:block text-center">
                  Step 4 of 5: Hardware Catalog
                </div>

                <button
                  onClick={() => navigateTo('ports')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
                >
                  <span>Next: Hardware Port Specifier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* ========================================================
              PAGE 5: HARDWARE PORT & BOM SPECIFIER
              ======================================================== */}
          {currentPage === 'ports' && (
            <>
              {/* Page Header Banner */}
              <section id="ports-page-header" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <button
                      onClick={() => navigateTo('dashboard')}
                      className="hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-rose-400 font-bold">Step 5: Port Loading &amp; BOM Specifier</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    LED Display Hardware &amp; Port Requirement Specifier
                  </h1>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                  <span className="text-slate-400">Synced Canvas:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-800/60 text-amber-300 font-bold">
                    {syncedResolution.width} × {syncedResolution.height}
                  </span>
                </div>
              </section>

              {/* Tool Component */}
              <HardwarePortSpecifier
                initialWidth={syncedResolution.width}
                initialHeight={syncedResolution.height}
                currentPitch={currentPitch}
              />

              {/* Page Footer Step Navigation */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => navigateTo('directory')}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous: 121+ Directory</span>
                </button>

                <div className="font-mono text-slate-400 text-xs hidden sm:block text-center">
                  Step 5 of 5: BOM &amp; Ports
                </div>

                <button
                  onClick={() => navigateTo('dashboard')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
                >
                  <span>Finish &amp; Dashboard</span>
                  <Home className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-blue-600 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-blue-400/50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        screenPpi={screenPpi}
        onScreenPpiChange={setScreenPpi}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        currentPitch={currentPitch}
      />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="font-bold text-white text-sm block">
              NovaStar Display Controllers &amp; Optical Architecture Studio
            </span>
            <p className="leading-relaxed text-slate-400">
              Independent engineering reference for LED video wall system designers, staging engineers, and broadcast architects. Multi-page architecture eliminates scroll exhaustion while providing deep specifications for H Series Modular Splicers, COEX 5G/1G Ecosystem, VX Processors, and Receiving Cards.
            </p>
          </div>

          <div className="text-left md:text-right space-y-1 text-slate-400 font-mono text-[11px]">
            <div>Multi-Page Architecture: 5 Dedicated Engineering Workspaces</div>
            <div>PWA Offline Capable: Instant Local Service Worker Caching</div>
            <div>Engineering Standard: 60 PPD 20/20 Acuity &amp; NEC 80% Rule</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
