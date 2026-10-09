import React, { useState } from 'react';
import { Network, Cpu, FileText, Check, Copy, Sparkles, ShieldAlert, ArrowDown } from 'lucide-react';
import { PortSpecifierResult } from '../types/novastar';

interface HardwarePortSpecifierProps {
  initialWidth?: number;
  initialHeight?: number;
  currentPitch: number;
}

export const HardwarePortSpecifier: React.FC<HardwarePortSpecifierProps> = ({
  initialWidth = 3840,
  initialHeight = 2160,
  currentPitch
}) => {
  const [width, setWidth] = useState<number>(initialWidth);
  const [height, setHeight] = useState<number>(initialHeight);
  const [frameRate, setFrameRate] = useState<number>(60);
  const [colorDepth, setColorDepth] = useState<number>(8);
  const [redundancy, setRedundancy] = useState<number>(1); // 1 = simplex, 2 = 1:1 backup loop
  const [appProfile, setAppProfile] = useState<'standard' | 'broadcast' | 'xr' | 'outdoor' | 'corporate'>('xr');
  const [copied, setCopied] = useState<boolean>(false);

  React.useEffect(() => {
    setWidth(initialWidth);
    setHeight(initialHeight);
  }, [initialWidth, initialHeight]);

  // Quick resolution presets
  const setPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  };

  // Math engine
  const totalPixels = width * height;
  const megapixels = totalPixels / 1000000;

  // Bandwidth de-rating
  let bitFactor = 1.0;
  if (colorDepth === 10 || colorDepth === 12) {
    bitFactor = 0.5; // 50% de-rating for 10-bit and 12-bit
  }

  const fpsFactor = 60 / frameRate;
  const portCapacity1G = Math.floor(650000 * fpsFactor * bitFactor);
  const portCapacity5G = Math.floor(3250000 * fpsFactor * bitFactor);

  const primary1G = Math.max(1, Math.ceil(totalPixels / portCapacity1G));
  const primary5G = Math.max(1, Math.ceil(totalPixels / portCapacity5G));

  const total1G = primary1G * redundancy;
  const total5G = primary5G * redundancy;

  const cableReductionPct = Math.max(0, Math.round((1 - primary5G / primary1G) * 100));
  const uncompressedGbps = ((totalPixels * frameRate * (colorDepth * 3)) / 1000000000).toFixed(2);

  // Optical trunks
  const opt10GTrunks = Math.ceil(primary1G / 10);
  const opt40GTrunks = Math.ceil(primary5G / 8);

  // Estimated panels based on current pitch
  const approxPanelArea = totalPixels * ((currentPitch / 1000) * (currentPitch / 1000));
  const approxPanels = Math.max(1, Math.round(approxPanelArea / 0.25));

  // BOM Recommendations
  let recommendedController = '';
  let controllerSeries = '';
  let controllerDetails = '';
  let recommendedReceivingCards = '';
  let cardDetails = '';
  let transceivers = '';
  let software = '';

  if (appProfile === 'corporate') {
    if (megapixels > 8.8) {
      recommendedController = 'TU4K Pro Flagship Conference Presentation Hub';
      controllerSeries = 'Enterprise Meeting & Presentation Platform';
      controllerDetails =
        '16x Gigabit RJ45 outputs (8.8M px), native 4K wireless casting, Type-C reverse charging, interactive electronic whiteboard.';
      recommendedReceivingCards = 'AT30 or Armor A5s+ Fine-Pitch Receiving Cards';
      cardDetails = 'Fine-pitch commercial board-to-board card engineered for boardroom cabinets.';
      transceivers = 'Wireless screen projection dongles, HDMI 2.0 loop';
      software = 'Android 11 OS / NovaLCT';
    } else {
      recommendedController = 'TU20 Pro Enterprise Meeting Room Processor';
      controllerSeries = 'Enterprise Meeting & Presentation Platform';
      controllerDetails =
        '6x Gigabit RJ45 outputs (3.9M px), Type-C reverse charging, DSP echo cancellation, 4-way wireless screen casting.';
      recommendedReceivingCards = 'AT20 / AT30 Fine-Pitch Receiving Cards';
      cardDetails = 'Compact board-to-board card engineered for ultra-thin indoor conference LED.';
      transceivers = 'Wireless screen transmitters, Type-C 65W charging cables';
      software = 'Android 11 OS / NovaLCT';
    }
  } else if (appProfile === 'xr' || appProfile === 'broadcast') {
    if (megapixels > 30.0) {
      recommendedController = 'CX80 Pro (COEX 5G 8K Flagship)';
      controllerSeries = 'COEX 5G Ultra VMP Platform';
      controllerDetails =
        'Drives up to 35.3M pixels natively with 16x 5G Base-T outputs, sub-1ms buffer delay, Genlock sync, and 240Hz frame rates.';
      recommendedReceivingCards = 'CA50E / XA50 Pro (COEX 5G Base-T)';
      cardDetails =
        'Direct 5 Gbps copper PHY with Shutter Fit camera adaptation and Dynamic Booster grayscale engine.';
      transceivers = `${opt40GTrunks}x CVT8-5GS 40G QSFP+ Optical Transceiver, Genlock distribution amplifier`;
      software = 'Vision Management Platform (VMP)';
    } else if (megapixels > 8.5) {
      recommendedController = 'MX40 Pro (1G Flagship) or CX40 Pro (5G Base-T)';
      controllerSeries = 'COEX Virtual Production Flagship';
      controllerDetails =
        'Supports 4K multi-layer compositing, 3D LUT camera color calibration, and sub-frame latency.';
      recommendedReceivingCards = 'Armor A10s Pro (1G) or CA50E (5G Base-T)';
      cardDetails =
        'Flagship 22-bit+ grayscale depth with thermal compensation and camera shutter alignment.';
      transceivers = `${opt10GTrunks}x CVT10 Pro-S Optical Fiber Converter, Light Sensor NS060`;
      software = 'Vision Management Platform (VMP)';
    } else {
      recommendedController = 'MX30 or MX20 (COEX 1G VMP)';
      controllerSeries = 'COEX 1G Studio Processor';
      controllerDetails =
        'Sub-frame latency, 3-layer video compositing, and native VMP color management.';
      recommendedReceivingCards = 'Armor A8s-N or Armor A10s Pro';
      cardDetails = 'High-density board-to-board header with 18-bit+ grayscale.';
      transceivers = 'CVT10 Pro-S 10G Optical Converter';
      software = 'Vision Management Platform (VMP)';
    }
  } else {
    // Standard Commercial / Command Center
    if (megapixels > 65.0) {
      recommendedController = 'H15 / H20 Modular Splicer Chassis';
      controllerSeries = 'H Series FPGA Crossbar Matrix';
      controllerDetails = `Equipped with ${Math.ceil(
        primary1G / 16
      )}x 16-channel RJ45 output cards and multi-screen canvas segmentation.`;
      recommendedReceivingCards = 'Armor A5s+ or MRV416 Receiving Cards';
      cardDetails = 'Configured via standard .rcfgx files through embedded Web GUI.';
      transceivers = 'Redundant Power Supply Modules, MFN300 Auto-Power Relays';
      software = 'Integrated FPGA Web GUI';
    } else if (megapixels > 25.0) {
      recommendedController = 'H5 / H6 / H9 Modular Splicer Chassis';
      controllerSeries = 'H Series FPGA Crossbar Matrix';
      controllerDetails = `Modular video wall splicer equipped with ${Math.ceil(
        primary1G / 16
      )}x 16-channel RJ45 output cards.`;
      recommendedReceivingCards = 'MRV416, DH7516-N, or Armor A5s+';
      cardDetails = 'Standard commercial HUB75 or board-to-board receiving cards.';
      transceivers = 'CVT10 Pro-S 10G Fiber Transceivers';
      software = 'Integrated FPGA Web GUI';
    } else if (megapixels > 10.0) {
      recommendedController = 'VX2000 Pro Presentation Processor';
      controllerSeries = 'VX Pro All-in-One Presentation Platform';
      controllerDetails =
        '20x Gigabit Ethernet ports, 12 independent 2K windows, 4K input stages.';
      recommendedReceivingCards = 'MRV416 or DH7516-N Commercial Cards';
      cardDetails = 'Standard HUB75 headers with point-by-point calibration.';
      transceivers = 'CVT10 Pro-S Optical Converters';
      software = 'NovaLCT / Unico';
    } else if (megapixels > 3.9) {
      recommendedController = 'VX1000 Pro All-in-One Processor';
      controllerSeries = 'All-in-One LED Video Processor';
      controllerDetails =
        '10x Gigabit outputs, 4K scaling engine, NovaLCT / V-Can software control.';
      recommendedReceivingCards = 'MRV328, MRV416, or DH7508 Commercial Cards';
      cardDetails = 'Integrated HUB75 headers with auto-calibration.';
      transceivers = 'CAT6A Shielded Drops';
      software = 'NovaLCT / Unico';
    } else {
      recommendedController = 'VX400 / VX600 All-in-One Processor';
      controllerSeries = 'Compact Commercial Controller';
      controllerDetails =
        '4x-6x Gigabit Ethernet outputs with front-panel input switching and video scaling.';
      recommendedReceivingCards = 'MRV208 / MRV412 or DH418 Series Cards';
      cardDetails = 'Standard commercial HUB75 receiving cards.';
      transceivers = 'Standard CAT6 UTP Cables';
      software = 'NovaLCT / Unico';
    }
  }

  // Copy BOM to clipboard
  const handleCopyBom = () => {
    const text = `NOVASTAR SYSTEM HARDWARE BILL OF MATERIALS (BOM)
Canvas Resolution: ${width} × ${height} (${megapixels.toFixed(2)} Megapixels)
Signal Profile: ${frameRate}Hz, ${colorDepth}-Bit RGB (${uncompressedGbps} Gbps)
Cable Redundancy: ${redundancy === 2 ? '1:1 Hot Backup Loop' : 'Simplex Primary'}
Application: ${appProfile.toUpperCase()}

RECOMMENDED CONTROLLER:
- Model: ${recommendedController}
- Series: ${controllerSeries}
- Architecture: ${controllerDetails}

RECEIVING CARDS:
- Model: ${recommendedReceivingCards}
- Specifications: ${cardDetails}
- Quantities: Approx. ${approxPanels} Panels (${primary1G} primary / ${total1G} total 1G ports OR ${primary5G} primary / ${total5G} total 5G ports)

OPTICAL FIBER & PERIPHERALS:
- Transceivers: ${transceivers}
- Cable Infrastructure: ${primary5G}x 5G Base-T or ${primary1G}x 1G RJ45 drops (${cableReductionPct}% reduction via 5G)

SOFTWARE MANAGEMENT:
- Suite: ${software}
Generated via NovaStar Product & Compatibility Explorer`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="port-specifier" className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
              <span>Transmission Engineering Engine</span>
              <span aria-hidden="true">·</span>
              <span>1G vs 5G Base-T Bandwidth Math</span>
              <span aria-hidden="true">·</span>
              <span>Automated NovaStar Hardware BOM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              LED Display Hardware & Port Requirement Specifier
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Calculate physical 1G and 5G Base-T Ethernet port loading, bandwidth de-rating by frame rate and color depth, cable drop counts, and automated NovaStar controller Bill of Materials (BOM).
            </p>
          </div>

          <button
            onClick={handleCopyBom}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow flex items-center justify-center gap-2 shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'BOM Copied to Clipboard!' : 'Copy Formatted BOM'}</span>
          </button>
        </div>

        {/* 2-Column Specifier Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Controls */}
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800/90 space-y-4 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
              1. Canvas Resolution & Signal Protocol
            </span>

            {/* Quick Resolution Buttons */}
            <div>
              <span className="block font-semibold text-slate-400 text-[10px] uppercase mb-1.5">
                Target Resolution Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setPreset(1920, 1080)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono"
                >
                  1080p FHD
                </button>
                <button
                  onClick={() => setPreset(3840, 2160)}
                  className="px-2 py-1 bg-blue-600 text-white rounded font-mono font-bold"
                >
                  4K UHD (3840×2160)
                </button>
                <button
                  onClick={() => setPreset(4096, 2160)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono"
                >
                  4K DCI (4096×2160)
                </button>
                <button
                  onClick={() => setPreset(7680, 4320)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono"
                >
                  8K Super UHD
                </button>
              </div>
            </div>

            {/* Width & Height inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Canvas Width (px)</label>
                <input
                  type="number"
                  step="16"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value) || 64)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono font-bold text-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Canvas Height (px)</label>
                <input
                  type="number"
                  step="16"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 64)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono font-bold text-slate-200"
                />
              </div>
            </div>

            {/* Frame Rate & Color Bit Depth */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Frame Rate</label>
                <select
                  value={frameRate}
                  onChange={(e) => setFrameRate(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-medium text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value={60} className="bg-slate-900 text-slate-100">60 Hz (Standard 1x)</option>
                  <option value={120} className="bg-slate-900 text-slate-100">120 Hz (High Speed 2x)</option>
                  <option value={144} className="bg-slate-900 text-slate-100">144 Hz (Esports 2.4x)</option>
                  <option value={240} className="bg-slate-900 text-slate-100">240 Hz (Ultra High Speed 4x)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Color Bit Depth</label>
                <select
                  value={colorDepth}
                  onChange={(e) => setColorDepth(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-medium text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value={8} className="bg-slate-900 text-slate-100">8-Bit SDR (Standard)</option>
                  <option value={10} className="bg-slate-900 text-slate-100">10-Bit HDR (50% De-rating)</option>
                  <option value={12} className="bg-slate-900 text-slate-100">12-Bit Cinema (50% De-rating)</option>
                </select>
              </div>
            </div>

            {/* Redundancy & Application Profile */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cable Redundancy</label>
                <select
                  value={redundancy}
                  onChange={(e) => setRedundancy(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-medium text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value={1} className="bg-slate-900 text-slate-100">Simplex (Primary Only)</option>
                  <option value={2} className="bg-slate-900 text-slate-100">1:1 Hot Backup (Dual Loop)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Application Target</label>
                <select
                  value={appProfile}
                  onChange={(e) => setAppProfile(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-medium text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="corporate" className="bg-slate-900 text-slate-100">Indoor Corporate / Boardroom (TU Series)</option>
                  <option value="xr" className="bg-slate-900 text-slate-100">xR Stage &amp; Virtual Production</option>
                  <option value="broadcast" className="bg-slate-900 text-slate-100">Live Broadcast &amp; TV Studio</option>
                  <option value="standard" className="bg-slate-900 text-slate-100">Commercial / Command Center</option>
                  <option value="outdoor" className="bg-slate-900 text-slate-100">Outdoor Stadium / Arena</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-900/50 text-blue-300 text-[11px] leading-relaxed">
              <strong>NovaStar Ethernet Rule:</strong> Nominal 1G capacity is 650,000 pixels @ 60Hz 8-bit. At 120Hz or 10/12-bit HDR, port capacity de-rates by 50% to 325,000 pixels per port.
            </div>
          </div>

          {/* Right Calculations & BOM Output */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Canvas Pixels</span>
                <span className="text-amber-400 font-extrabold text-base font-mono mt-1 block">
                  {totalPixels.toLocaleString()} px
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {megapixels.toFixed(2)} Megapixels ({width}×{height})
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Uncompressed Stream</span>
                <span className="text-blue-400 font-extrabold text-base font-mono mt-1 block">
                  {uncompressedGbps} Gbps
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  RGB 4:4:4 Video Stream
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Port Limits</span>
                <span className="text-emerald-400 font-extrabold text-base font-mono mt-1 block">
                  {portCapacity1G.toLocaleString()} px / 1G
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {portCapacity5G.toLocaleString()} px / 5G
                </span>
              </div>
            </div>

            {/* 1G vs 5G Base-T Comparison Strip */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-blue-400" />
                  <span>Physical Cable Infrastructure: 1G RJ45 vs. 5G Base-T</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold font-mono text-[10px]">
                  {cableReductionPct}% Cable Reduction
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">1G RJ45 Drops</span>
                  <span className="font-extrabold text-blue-400 text-sm font-mono block mt-0.5">
                    {primary1G} Ports
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {redundancy === 2 ? `Total: ${total1G} drops (Dual Loop)` : `Total: ${total1G} drops`}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">5G Base-T Drops</span>
                  <span className="font-extrabold text-purple-400 text-sm font-mono block mt-0.5">
                    {primary5G} Ports
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {redundancy === 2 ? `Total: ${total5G} drops (Dual Loop)` : `Total: ${total5G} drops`}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Optical Trunks</span>
                  <span className="font-extrabold text-amber-400 text-sm font-mono block mt-0.5">
                    {opt10GTrunks}x 10G OPT
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {opt40GTrunks}x 40G QSFP+
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Cabinets</span>
                  <span className="font-extrabold text-slate-200 text-sm font-mono block mt-0.5">
                    ~{approxPanels} Panels
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    ~{approxPanelArea.toFixed(1)} m² surface
                  </span>
                </div>
              </div>
            </div>

            {/* Automated Hardware BOM Card */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Automated NovaStar Hardware Bill of Materials (BOM)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Engineered for {megapixels.toFixed(2)} MP
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-amber-400 font-bold block text-[10px] uppercase">
                    1. Sending Controller:
                  </span>
                  <h4 className="text-white font-bold text-sm">{recommendedController}</h4>
                  <span className="text-slate-400 block text-[10px] font-mono">{controllerSeries}</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-1">{controllerDetails}</p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-blue-400 font-bold block text-[10px] uppercase">
                    2. Matched Receiving Cards:
                  </span>
                  <h4 className="text-white font-bold text-sm">{recommendedReceivingCards}</h4>
                  <span className="text-slate-400 block text-[10px] font-mono">1 Card per Cabinet</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-1">{cardDetails}</p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-emerald-400 font-bold block text-[10px] uppercase">
                    3. Fiber & Peripherals:
                  </span>
                  <h4 className="text-white font-bold text-sm">{transceivers}</h4>
                  <span className="text-slate-400 block text-[10px] font-mono">Platform: {software}</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-1">
                    Deploy optical fiber trunks for distances exceeding 100 meters between control room and LED screen staging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
