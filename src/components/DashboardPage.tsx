import React from 'react';
import {
  Eye,
  Calculator,
  Cpu,
  Server,
  Cable,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Zap,
  ShieldCheck,
  CheckCircle2,
  FileDown
} from 'lucide-react';

interface DashboardPageProps {
  currentPitch: number;
  onPitchChange: (pitch: number) => void;
  wallResolution: { width: number; height: number };
  onNavigate: (page: string) => void;
  onOpenExportModal: () => void;
  onOpenCalibration: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentPitch,
  onPitchChange,
  wallResolution,
  onNavigate,
  onOpenExportModal,
  onOpenCalibration
}) => {
  const commonPitches = [0.93, 1.25, 1.56, 1.87, 2.6, 3.91];

  const ppi = (25.4 / currentPitch).toFixed(1);
  const retinaDistanceM = ((currentPitch / 1000) * 3437.75).toFixed(1);
  const totalPixels = wallResolution.width * wallResolution.height;
  const totalMegapixels = (totalPixels / 1000000).toFixed(2);

  const featureCards = [
    {
      id: 'optical',
      step: 'Step 01',
      title: 'Optical Physics & Retinal Acuity',
      badge: 'Visual Physics',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800/60',
      icon: Eye,
      iconColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      description:
        'Compute 20/20 retinal acuity distances, angular subtense, microscopic pixel pitch loupe, and optical Moire camera artifact simulation.',
      stats: [
        { label: 'Pixel Pitch', value: `P${currentPitch} mm` },
        { label: 'Pixel Density', value: `${ppi} PPI` },
        { label: 'Retina Distance', value: `${retinaDistanceM} meters` }
      ],
      action: 'Launch Optical Studio'
    },
    {
      id: 'cabinet',
      step: 'Step 02',
      title: 'Cabinet Architecture & Indoor Specifier',
      badge: 'Mechanical & HVAC',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-800/60',
      icon: Calculator,
      iconColor: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
      description:
        'Specify indoor 16:9 MicroLED and modular formats, magnetic vacuum front extraction, fanless acoustic noise, drywall structural loads, and sensible HVAC cooling.',
      stats: [
        { label: 'Presets', value: '16:9 / 32:9 MicroLED' },
        { label: 'Service Tool', value: '100% Front Vacuum' },
        { label: 'Acoustics', value: '0 dBA Fanless Silent' }
      ],
      action: 'Configure Cabinet Wall'
    },
    {
      id: 'compatibility',
      step: 'Step 03',
      title: 'NovaStar Protocol & Compatibility Engine',
      badge: 'System Ecosystem',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800/60',
      icon: Cpu,
      iconColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
      description:
        'Verify hardware compatibility across COEX 5G Base-T and Traditional 1G ecosystems, H Series modular crossbars, and Armor/CA50 receiving cards.',
      stats: [
        { label: 'COEX 5G', value: '5 Gbps VMP Engine' },
        { label: 'Traditional 1G', value: 'NovaLCT .rcfgx' },
        { label: 'H Splicers', value: 'Pure Hardware FPGA' }
      ],
      action: 'Check Compatibility Matrix'
    },
    {
      id: 'directory',
      step: 'Step 04',
      title: 'Comprehensive Product Directory (121 Models)',
      badge: 'Hardware Catalog',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800/60',
      icon: Server,
      iconColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      description:
        'Search and filter all 121 complete NovaStar models: H Splicers, COEX Processors, VX All-in-Ones, Taurus media players, C1/C3/C5 consoles, and fiber links.',
      stats: [
        { label: 'Hardware Inventory', value: '121 Complete Models' },
        { label: 'Categories', value: '9 Product Lines' },
        { label: 'Specs', value: 'Physical I/O & Loads' }
      ],
      action: 'Browse Hardware Catalog'
    },
    {
      id: 'ports',
      step: 'Step 05',
      title: 'Hardware Port & Processing Specifier',
      badge: 'Engineering BOM',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800/60',
      icon: Cable,
      iconColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      description:
        'Calculate exact RJ45 Ethernet ports, 5G Base-T trunking, 10G optical fiber converters, and generate comprehensive PDF/Excel bills of materials.',
      stats: [
        { label: 'Wall Canvas', value: `${wallResolution.width} × ${wallResolution.height}` },
        { label: 'Pixel Load', value: `${totalMegapixels}M Pixels` },
        { label: 'Trunking', value: '1G / 5G / 10G Fiber' }
      ],
      action: 'Calculate Port Loading'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-blue-400 font-mono">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Page Engineering Workspace</span>
            </span>
            <span>·</span>
            <span>Zero Long Scrolling</span>
            <span>·</span>
            <span>5 Specialized Engineering Modules</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            NovaStar Display Controllers &amp; Optical Architecture Studio
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Independent engineering platform for LED video wall designers, AV integrators, and broadcast staging engineers. Seamlessly navigate between dedicated, distraction-free pages for optical acuity, cabinet mechanics, controller protocols, hardware inventory, and port distribution.
          </p>

          {/* Quick Pitch Ribbon */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <span>Quick Pitch Presets:</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {commonPitches.map((p) => (
                <button
                  key={p}
                  onClick={() => onPitchChange(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    Math.abs(currentPitch - p) < 0.05
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                      : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  P{p} mm
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('optical')}
              className="w-full sm:w-auto sm:ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:gap-3"
            >
              <span>Start Design Flow (Step 1)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Project Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Active Pixel Pitch
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono block mt-1">
            P{currentPitch} mm
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {ppi} PPI · {retinaDistanceM}m Retina Acuity
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Canvas Resolution
          </span>
          <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono block mt-1">
            {wallResolution.width} × {wallResolution.height}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {totalMegapixels}M Pixels (4K Class)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Hardware Catalog
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono block mt-1">
            121 Models
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            H Splicers, COEX, VX, Consoles
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            PWA Offline Status
          </span>
          <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono block mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Ready</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Zero Network Needed
          </span>
        </div>
      </div>

      {/* 5 Distinct Module Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">
              Specialized Engineering Modules (Individual Pages)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any page below to launch its full-screen, dedicated tool interface with zero scrollbar friction.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-2xl hover:shadow-blue-950/40 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors group-hover:scale-105 ${card.iconColor}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {card.step}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${card.badgeColor}`}
                      >
                        {card.badge}
                      </span>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {card.description}
                    </p>
                  </div>

                  {/* Micro Stats */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    {card.stats.map((st, i) => (
                      <div key={i} className="text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block truncate">
                          {st.label}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-200 block truncate mt-0.5">
                          {st.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button Action */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                  <span>{card.action}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
