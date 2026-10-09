import React, { useState } from 'react';
import { Grid, Zap, Flame, Weight, ArrowRight, CheckCircle2, AlertCircle, Building2, VolumeX, SunMedium, ShieldCheck, Wrench, Sparkles, Layers } from 'lucide-react';
import { CabinetPreset, EnvironmentType, CabinetCalculations } from '../types/novastar';

interface CabinetSpecifierProps {
  currentPitch: number;
  onSyncToPortSpecifier: (width: number, height: number) => void;
  viewerDistanceM: number;
}

export const CabinetSpecifier: React.FC<CabinetSpecifierProps> = ({
  currentPitch,
  onSyncToPortSpecifier,
  viewerDistanceM
}) => {
  const [preset, setPreset] = useState<CabinetPreset>('600x337.5');
  const [environment, setEnvironment] = useState<EnvironmentType>('indoor_fine');
  const [cabWidthMm, setCabWidthMm] = useState<number>(600);
  const [cabHeightMm, setCabHeightMm] = useState<number>(337.5);
  const [cols, setCols] = useState<number>(6);
  const [rows, setRows] = useState<number>(6);
  const [avgPowerW, setAvgPowerW] = useState<number>(140); // W/m² (indoor default)
  const [maxPowerW, setMaxPowerW] = useState<number>(420); // W/m² (indoor default)
  const [panelWeightKg, setPanelWeightKg] = useState<number>(4.8); // kg/cabinet (indoor fine-pitch default)

  // Handle environment profile change
  const handleEnvironmentChange = (env: EnvironmentType) => {
    setEnvironment(env);
    if (env === 'indoor_fine') {
      setAvgPowerW(130);
      setMaxPowerW(390);
    } else if (env === 'indoor_corporate') {
      setAvgPowerW(150);
      setMaxPowerW(450);
    } else if (env === 'indoor_studio') {
      setAvgPowerW(180);
      setMaxPowerW(540);
    } else if (env === 'rental_staging') {
      setAvgPowerW(240);
      setMaxPowerW(720);
    } else if (env === 'outdoor') {
      setAvgPowerW(350);
      setMaxPowerW(950);
    }
  };

  // Handle preset change
  const handlePresetChange = (newPreset: CabinetPreset) => {
    setPreset(newPreset);
    if (newPreset === '600x337.5') {
      setCabWidthMm(600);
      setCabHeightMm(337.5);
      setAvgPowerW(140);
      setMaxPowerW(420);
      setPanelWeightKg(4.8);
      setCols(6);
      setRows(6);
      setEnvironment('indoor_fine');
    } else if (newPreset === '640x480') {
      setCabWidthMm(640);
      setCabHeightMm(480);
      setAvgPowerW(160);
      setMaxPowerW(480);
      setPanelWeightKg(6.2);
      setCols(6);
      setRows(4);
      setEnvironment('indoor_corporate');
    } else if (newPreset === '480x480') {
      setCabWidthMm(480);
      setCabHeightMm(480);
      setAvgPowerW(150);
      setMaxPowerW(450);
      setPanelWeightKg(5.5);
      setCols(8);
      setRows(5);
      setEnvironment('indoor_corporate');
    } else if (newPreset === '400x300') {
      setCabWidthMm(400);
      setCabHeightMm(300);
      setAvgPowerW(130);
      setMaxPowerW(390);
      setPanelWeightKg(3.8);
      setCols(8);
      setRows(6);
      setEnvironment('indoor_fine');
    } else if (newPreset === '500x250') {
      setCabWidthMm(500);
      setCabHeightMm(250);
      setAvgPowerW(140);
      setMaxPowerW(420);
      setPanelWeightKg(3.2);
      setCols(8);
      setRows(8);
      setEnvironment('indoor_fine');
    } else if (newPreset === '250x250') {
      setCabWidthMm(250);
      setCabHeightMm(250);
      setAvgPowerW(130);
      setMaxPowerW(380);
      setPanelWeightKg(1.6);
      setCols(16);
      setRows(9);
      setEnvironment('indoor_fine');
    } else if (newPreset === '1000x250') {
      setCabWidthMm(1000);
      setCabHeightMm(250);
      setAvgPowerW(135);
      setMaxPowerW(410);
      setPanelWeightKg(4.5);
      setCols(6);
      setRows(4);
      setEnvironment('indoor_fine');
    } else if (newPreset === '1200x337.5') {
      setCabWidthMm(1200);
      setCabHeightMm(337.5);
      setAvgPowerW(140);
      setMaxPowerW(420);
      setPanelWeightKg(7.9);
      setCols(4);
      setRows(6);
      setEnvironment('indoor_fine');
    } else if (newPreset === '500x500') {
      setCabWidthMm(500);
      setCabHeightMm(500);
      setAvgPowerW(180);
      setMaxPowerW(550);
      setPanelWeightKg(6.8);
      setCols(8);
      setRows(5);
      setEnvironment('rental_staging');
    } else if (newPreset === '500x1000') {
      setCabWidthMm(500);
      setCabHeightMm(1000);
      setAvgPowerW(220);
      setMaxPowerW(650);
      setPanelWeightKg(12.5);
      setCols(8);
      setRows(3);
      setEnvironment('rental_staging');
    } else if (newPreset === '1000x1000') {
      setCabWidthMm(1000);
      setCabHeightMm(1000);
      setAvgPowerW(350);
      setMaxPowerW(950);
      setPanelWeightKg(28.0);
      setCols(4);
      setRows(3);
      setEnvironment('outdoor');
    }
  };

  // Quick Aspect Ratio Matching
  const matchAspectRatio = (target: '16:9' | '21:9' | '32:9') => {
    if (cabWidthMm === 600 && cabHeightMm === 337.5) {
      if (target === '16:9') { setCols(6); setRows(6); }
      else if (target === '21:9') { setCols(8); setRows(6); }
      else if (target === '32:9') { setCols(12); setRows(6); }
    } else if (cabWidthMm === 1200 && cabHeightMm === 337.5) {
      if (target === '16:9') { setCols(3); setRows(6); }
      else if (target === '21:9') { setCols(4); setRows(6); }
      else if (target === '32:9') { setCols(6); setRows(6); }
    } else if (cabWidthMm === 640 && cabHeightMm === 480) {
      if (target === '16:9') { setCols(8); setRows(6); }
      else if (target === '21:9') { setCols(11); setRows(6); }
      else if (target === '32:9') { setCols(16); setRows(6); }
    } else if (cabWidthMm === 400 && cabHeightMm === 300) {
      if (target === '16:9') { setCols(12); setRows(9); }
      else if (target === '21:9') { setCols(16); setRows(9); }
      else if (target === '32:9') { setCols(24); setRows(9); }
    } else if (cabWidthMm === 500 && cabHeightMm === 250) {
      if (target === '16:9') { setCols(8); setRows(9); }
      else if (target === '21:9') { setCols(11); setRows(9); }
      else if (target === '32:9') { setCols(16); setRows(9); }
    } else if (cabWidthMm === 250 && cabHeightMm === 250) {
      if (target === '16:9') { setCols(16); setRows(9); }
      else if (target === '21:9') { setCols(21); setRows(9); }
      else if (target === '32:9') { setCols(32); setRows(9); }
    } else {
      // 500x500 or standard square
      if (target === '16:9') { setCols(8); setRows(5); }
      else if (target === '21:9') { setCols(11); setRows(5); }
      else if (target === '32:9') { setCols(16); setRows(5); }
    }
  };

  // Calculations
  const totalCabinets = cols * rows;
  const cabResX = Math.round(cabWidthMm / currentPitch);
  const cabResY = Math.round(cabHeightMm / currentPitch);
  const totalResX = cabResX * cols;
  const totalResY = cabResY * rows;
  const totalPixels = totalResX * totalResY;

  const totalWidthM = (cabWidthMm * cols) / 1000;
  const totalHeightM = (cabHeightMm * rows) / 1000;
  const totalAreaSqM = totalWidthM * totalHeightM;
  const totalAreaSqFt = totalAreaSqM * 10.7639;

  const diagonalM = Math.sqrt(totalWidthM * totalWidthM + totalHeightM * totalHeightM);
  const diagonalInches = diagonalM * 39.3701;
  const aspectRatioNum = (totalWidthM / totalHeightM).toFixed(2);

  // Electrical & HVAC Calculations
  const avgPowerKw = (totalAreaSqM * avgPowerW) / 1000;
  const peakPowerKw = (totalAreaSqM * maxPowerW) / 1000;
  const hvacBtuHr = Math.round(peakPowerKw * 1000 * 3.412142);
  const hvacTons = (hvacBtuHr / 12000).toFixed(2);

  // NEC 80% continuous breaker margins
  const breakers110V = Math.ceil((peakPowerKw * 1000) / 1760);
  const breakers230V = Math.ceil((peakPowerKw * 1000) / 2944);

  // Weight
  const totalWeightKg = Math.round(totalCabinets * panelWeightKg);
  const totalWeightLbs = Math.round(totalWeightKg * 2.20462);
  const wallLoadKgSqM = totalAreaSqM > 0 ? (totalWeightKg / totalAreaSqM).toFixed(1) : '0';

  // Field of View (FOV) at current distance
  const fovRad = 2 * Math.atan(totalWidthM / (2 * viewerDistanceM));
  const fovDeg = fovRad * (180 / Math.PI);
  const thxCompliant = fovDeg >= 36;
  const smpteCompliant = fovDeg >= 30;

  // Indoor specific indicators
  const isIndoor = environment.startsWith('indoor');
  const targetNits = environment === 'indoor_fine' ? 800 : environment === 'indoor_corporate' ? 1000 : environment === 'indoor_studio' ? 1500 : environment === 'rental_staging' ? 2500 : 6000;
  const acousticRating = isIndoor ? '< 18 dBA (Fanless Silent Natural Convection)' : '< 38 dBA (Quiet Dual Fan)';

  // Indoor Cabinet Module Breakdown & Architectural Hardware Specs
  let modulesPerCabX = 2;
  let modulesPerCabY = 2;
  let moduleWidthMm = cabWidthMm / 2;
  let moduleHeightMm = cabHeightMm / 2;
  let indoorTechName = 'Native 16:9 MicroLED / COB Flip-Chip';
  let indoorService = '100% Magnetic Vacuum Front Removal (0mm Rear Clearance)';
  let indoorChassis = 'CNC Die-Cast Magnesium (38mm Ultra-Thin Profile)';
  let indoorAlignment = '≤ 0.05 mm Seamless Micro-Pin Guide Accuracy';
  let indoorRecCard = 'Armor A10s Pro (1G) / CA50E (5G Base-T)';
  let indoorGrayscale = '22-bit+ Dynamic Booster';

  if (cabWidthMm === 600 && cabHeightMm === 337.5) {
    modulesPerCabX = 2;
    modulesPerCabY = 2;
    moduleWidthMm = 300;
    moduleHeightMm = 168.75;
    indoorTechName = 'Native 16:9 Golden Ratio MicroLED / COB Flip-Chip';
    indoorService = '100% Front Magnetic Vacuum Extraction (Flush Drywall Mount)';
    indoorChassis = 'High-Precision Die-Cast Magnesium (38mm Depth, 4.8kg)';
    indoorAlignment = '≤ 0.05 mm Dual CNC Dowel-Pin Alignment';
    indoorRecCard = 'Armor A10s Pro / CA50E (5G Base-T)';
    indoorGrayscale = '22-bit+ / 7680Hz Ultra-High Refresh';
  } else if (cabWidthMm === 1200 && cabHeightMm === 337.5) {
    modulesPerCabX = 4;
    modulesPerCabY = 2;
    moduleWidthMm = 300;
    moduleHeightMm = 168.75;
    indoorTechName = 'Double-Wide 32:9 MicroLED Matrix (50% Fewer Vertical Seams)';
    indoorService = '100% Front Vacuum Suction Extraction (0 Rear Space)';
    indoorChassis = 'CNC Monolithic Aluminum Chassis (42mm Depth, 7.9kg)';
    indoorAlignment = '≤ 0.04 mm Structural Continuous Seam Lock';
    indoorRecCard = 'Dual CA50E 5G Base-T or Armor A10s Pro';
    indoorGrayscale = '22-bit+ Broadcast Engine / 7680Hz';
  } else if (cabWidthMm === 640 && cabHeightMm === 480) {
    modulesPerCabX = 2;
    modulesPerCabY = 3;
    moduleWidthMm = 320;
    moduleHeightMm = 160;
    indoorTechName = 'Indoor High-Contrast SMD1010/1212 with Black Matrix Mask';
    indoorService = 'Dual Front/Rear Magnetic Tool Extraction';
    indoorChassis = 'Die-Cast Aluminum Alloy (55mm Profile, 6.2kg)';
    indoorAlignment = '≤ 0.08 mm CNC Machined Tolerance';
    indoorRecCard = 'DH7516-N / AT30 Fine-Pitch Commercial';
    indoorGrayscale = '16-bit High Grayscale / 3840Hz';
  } else if (cabWidthMm === 480 && cabHeightMm === 480) {
    modulesPerCabX = 2;
    modulesPerCabY = 2;
    moduleWidthMm = 240;
    moduleHeightMm = 240;
    indoorTechName = 'Broadcast Precision Mini-LED with GOB Epoxy Resin';
    indoorService = 'Magnetic Vacuum Front Pull Tool';
    indoorChassis = 'Die-Cast Magnesium with -5° to +10° Precision Curve Angle Locks';
    indoorAlignment = '≤ 0.06 mm Curved Alignment Pin Accuracy';
    indoorRecCard = 'Armor A10s Pro Broadcast Engine';
    indoorGrayscale = '22-bit+ High Dynamic Range / 7680Hz';
  } else if (cabWidthMm === 400 && cabHeightMm === 300) {
    modulesPerCabX = 2;
    modulesPerCabY = 2;
    moduleWidthMm = 200;
    moduleHeightMm = 150;
    indoorTechName = 'Mission-Critical Command & Control Sub-1mm Matrix';
    indoorService = 'Front Magnetic Vacuum Push-Pull Extraction';
    indoorChassis = 'Ultra-Rigid Die-Cast Magnesium (38mm Depth, 3.8kg)';
    indoorAlignment = '≤ 0.05 mm CNC Tolerance';
    indoorRecCard = 'AT40 Fine-Pitch / Armor A8s-N';
    indoorGrayscale = '18-bit Low-Brightness Grayscale / 3840Hz';
  } else if (cabWidthMm === 500 && cabHeightMm === 250) {
    modulesPerCabX = 2;
    modulesPerCabY = 1;
    moduleWidthMm = 250;
    moduleHeightMm = 250;
    indoorTechName = 'Architectural Half-Height Fine-Pitch Header';
    indoorService = 'Front Magnetic Fast-Clip Access';
    indoorChassis = 'Extruded Aluminum Slim Profile (36mm Depth, 3.2kg)';
    indoorAlignment = '≤ 0.08 mm Horizontal Alignment';
    indoorRecCard = 'AT30 / DH7512 Commercial';
    indoorGrayscale = '16-bit / 3840Hz Refresh';
  } else if (cabWidthMm === 1000 && cabHeightMm === 250) {
    modulesPerCabX = 4;
    modulesPerCabY = 1;
    moduleWidthMm = 250;
    moduleHeightMm = 250;
    indoorTechName = 'Indoor Financial Ticker & Architectural Ribbon Frame';
    indoorService = 'Front Magnetic Fast-Service Quick Release';
    indoorChassis = 'Extruded Aluminum Slim Housing (35mm Profile, 4.5kg)';
    indoorAlignment = '≤ 0.08 mm Linear Interlock Tolerance';
    indoorRecCard = 'AT20 / DH7512 Commercial';
    indoorGrayscale = '16-bit / 3840Hz';
  } else if (cabWidthMm === 250 && cabHeightMm === 250) {
    modulesPerCabX = 1;
    modulesPerCabY = 1;
    moduleWidthMm = 250;
    moduleHeightMm = 250;
    indoorTechName = 'Frameless Direct Magnetic Module Array';
    indoorService = 'Direct Magnetic Wall Plate Extraction';
    indoorChassis = 'Direct Magnetic Mounting Sub-frame (1.6kg)';
    indoorAlignment = '≤ 0.1 mm Surface Magnet Planarity';
    indoorRecCard = 'Mini AT20 Board-to-Board';
    indoorGrayscale = '16-bit / 3840Hz';
  }

  const totalModulesInWall = totalCabinets * modulesPerCabX * modulesPerCabY;
  const moduleResX = Math.round(cabResX / modulesPerCabX);
  const moduleResY = Math.round(cabResY / modulesPerCabY);
  const drywallSafe = parseFloat(wallLoadKgSqM) <= 35.0;

  return (
    <section id="cabinet-specifier" className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
              <span>Indoor & Fine-Pitch Cabinet Geometry Engine</span>
              <span aria-hidden="true">·</span>
              <span>Fanless Acoustic & HVAC Heat Loads</span>
              <span aria-hidden="true">·</span>
              <span>NEC 80% Safety Rule</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              LED Cabinet Architecture, Electrical & HVAC Estimator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Configure indoor fine-pitch, boardroom, and staging panel dimensions to compute exact canvas pixel matrix, aspect ratios, total surface area, structural wall mount loads, and indoor HVAC cooling requirements.
            </p>
          </div>

          <button
            onClick={() => onSyncToPortSpecifier(totalResX, totalResY)}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
          >
            <span>Sync Resolution to Port Specifier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Controls */}
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800/90 space-y-4 text-xs">
            <div className="border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider block">
                Cabinet Array Configuration
              </span>
            </div>

            {/* Cabinet Standard Preset */}
            <div>
              <label className="flex items-center justify-between font-bold text-slate-100 mb-2 text-xs tracking-tight">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  <span className="font-semibold text-slate-200">Cabinet Geometry Preset (Indoor Fine-Pitch &amp; Modular Formats)</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-blue-950/90 text-blue-300 border border-blue-700/60 font-bold tracking-wider shadow-sm">
                  Indoor Certified
                </span>
              </label>
              <select
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value as CabinetPreset)}
                className="w-full bg-slate-900 border-2 border-blue-500/70 hover:border-blue-400 focus:border-blue-400 rounded-xl p-3 font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xl shadow-blue-950/50 text-xs sm:text-sm transition-all cursor-pointer ring-offset-2 ring-offset-slate-950 [&>optgroup]:bg-slate-950 [&>optgroup]:text-blue-300 [&>optgroup]:font-bold [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <optgroup label="Indoor Fine-Pitch & MicroLED Standards (600 - 1000 Nits)" className="bg-slate-950 text-blue-300 font-bold">
                  <option value="600x337.5" className="bg-slate-900 text-slate-100">600 × 337.5 mm (Native 16:9 Golden Ratio MicroLED / COB / GOB)</option>
                  <option value="1200x337.5" className="bg-slate-900 text-slate-100">1200 × 337.5 mm (Double-Wide 32:9 MicroLED Command Frame)</option>
                  <option value="640x480" className="bg-slate-900 text-slate-100">640 × 480 mm (Indoor 4:3 Commercial Die-Cast Standard)</option>
                  <option value="480x480" className="bg-slate-900 text-slate-100">480 × 480 mm (Indoor Precision Square & Broadcast Curved Die-Cast)</option>
                  <option value="400x300" className="bg-slate-900 text-slate-100">400 × 300 mm (Indoor Command & Control 4:3 Fine Matrix)</option>
                  <option value="500x250" className="bg-slate-900 text-slate-100">500 × 250 mm (Indoor Fine-Pitch Half-Height Architectural Header)</option>
                  <option value="1000x250" className="bg-slate-900 text-slate-100">1000 × 250 mm (Indoor Architectural Ribbon / Financial Ticker Display)</option>
                  <option value="250x250" className="bg-slate-900 text-slate-100">250 × 250 mm (Indoor Direct Magnetic Front-Service Module Array)</option>
                </optgroup>
                <optgroup label="Indoor & Rental Touring Standards (800 - 1500 Nits)" className="bg-slate-950 text-blue-300 font-bold">
                  <option value="500x500" className="bg-slate-900 text-slate-100">500 × 500 mm (Indoor Event & Rental Lightweight Magnesium)</option>
                  <option value="500x1000" className="bg-slate-900 text-slate-100">500 × 1000 mm (Indoor Touring / Staging Tall Format)</option>
                </optgroup>
                <optgroup label="Outdoor & Custom Formats" className="bg-slate-950 text-blue-300 font-bold">
                  <option value="1000x1000" className="bg-slate-900 text-slate-100">1000 × 1000 mm (Outdoor Commercial Billboard Standard)</option>
                  <option value="custom" className="bg-slate-900 text-slate-100">Custom Cabinet Dimensions</option>
                </optgroup>
              </select>
            </div>

            {/* Environment Profile */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Deployment Environment & Operating Profile
              </label>
              <select
                value={environment}
                onChange={(e) => handleEnvironmentChange(e.target.value as EnvironmentType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-medium text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="indoor_fine" className="bg-slate-900 text-slate-100">Indoor Fine-Pitch Boardroom (800 nits, Fanless Silent &lt;22 dB)</option>
                <option value="indoor_corporate" className="bg-slate-900 text-slate-100">Indoor Commercial / Retail (1000 nits, Low Heat)</option>
                <option value="indoor_studio" className="bg-slate-900 text-slate-100">Indoor TV Broadcast & xR Stage (1500 nits, Genlock Low Latency)</option>
                <option value="rental_staging" className="bg-slate-900 text-slate-100">Indoor/Outdoor Event Staging (2500 nits, High Brightness)</option>
                <option value="outdoor" className="bg-slate-900 text-slate-100">Outdoor Direct Sunlight (6000 nits, High Heat Dissipation)</option>
              </select>
            </div>

            {/* Dimensions (mm) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cabinet Width (mm)</label>
                <input
                  type="number"
                  value={cabWidthMm}
                  onChange={(e) => {
                    setPreset('custom');
                    setCabWidthMm(parseFloat(e.target.value) || 100);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cabinet Height (mm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={cabHeightMm}
                  onChange={(e) => {
                    setPreset('custom');
                    setCabHeightMm(parseFloat(e.target.value) || 100);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
                />
              </div>
            </div>

            {/* Matrix Columns & Rows */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Columns (Across)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono font-bold text-blue-400"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rows (Down)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono font-bold text-blue-400"
                />
              </div>
            </div>

            {/* Quick Aspect Ratio Target Buttons */}
            <div>
              <span className="block font-semibold text-slate-400 mb-1.5 uppercase text-[10px]">
                Target Aspect Ratio Matchers:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => matchAspectRatio('16:9')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded font-mono font-semibold text-xs text-slate-200"
                >
                  Match 16:9 Standard
                </button>
                <button
                  onClick={() => matchAspectRatio('21:9')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded font-mono font-semibold text-xs text-slate-200"
                >
                  Match 21:9 Ultrawide
                </button>
                <button
                  onClick={() => matchAspectRatio('32:9')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded font-mono font-semibold text-xs text-slate-200"
                >
                  Match 32:9 Dual-FHD
                </button>
              </div>
            </div>

            {/* Power & Structural Parameters */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">
                Electrical & Structural Load Variables
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-400 text-[11px] mb-1">Avg W/m²</label>
                  <input
                    type="number"
                    value={avgPowerW}
                    onChange={(e) => setAvgPowerW(parseFloat(e.target.value) || 50)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 text-[11px] mb-1">Peak W/m²</label>
                  <input
                    type="number"
                    value={maxPowerW}
                    onChange={(e) => setMaxPowerW(parseFloat(e.target.value) || 100)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 text-[11px] mb-1">Panel kg</label>
                  <input
                    type="number"
                    step="0.1"
                    value={panelWeightKg}
                    onChange={(e) => setPanelWeightKg(parseFloat(e.target.value) || 0.5)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Calculations & Visual Grid Schematic */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Wall Resolution</span>
                <span className="text-amber-400 font-extrabold text-base font-mono mt-1 block">
                  {totalResX} × {totalResY} px
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {aspectRatioNum}:1 ({totalResX > 3800 ? '4K UHD Class' : totalResX > 1800 ? '1080p FHD Class' : 'Sub-FHD'})
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Pixel Load</span>
                <span className="text-blue-400 font-extrabold text-base font-mono mt-1 block">
                  {(totalPixels / 1000000).toFixed(2)} Million px
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {cabResX}×{cabResY} px / Cabinet
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Physical Size</span>
                <span className="text-emerald-400 font-extrabold text-base font-mono mt-1 block">
                  {totalWidthM.toFixed(2)}m × {totalHeightM.toFixed(2)}m
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {diagonalInches.toFixed(1)}" Diagonal
                </span>
              </div>
            </div>

            {/* Electrical & Rigging Spec Sheet */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Electrical, HVAC & Structural Rigging Analytics</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  NEC 80% Continuous Breaker Rule
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Cabinet Quantity</span>
                  <span className="font-bold text-slate-200 text-sm font-mono block mt-0.5">
                    {totalCabinets} Panels
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {cols} cols × {rows} rows
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Surface Area</span>
                  <span className="font-bold text-slate-200 text-sm font-mono block mt-0.5">
                    {totalAreaSqM.toFixed(2)} m²
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {totalAreaSqFt.toFixed(1)} ft²
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Avg / Peak Power</span>
                  <span className="font-bold text-amber-400 text-sm font-mono block mt-0.5">
                    {avgPowerKw.toFixed(1)} kW / {peakPowerKw.toFixed(1)} kW
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {hvacBtuHr.toLocaleString()} BTU/hr ({hvacTons} Tons)
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Dedicated Breakers</span>
                  <span className="font-bold text-rose-400 text-sm font-mono block mt-0.5">
                    {breakers110V}× 20A (110V)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {breakers230V}× 16A (230V EU)
                  </span>
                </div>
              </div>

              {/* Indoor Acoustic & Environment Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <SunMedium className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">Target Brightness:</span>
                    <span className="text-slate-200 font-mono font-bold">{targetNits} Nits</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">Acoustic Rating:</span>
                    <span className="text-slate-200 font-mono font-bold">{acousticRating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Weight className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">Wall Mounting Load:</span>
                    <span className="text-slate-200 font-mono font-bold">~{wallLoadKgSqM} kg/m² ({totalWeightKg} kg tot)</span>
                  </div>
                </div>
              </div>

              {/* FOV & Immersion Standards strip */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Horizontal FOV Immersion ({viewerDistanceM.toFixed(1)}m Viewer Distance)
                  </span>
                  <span className="text-sm font-mono font-bold text-purple-400">
                    {fovDeg.toFixed(1)}° Horizontal FOV
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`flex items-center gap-1 ${smpteCompliant ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SMPTE ≥ 30°</span>
                  </span>
                  <span className={`flex items-center gap-1 ${thxCompliant ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>THX ≥ 36°</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Rigging: ~{totalWeightKg} kg ({totalWeightLbs} lbs)
                  </span>
                </div>
              </div>

              {/* Indoor LED Cabinet Architectural Hardware & Maintenance Telemetry */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-xl border border-blue-900/40 shadow-inner space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-bold text-white text-xs tracking-wide">
                      Indoor LED Cabinet Architecture &amp; Maintenance Telemetry
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950 border border-blue-700/50 text-blue-300">
                    {indoorTechName}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
                      <Wrench className="w-3 h-3 text-amber-400" />
                      <span>Front Service Mechanism</span>
                    </div>
                    <span className="text-slate-200 font-medium leading-tight block">
                      {indoorService}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>Magnetic Module Array</span>
                    </div>
                    <span className="text-slate-200 font-semibold block font-mono">
                      {totalModulesInWall} Modules Total ({modulesPerCabX * modulesPerCabY}/cab)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {moduleWidthMm}×{moduleHeightMm}mm · {moduleResX}×{moduleResY} px
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Drywall Structural Safety</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`font-mono font-bold ${drywallSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {wallLoadKgSqM} kg/m²
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {drywallSafe ? '(Within ≤35kg/m² limit)' : '(Needs backing)'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Chassis: {indoorChassis}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">
                      Mechanical Alignment
                    </span>
                    <span className="text-slate-200 font-mono block font-semibold">
                      {indoorAlignment}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Zero-seam CNC interlock pins
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">
                      NovaStar Receiving Card
                    </span>
                    <span className="text-blue-400 font-mono block font-semibold">
                      {indoorRecCard}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      1 card per cabinet with loop backup
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">
                      Grayscale Engine &amp; Refresh
                    </span>
                    <span className="text-purple-400 font-mono block font-semibold">
                      {indoorGrayscale}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Natural passive cooling: {acousticRating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual SVG Grid Schematic */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-blue-400" />
                  <span>Interactive Cabinet Array Schematic</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {cols} Cols × {rows} Rows = {totalCabinets} Cabinets ({cabWidthMm}×{cabHeightMm}mm)
                </span>
              </div>

              <div className="w-full h-44 bg-slate-900 rounded-lg p-2 flex items-center justify-center overflow-hidden border border-slate-800">
                <CabinetSvgGrid
                  cols={cols}
                  rows={rows}
                  cabW={cabWidthMm}
                  cabH={cabHeightMm}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface CabinetSvgGridProps {
  cols: number;
  rows: number;
  cabW: number;
  cabH: number;
}

const CabinetSvgGrid: React.FC<CabinetSvgGridProps> = ({ cols, rows, cabW, cabH }) => {
  const svgW = 380;
  const svgH = 150;

  const aspect = (cols * cabW) / (rows * cabH);
  let drawW = svgW - 30;
  let drawH = drawW / aspect;

  if (drawH > svgH - 30) {
    drawH = svgH - 30;
    drawW = drawH * aspect;
  }

  const startX = (svgW - drawW) / 2;
  const startY = (svgH - drawH) / 2;
  const cellW = drawW / cols;
  const cellH = drawH / rows;

  const rects: React.ReactNode[] = [];

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      rects.push(
        <rect
          key={`${c}-${r}`}
          x={startX + c * cellW}
          y={startY + r * cellH}
          width={Math.max(2, cellW - 1)}
          height={Math.max(2, cellH - 1)}
          fill="#1e293b"
          stroke="#38bdf8"
          strokeWidth="0.75"
          rx="1"
        />
      );
    }
  }

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="w-full h-auto max-h-[150px] overflow-visible max-w-full"
    >
      {rects}
      <text
        x={svgW / 2}
        y={startY + drawH + 14}
        fill="#94a3b8"
        fontSize="9"
        textAnchor="middle"
        fontFamily="monospace"
      >
        {cols} Cabinets Across × {rows} Cabinets Down ({((cols * cabW) / 1000).toFixed(1)}m × {((rows * cabH) / 1000).toFixed(1)}m)
      </text>
    </svg>
  );
};
