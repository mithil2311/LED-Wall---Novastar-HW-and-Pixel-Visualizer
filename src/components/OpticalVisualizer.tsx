import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eye, Sliders, Shield, Camera, Maximize2, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { PackagingType, SimulationMode, TestPatternType, OpticalCalculations } from '../types/novastar';

interface OpticalVisualizerProps {
  currentPitch: number;
  onPitchChange: (p: number) => void;
  onOpenCalibration: () => void;
  screenPpi: number;
}

export const OpticalVisualizer: React.FC<OpticalVisualizerProps> = ({
  currentPitch,
  onPitchChange,
  onOpenCalibration,
  screenPpi
}) => {
  const [distance, setDistance] = useState<number>(3.5); // meters
  const [packaging, setPackaging] = useState<PackagingType>('gob');
  const [simMode, setSimMode] = useState<SimulationMode>('surface');
  const [pattern, setPattern] = useState<TestPatternType>('dashboard');
  const [viewAngle, setViewAngle] = useState<number>(0); // 0° to 80°
  const [comparePitch, setComparePitch] = useState<number>(3.91);
  const [cameraSensor, setCameraSensor] = useState<'arri' | 'red' | 'venice'>('arri');
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({ x: 480, y: 220 });
  const [showLoupe, setShowLoupe] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Bidirectional calculations
  const ppi = 25.4 / currentPitch;
  const pxPerSqMeter = Math.round(1000000 / (currentPitch * currentPitch));
  const pxPerSqFoot = Math.round(pxPerSqMeter / 10.7639);

  // Retinal blending distance: d_blend = P * 3437.75 mm = P * 3.438 m
  const retinaDistanceM = (currentPitch / 1000) * 3437.75;
  const retinaDistanceFt = retinaDistanceM * 3.28084;
  const minDistanceM = currentPitch * 1.0;
  const minDistanceFt = minDistanceM * 3.28084;
  const comfortDistanceM = currentPitch * 2.44;
  const comfortDistanceFt = comfortDistanceM * 3.28084;

  const thetaRad = 2 * Math.atan((currentPitch / 1000) / (2 * distance));
  const angularSubtenseArcmin = thetaRad * (180 / Math.PI) * 60;
  const arcdeg = thetaRad * (180 / Math.PI);
  const ppd = arcdeg > 0 ? (1 / arcdeg) : 0;

  // Grid contrast (MTF transition): 0 when distance >= retinaDistanceM
  const gridContrast = (distance >= retinaDistanceM)
    ? 0.0
    : Math.pow(Math.max(0, 1.0 - (distance / retinaDistanceM)), 1.35);

  const acuityVerdict: 'retina' | 'comfortable' | 'noticeable' =
    angularSubtenseArcmin <= 1.05 ? 'retina' : (angularSubtenseArcmin <= 2.2 ? 'comfortable' : 'noticeable');

  // Handle manual pitch input
  const handlePitchInput = (val: number) => {
    if (!isNaN(val) && val >= 0.4 && val <= 25.0) {
      onPitchChange(val);
    }
  };

  // Handle manual PPI input (reciprocal: P = 25.4 / PPI)
  const handlePpiInput = (val: number) => {
    if (!isNaN(val) && val > 0.5 && val <= 100) {
      const calcP = 25.4 / val;
      onPitchChange(Number(calcP.toFixed(2)));
    }
  };

  // Mouse move over canvas to position microscopic loupe
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    setLoupePos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    });
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    setLoupePos({
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    });
  };

  // -------------------------------------------------------------
  // Canvas Rendering Engine
  // -------------------------------------------------------------
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (simMode === 'venue') {
      render3DVenuePerspective(ctx, w, h, currentPitch, distance);
      return;
    }

    if (simMode === 'moire') {
      renderCameraMoireSimulation(ctx, w, h, currentPitch, distance, pattern, packaging, viewAngle, cameraSensor);
      if (showLoupe) {
        renderMicroLoupe(ctx, currentPitch, packaging, loupePos);
      }
      return;
    }

    if (simMode === 'split') {
      // Left side: current pitch
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w / 2, h);
      ctx.clip();
      renderPixelAcuitySurface(ctx, 0, 0, w, h, currentPitch, distance, pattern, packaging, viewAngle);
      ctx.restore();

      // Right side: comparison pitch
      ctx.save();
      ctx.beginPath();
      ctx.rect(w / 2, 0, w / 2, h);
      ctx.clip();
      renderPixelAcuitySurface(ctx, 0, 0, w, h, comparePitch, distance, pattern, packaging, viewAngle);
      ctx.restore();

      // Split separator line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();

      // Labels
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(12, 12, 160, 24);
      ctx.fillRect(w / 2 + 12, 12, 160, 24);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`Target: P${currentPitch.toFixed(2)}mm (${packaging.toUpperCase()})`, 18, 28);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`Compare: P${comparePitch.toFixed(2)}mm`, w / 2 + 18, 28);
      return;
    }

    // Default: Direct Surface Acuity
    renderPixelAcuitySurface(ctx, 0, 0, w, h, currentPitch, distance, pattern, packaging, viewAngle);
    if (showLoupe) {
      renderMicroLoupe(ctx, currentPitch, packaging, loupePos);
    }
  }, [currentPitch, distance, packaging, simMode, pattern, viewAngle, comparePitch, cameraSensor, loupePos, showLoupe]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <section id="visualizer" className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
        {/* Header Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
              <span>Dual-Engine Physics Simulator</span>
              <span aria-hidden="true">·</span>
              <span>60 PPD 20/20 Retinal Blend</span>
              <span aria-hidden="true">·</span>
              <span>Bidirectional PPI Math</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              LED Optical Physics, PPI & Retinal Acuity Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Model how the human eye perceives individual discrete diodes versus a seamless image at variable distances. Explore packaging technology optical physics (SMD, GOB, COB, MIP) and cinema camera moiré interference.
            </p>
          </div>

          {/* Quick Pitch Presets */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase">Pitch:</span>
            {[0.9, 1.25, 1.56, 1.87, 2.6, 3.91, 4.81, 6.0, 10.0].map((preset) => (
              <button
                key={preset}
                onClick={() => onPitchChange(preset)}
                className={`px-2 py-1 text-xs font-mono font-semibold rounded transition-colors ${
                  Math.abs(currentPitch - preset) < 0.05
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                P{preset}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Parameter Controls */}
          <div className="lg:col-span-5 space-y-5 bg-slate-950 p-5 rounded-xl border border-slate-800/90">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>1. Bidirectional Pitch & Optical Controls</span>
              </span>
              <button
                onClick={onOpenCalibration}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                1:1 Life Size Calibrate
              </button>
            </div>

            {/* Bidirectional Pitch & PPI Dual Inputs */}
            <div className="grid grid-cols-2 gap-3 bg-slate-900 p-3.5 rounded-lg border border-slate-800">
              {/* Pitch Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Pixel Pitch (P)</span>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">mm</span>
                </div>
                <input
                  type="number"
                  min="0.4"
                  max="25.0"
                  step="0.01"
                  value={currentPitch}
                  onChange={(e) => handlePitchInput(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-right"
                />
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.05"
                  value={Math.min(10, currentPitch)}
                  onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.5mm</span>
                  <span>2.6mm</span>
                  <span>10mm</span>
                </div>
              </div>

              {/* PPI Reciprocal Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Pixels Per Inch</span>
                  <span className="text-[11px] font-mono text-indigo-400 font-bold">PPI</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="70"
                  step="0.1"
                  value={Number(ppi.toFixed(2))}
                  onChange={(e) => handlePpiInput(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm font-mono font-bold text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-right"
                />
                <input
                  type="range"
                  min="2.5"
                  max="50"
                  step="0.5"
                  value={Math.min(50, Math.max(2.5, ppi))}
                  onChange={(e) => handlePpiInput(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2.5 PPI</span>
                  <span>9.8 PPI</span>
                  <span>50 PPI</span>
                </div>
              </div>
            </div>

            {/* Quick Pitch Presets Bar (Indoor Fine-Pitch to Touring) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Pitch Presets:
              </span>
              {[
                { p: 0.78, label: 'P0.78 MicroLED' },
                { p: 0.93, label: 'P0.93 8K' },
                { p: 1.25, label: 'P1.25 Fine' },
                { p: 1.56, label: 'P1.56 4K' },
                { p: 1.87, label: 'P1.87 Corp' },
                { p: 2.6, label: 'P2.60 Rental' },
                { p: 3.91, label: 'P3.91 Stage' },
              ].map(({ p, label }) => (
                <button
                  key={p}
                  onClick={() => onPitchChange(p)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                    Math.abs(currentPitch - p) < 0.03
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Viewer Walk-Back Distance Slider & Quick Jumps */}
            <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Viewer Distance</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0.5"
                    max="40.0"
                    step="0.1"
                    value={distance}
                    onChange={(e) => setDistance(parseFloat(e.target.value) || 0.5)}
                    className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-amber-300 text-right focus:outline-none"
                  />
                  <span className="font-bold text-slate-400">m</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    ({(distance * 3.28084).toFixed(1)} ft)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="25.0"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Presets:</span>
                <div className="flex gap-1.5">
                  {[1.5, 3.5, 6.0, 12.0].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDistance(d)}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                        Math.abs(distance - d) < 0.1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Packaging Tech & Test Pattern Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Packaging Technology
                </label>
                <select
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value as PackagingType)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2 font-medium text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="smd" className="bg-slate-900 text-slate-100">SMD (Surface Mount Device - 32% Fill)</option>
                  <option value="gob" className="bg-slate-900 text-slate-100">GOB (Glue-on-Board Epoxy - 58% Fill)</option>
                  <option value="cob" className="bg-slate-900 text-slate-100">COB (Chip-on-Board Flip-Chip - 82% Fill)</option>
                  <option value="mip" className="bg-slate-900 text-slate-100">MIP (Micro-in-Package 0404 Diodes)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Simulation Content
                </label>
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value as TestPatternType)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2 font-medium text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="dashboard" className="bg-slate-900 text-slate-100">CCTV & Financial Ops Matrix</option>
                  <option value="studio" className="bg-slate-900 text-slate-100">4K Broadcast Stage Concert</option>
                  <option value="text" className="bg-slate-900 text-slate-100">Snellen Acuity & Typography Legibility</option>
                  <option value="gradient" className="bg-slate-900 text-slate-100">10-Bit Grayscale & Color Banding</option>
                </select>
              </div>
            </div>

            {/* Simulation View Mode & Off-Axis Angle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Simulation Perspective
                </label>
                <select
                  value={simMode}
                  onChange={(e) => setSimMode(e.target.value as SimulationMode)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2 font-medium text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="surface" className="bg-slate-900 text-slate-100">Direct Surface Acuity (Retinal Blend)</option>
                  <option value="venue" className="bg-slate-900 text-slate-100">3D Architectural Venue & Observer</option>
                  <option value="moire" className="bg-slate-900 text-slate-100">Camera Moiré & Sensor Aliasing</option>
                  <option value="split" className="bg-slate-900 text-slate-100">Split-Screen Pitch Compare</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Off-Axis Angle
                  </label>
                  <span className="text-[11px] font-mono text-blue-400 font-bold">
                    {viewAngle}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={viewAngle}
                  onChange={(e) => setViewAngle(parseInt(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Split Comparison Selector (when split mode active) */}
            {simMode === 'split' && (
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Comparison Secondary Pitch
                </label>
                <select
                  value={comparePitch}
                  onChange={(e) => setComparePitch(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded p-2 text-slate-200 font-mono [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="1.25" className="bg-slate-900 text-slate-100">P1.25 mm (MicroLED Fine Pitch)</option>
                  <option value="1.56" className="bg-slate-900 text-slate-100">P1.56 mm (Corporate Command)</option>
                  <option value="2.6" className="bg-slate-900 text-slate-100">P2.60 mm (Rental Workhorse)</option>
                  <option value="3.91" className="bg-slate-900 text-slate-100">P3.91 mm (Standard Staging)</option>
                  <option value="6.0" className="bg-slate-900 text-slate-100">P6.00 mm (Outdoor Commercial)</option>
                </select>
              </div>
            )}

            {/* Camera Sensor Selection (when moiré mode active) */}
            {simMode === 'moire' && (
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Cinema Camera Sensor Target
                </label>
                <select
                  value={cameraSensor}
                  onChange={(e) => setCameraSensor(e.target.value as 'arri' | 'red' | 'venice')}
                  className="w-full bg-slate-950 border border-slate-700 text-xs rounded p-2 text-slate-200 font-medium [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="arri" className="bg-slate-900 text-slate-100">ARRI Alexa 35 (Super 35 4.6K Sensor - 6.075 µm pitch)</option>
                  <option value="red" className="bg-slate-900 text-slate-100">RED V-Raptor 8K VV (Large Format - 5.0 µm pitch)</option>
                  <option value="venice" className="bg-slate-900 text-slate-100">Sony Venice 2 8K (Full Frame 36x24mm - 4.14 µm pitch)</option>
                </select>
              </div>
            )}

            {/* Packaging Technical Physics Card */}
            <div className="p-3.5 rounded-lg border bg-slate-900/90 border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  {packaging === 'gob' && 'GOB (Glue-on-Board) Optical Potting'}
                  {packaging === 'cob' && 'COB (Chip-on-Board) Flip-Chip Planar'}
                  {packaging === 'smd' && 'SMD (Surface Mount Device) Discrete Cups'}
                  {packaging === 'mip' && 'MIP (Micro-in-Package) 0404 Matrix'}
                </span>
                <span className="text-[10px] font-mono text-amber-400">
                  {packaging === 'gob' && 'n ≈ 1.52 Epoxy'}
                  {packaging === 'cob' && '170° Lambertian'}
                  {packaging === 'smd' && '32% Fill Factor'}
                  {packaging === 'mip' && 'MicroLED Class'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {packaging === 'gob' &&
                  'High-transparency optical epoxy resin cast over discrete SMD diodes. Protects against rental touring collisions (>15 kg/cm² impact), shields to IP65, and softens diode point glare via perimeter refractive index matching.'}
                {packaging === 'cob' &&
                  'Bare flip-chip LED micro-diodes directly bonded to the PCB substrate without wire bonds or individual cups. Achieves 82% effective fill factor, 170° Lambertian viewing angle, and zero diode knock-off failure.'}
                {packaging === 'smd' &&
                  'Traditional discrete plastic-encased diodes soldered to PCB pads. Delivers high peak luminance at standard manufacturing cost, but exhibits 68% visible black matrix area and lower collision tolerance (<5 kg/cm²).'}
                {packaging === 'mip' &&
                  'Micro-encapsulated 0404/0202 discrete packages compatible with SMT lines. Combines single-pixel testing and binning yield consistency with near-MicroLED pitch density down to P0.4-P1.2mm.'}
              </p>
            </div>

            {/* Mathematical Telemetry Strip */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 uppercase">
                <span>2. Optical Acuity Engineering</span>
                <span className="text-[10px] text-amber-400 font-mono">P{currentPitch.toFixed(2)} mm</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Pixel Density & PPI</span>
                  <span className="text-indigo-400 font-mono font-extrabold text-sm block mt-0.5">
                    {ppi.toFixed(2)} PPI
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">
                    {pxPerSqMeter.toLocaleString()} px/m²
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Retina Acuity Blend (20/20)</span>
                  <span className="text-emerald-400 font-mono font-extrabold text-sm block mt-0.5">
                    {retinaDistanceM.toFixed(2)} m
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Formula: P × 3438
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Minimum Distance (1m/mm)</span>
                  <span className="text-amber-400 font-mono font-extrabold text-sm block mt-0.5">
                    {minDistanceM.toFixed(2)} m
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    ({minDistanceFt.toFixed(1)} ft)
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Pixels Per Degree (PPD)</span>
                  <span className="text-blue-400 font-mono font-extrabold text-sm block mt-0.5">
                    {ppd.toFixed(1)} PPD
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {ppd >= 60 ? 'Exceeds 20/20 Retina' : 'Below 60 PPD'}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Angular Separation</span>
                  <span className="text-slate-200 font-mono font-extrabold text-sm block mt-0.5">
                    {angularSubtenseArcmin.toFixed(2)} Arcmin
                  </span>
                  <span className={`text-[10px] font-bold block ${
                    acuityVerdict === 'retina' ? 'text-emerald-400' : acuityVerdict === 'comfortable' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {acuityVerdict === 'retina' ? 'Seamless Retina' : acuityVerdict === 'comfortable' ? 'Comfortable' : 'Dots Discernible'}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Comfort Rule (Samsung)</span>
                  <span className="text-slate-200 font-mono font-extrabold text-sm block mt-0.5">
                    {comfortDistanceM.toFixed(2)} m
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    2.44 m per mm (8 ft/mm)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visualizer Viewport Canvas */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-black p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-200 uppercase tracking-wider">
                    {simMode === 'surface' && 'Live Surface Acuity & Pixel Blend Simulation'}
                    {simMode === 'venue' && '3D Venue & Human Observer Perspective'}
                    {simMode === 'moire' && 'Camera Moiré & Sensor Aliasing Simulator'}
                    {simMode === 'split' && 'Split-Screen Pitch Comparison'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLoupe(!showLoupe)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {showLoupe ? 'Hide 24x Loupe' : 'Show 24x Loupe'}
                  </button>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    acuityVerdict === 'retina' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    acuityVerdict === 'comfortable' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {acuityVerdict === 'retina' ? '100% Retinal Blend' : acuityVerdict === 'comfortable' ? 'Minor Grid' : 'Visible Diode Matrix'}
                  </span>
                </div>
              </div>

              {/* Viewport Canvas Element */}
              <div className="relative w-full aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={405}
                  onMouseMove={handleCanvasMouseMove}
                  onTouchStart={handleCanvasTouchMove}
                  onTouchMove={handleCanvasTouchMove}
                  className="w-full h-full object-contain touch-none"
                />

                {/* Floating Telemetry HUD */}
                <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono space-y-0.5 pointer-events-none text-slate-300">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Dist: {distance.toFixed(1)}m</span>
                    <span>·</span>
                    <span>Pitch: P{currentPitch.toFixed(2)}</span>
                    <span>·</span>
                    <span className="text-indigo-300">{ppi.toFixed(1)} PPI</span>
                    <span>·</span>
                    <span>Angle: {viewAngle}°</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Acuity: {acuityVerdict === 'retina' ? 'Seamless (Retina resolved)' : acuityVerdict === 'comfortable' ? 'Comfortable (Minimal matrix)' : 'Discontinuous diodes visible'}
                  </div>
                </div>

                {/* Loupe hint */}
                {showLoupe && simMode !== 'venue' && (
                  <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-800 pointer-events-none">
                    24x Microscopic Loupe (Move mouse across canvas)
                  </div>
                )}
              </div>

              {/* Experience Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Viewing Experience at {distance.toFixed(1)}m:</span>
                  <span className={`font-bold ${
                    acuityVerdict === 'retina' ? 'text-emerald-400' : acuityVerdict === 'comfortable' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {acuityVerdict === 'retina' ? 'Complete Optical Blending' : acuityVerdict === 'comfortable' ? 'Acceptable Staging Distance' : 'Discontinuous Pixel Matrix'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-rose-500 h-full" style={{ width: '25%' }} title="Close up / Pixelated" />
                  <div className="bg-amber-500 h-full" style={{ width: '25%' }} title="Minimum Distance" />
                  <div className="bg-emerald-500 h-full" style={{ width: '50%' }} title="Retina / Seamless Blend" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>&lt; {minDistanceM.toFixed(1)}m (Pixelated)</span>
                  <span>{minDistanceM.toFixed(1)}m - {retinaDistanceM.toFixed(1)}m (Threshold)</span>
                  <span>&ge; {retinaDistanceM.toFixed(1)}m (Seamless Retina)</span>
                </div>
              </div>
            </div>

            {/* Engineering Takeaway */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-1.5 text-slate-300">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Optical Acuity Rule for Display Specifiers:</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Specifying an excessively fine pitch (e.g. P0.9 for viewers seated 8 meters away) adds substantial cost and controller port consumption without visual benefit. Human 20/20 vision cannot resolve diode spacing past the <strong>Retina Acuity Blend Distance</strong> (<span className="font-mono text-amber-300">d ≈ P × 3438</span>). Align pitch directly with your nearest audience sightline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// -----------------------------------------------------------------------------
// Helper Drawing Functions
// -----------------------------------------------------------------------------

function drawNativeTestPattern(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: TestPatternType,
  packaging: PackagingType
) {
  if (content === 'dashboard') {
    // CCTV & Financial Matrix
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, 28);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.lineTo(w, 28);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('NOVA COMMAND CENTER // OPS MATRIX', 12, 18);

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(w - 95, 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText('SYNC 60.00 Hz', w - 85, 17);

    // Card 1
    const card1W = Math.floor(w * 0.48);
    const card1H = 145;
    ctx.fillStyle = '#0b1329';
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(12, 38, card1W, card1H, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('SYSTEM THROUGHPUT TELEMETRY', 22, 54);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('38.4 Gbps / 40.0 Gbps', 22, 75);
    ctx.fillStyle = '#10b981';
    ctx.font = '9px monospace';
    ctx.fillText('96.0% LINK CAPACITY · UNCOMPRESSED RGB 4:4:4', 22, 90);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const graphY = 145;
    ctx.moveTo(22, graphY - 10);
    ctx.lineTo(60, graphY - 25);
    ctx.lineTo(100, graphY - 18);
    ctx.lineTo(145, graphY - 45);
    ctx.lineTo(190, graphY - 30);
    ctx.lineTo(240, graphY - 55);
    ctx.lineTo(card1W, graphY - 40);
    ctx.stroke();

    // Card 2 (CCTV Camera preview)
    const card2X = 12 + card1W + 10;
    const card2W = w - card2X - 12;
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(card2X, 38, card2W, card1H, 6);
    ctx.fill();
    ctx.stroke();

    const cctvGrad = ctx.createLinearGradient(card2X, 38, card2X + card2W, 38 + card1H);
    cctvGrad.addColorStop(0, '#1e1b4b');
    cctvGrad.addColorStop(0.5, '#0c4a6e');
    cctvGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = cctvGrad;
    ctx.fillRect(card2X + 4, 42, card2W - 8, card1H - 8);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(card2X + 12, 52, 6, 6);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('CAM 01 · STAGE X VIRTUAL VOLUME', card2X + 24, 58);

    // Bottom telemetry banner
    const bottomY = 38 + card1H + 10;
    const bottomH = h - bottomY - 12;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(12, bottomY, w - 24, bottomH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`HARDWARE DEPLOYMENT: ${packaging.toUpperCase()} TECHNOLOGY · GENLOCK ACTIVE`, 24, bottomY + 22);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('RECEIVING CARDS: CA50E 5G / ARMOR A10S PRO · PWM DRIVER: MBI5264B', 24, bottomY + 42);
    ctx.fillText('LATENCY: < 1.0 FRAME BUFFER DELAY · 22-BIT+ GRAYSCALE CALIBRATION VERIFIED', 24, bottomY + 60);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('● ZERO FRAME DROPS DETECTED // OPTICAL TRUNK REDUNDANT', 24, bottomY + 80);

  } else if (content === 'studio') {
    // 4K Broadcast Concert
    const sgrad = ctx.createLinearGradient(0, 0, 0, h);
    sgrad.addColorStop(0, '#020617');
    sgrad.addColorStop(0.35, '#831843');
    sgrad.addColorStop(0.65, '#3b0764');
    sgrad.addColorStop(1, '#022c22');
    ctx.fillStyle = sgrad;
    ctx.fillRect(0, 0, w, h);

    // Beams of light
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(w * 0.15, 0);
    ctx.lineTo(w * 0.45, h);
    ctx.lineTo(w * 0.55, h);
    ctx.lineTo(w * 0.25, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.85, 0);
    ctx.lineTo(w * 0.55, h);
    ctx.lineTo(w * 0.45, h);
    ctx.lineTo(w * 0.75, 0);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.45, 55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BROADCAST 4K', w / 2, h * 0.47);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#fde047';
    ctx.fillText('NOVASTAR ULTRA-HIGH DYNAMIC RANGE', w / 2, h * 0.62);
    ctx.textAlign = 'left';

  } else if (content === 'text') {
    // Snellen Acuity Typography Test Chart
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('VISUAL ACUITY & TYPOGRAPHY LEGIBILITY TEST CHART', 14, 18);

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';

    ctx.font = '900 34px sans-serif';
    ctx.fillText('E D F C Z P', w / 2, 75);
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('20/200 SNELLEN (COARSE DISTANCE)', w / 2, 90);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('F E L O P Z D 1 2 3 4 5', w / 2, 122);
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('20/100 THRESHOLD', w / 2, 136);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('D E F P O T E C · PACKAGING COMPARISON', w / 2, 166);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('THE QUICK BROWN FOX JUMPS OVER 1234567890 LAZY DOG', w / 2, 194);

    ctx.font = 'bold 8px monospace';
    ctx.fillText('HIGH-CONTRAST 8PT VECTOR FONT // EVALUATE STROKE SEPARATION & DIODE RASTER ARTIFACTS', w / 2, 216);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(30, 235, w - 60, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('CRITICAL RESOLUTION VERIFIED // SUBPIXEL MATRIX RESOLVED', w / 2, 251);

    ctx.textAlign = 'left';

  } else {
    // 10-Bit Grayscale Spectrum
    for (let x = 0; x < w; x++) {
      const hue = (x / w) * 360;
      ctx.fillStyle = `hsl(${hue}, 85%, 48%)`;
      ctx.fillRect(x, 0, 1, h * 0.65);
    }

    const steps = 16;
    const stepW = w / steps;
    for (let s = 0; s < steps; s++) {
      const val = Math.round((s / (steps - 1)) * 255);
      ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      ctx.fillRect(s * stepW, h * 0.65, stepW, h * 0.35);

      ctx.fillStyle = s < 8 ? '#ffffff' : '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${Math.round((s / 15) * 100)}%`, s * stepW + 4, h * 0.85);
    }
  }
}

function renderPixelAcuitySurface(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  width: number,
  height: number,
  p: number,
  dist: number,
  content: TestPatternType,
  packaging: PackagingType,
  angle: number
) {
  const retinaDist = (p / 1000) * 3437.75;
  const gridContrast = (dist >= retinaDist)
    ? 0.0
    : Math.pow(Math.max(0, 1.0 - (dist / retinaDist)), 1.35);

  drawNativeTestPattern(ctx, width, height, content, packaging);

  // Off-axis viewing angle luminance attenuation & color shift
  if (angle > 0) {
    let angleLuminance = 1.0;
    if (packaging === 'smd') {
      angleLuminance = Math.cos((angle * Math.PI) / 180) * 0.9;
    } else if (packaging === 'gob') {
      angleLuminance = Math.cos((angle * 0.84 * Math.PI) / 180);
    } else if (packaging === 'cob') {
      angleLuminance = Math.cos((angle * 0.72 * Math.PI) / 180);
    } else {
      angleLuminance = Math.cos((angle * 0.8 * Math.PI) / 180);
    }

    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0, 1.0 - angleLuminance).toFixed(3)})`;
    ctx.fillRect(startX, startY, width, height);
    ctx.restore();
  }

  // Black matrix diode grid overlay
  if (gridContrast > 0.02) {
    ctx.save();
    const baseStep = Math.max(3, Math.round((p / 2.6) * 6));

    let fillFactor = 0.32;
    if (packaging === 'gob') fillFactor = 0.58;
    else if (packaging === 'cob') fillFactor = 0.82;
    else if (packaging === 'mip') fillFactor = 0.44;

    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = width;
    gridCanvas.height = height;
    const gctx = gridCanvas.getContext('2d');

    if (gctx) {
      const maskAlpha = (1.0 - fillFactor) * gridContrast;
      gctx.fillStyle = `rgba(5, 7, 12, ${maskAlpha.toFixed(3)})`;
      gctx.fillRect(0, 0, width, height);

      gctx.globalCompositeOperation = 'destination-out';
      const diodeSize = Math.max(2, Math.round(baseStep * Math.sqrt(fillFactor)));
      const offset = Math.round((baseStep - diodeSize) / 2);

      for (let y = 0; y < height; y += baseStep) {
        for (let x = 0; x < width; x += baseStep) {
          const dx = x + offset;
          const dy = y + offset;

          if (packaging === 'smd') {
            gctx.beginPath();
            gctx.roundRect(dx, dy, diodeSize, diodeSize, 1);
            gctx.fill();
          } else if (packaging === 'gob') {
            gctx.beginPath();
            gctx.roundRect(dx, dy, diodeSize, diodeSize, Math.max(1, diodeSize * 0.3));
            gctx.fill();
          } else if (packaging === 'cob') {
            gctx.fillRect(dx, dy, diodeSize + 1, diodeSize + 1);
          } else {
            gctx.fillRect(dx, dy, diodeSize, diodeSize);
          }
        }
      }

      ctx.drawImage(gridCanvas, startX, startY);
    }

    // GOB epoxy resin glaze sheen
    if (packaging === 'gob') {
      const resinSheen = ctx.createLinearGradient(startX, startY, startX + width, startY + height);
      resinSheen.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      resinSheen.addColorStop(0.5, 'rgba(251, 191, 36, 0.02)');
      resinSheen.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
      ctx.fillStyle = resinSheen;
      ctx.fillRect(startX, startY, width, height);
    }

    ctx.restore();
  }
}

function render3DVenuePerspective(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  dist: number
) {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#030712');
  bgGrad.addColorStop(0.55, '#0b1120');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const vanishingX = w / 2;
  const vanishingY = h * 0.44;

  // Soundstage grid lines
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
  ctx.lineWidth = 1;
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(vanishingX, vanishingY);
    ctx.lineTo(w / 2 + i * 90, 0);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
  for (let i = -7; i <= 7; i++) {
    ctx.beginPath();
    ctx.moveTo(vanishingX, vanishingY + 30);
    ctx.lineTo(w / 2 + i * 90, h);
    ctx.stroke();
  }

  // Distance floor marks
  const meterMarks = [1, 2, 3, 5, 8, 12, 20];
  ctx.font = '8px monospace';
  meterMarks.forEach((m) => {
    const depthT = 1 / (1 + m * 0.22);
    const py = vanishingY + 30 + (1 - depthT) * (h - vanishingY - 30);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.beginPath();
    ctx.moveTo(vanishingX - (1 - depthT) * (w * 0.48), py);
    ctx.lineTo(vanishingX + (1 - depthT) * (w * 0.48), py);
    ctx.stroke();

    ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
    ctx.fillText(`${m}m`, vanishingX - 12, py - 3);
  });

  // LED Wall on soundstage
  const wallW = w * 0.54;
  const wallH = wallW * (9 / 16);
  const wallX = (w - wallW) / 2;
  const wallY = vanishingY - wallH + 30;

  // Wall ambient glow
  const wallGlow = ctx.createRadialGradient(
    vanishingX,
    wallY + wallH / 2,
    20,
    vanishingX,
    wallY + wallH / 2,
    wallW * 0.8
  );
  wallGlow.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
  wallGlow.addColorStop(0.6, 'rgba(14, 165, 233, 0.08)');
  wallGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = wallGlow;
  ctx.fillRect(0, 0, w, h);

  // Screen chassis border
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(wallX - 3, wallY - 3, wallW + 6, wallH + 6, 4);
  ctx.fill();
  ctx.stroke();

  // Screen gradient content
  const screenGrad = ctx.createLinearGradient(wallX, wallY, wallX + wallW, wallY + wallH);
  screenGrad.addColorStop(0, '#1e1b4b');
  screenGrad.addColorStop(0.5, '#0369a1');
  screenGrad.addColorStop(1, '#065f46');
  ctx.fillStyle = screenGrad;
  ctx.beginPath();
  ctx.roundRect(wallX, wallY, wallW, wallH, 3);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NOVASTAR ARCHITECTURAL VENUE', vanishingX, wallY + wallH * 0.45);
  ctx.fillStyle = '#fbbf24';
  ctx.font = '9px monospace';
  ctx.fillText(`P${p.toFixed(2)}mm Matrix · 16:9 Cinema Array`, vanishingX, wallY + wallH * 0.62);
  ctx.textAlign = 'left';

  // Floor reflection
  const reflH = wallH * 0.35;
  const reflGrad = ctx.createLinearGradient(0, wallY + wallH, 0, wallY + wallH + reflH);
  reflGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
  reflGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = reflGrad;
  ctx.fillRect(wallX, wallY + wallH + 2, wallW, reflH);

  // Scale-accurate human observer silhouette at distance
  const obsDepthT = 1 / (1 + dist * 0.18);
  const obsFloorY = vanishingY + 30 + (1 - obsDepthT) * (h - vanishingY - 45);
  const obsX = vanishingX;
  const obsHeight = Math.max(26, Math.min(130, 160 * (1 - obsDepthT * 0.72)));
  const obsWidth = obsHeight * 0.32;
  const obsTopY = obsFloorY - obsHeight;

  // Sightline rays
  const eyeY = obsTopY + obsHeight * 0.2;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(obsX, eyeY);
  ctx.lineTo(wallX, wallY + wallH / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(obsX, eyeY);
  ctx.lineTo(wallX + wallW, wallY + wallH / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Silhouette body
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(obsX, obsFloorY, obsWidth * 1.4, obsWidth * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(obsX, obsTopY + obsWidth * 0.5, obsWidth * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(obsX - obsWidth * 0.4, obsTopY + obsWidth * 0.85, obsWidth * 0.8, obsHeight * 0.5, 3);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(obsX - obsWidth * 0.35, obsTopY + obsHeight * 0.55, obsWidth * 0.3, obsHeight * 0.45);
  ctx.fillRect(obsX + obsWidth * 0.05, obsTopY + obsHeight * 0.55, obsWidth * 0.3, obsHeight * 0.45);

  // HUD box above observer
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  const hudBoxW = 230;
  const hudBoxH = 34;
  const hudBoxX = Math.max(10, Math.min(w - hudBoxW - 10, obsX - hudBoxW / 2));
  const hudBoxY = Math.max(10, obsTopY - hudBoxH - 8);

  ctx.beginPath();
  ctx.roundRect(hudBoxX, hudBoxY, hudBoxW, hudBoxH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`VIEWER AT: ${dist.toFixed(1)}m (${(dist * 3.28084).toFixed(1)} ft) DISTANCE`, hudBoxX + 8, hudBoxY + 13);

  const retinaDist = (p / 1000) * 3437.75;
  const isRetina = dist >= retinaDist;
  ctx.fillStyle = isRetina ? '#22c55e' : dist >= p ? '#f59e0b' : '#ef4444';
  ctx.font = '8px monospace';
  ctx.fillText(
    isRetina
      ? '● RETINA RESOLVED (Seamless visual acuity)'
      : dist >= p
      ? '▲ COMFORTABLE (Minor grid discernable)'
      : '■ CLOSE UP (Individual diodes distinct)',
    hudBoxX + 8,
    hudBoxY + 26
  );
}

function renderCameraMoireSimulation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: number,
  dist: number,
  content: TestPatternType,
  packaging: PackagingType,
  angle: number,
  sensor: 'arri' | 'red' | 'venice'
) {
  renderPixelAcuitySurface(ctx, 0, 0, w, h, p, dist, content, packaging, angle);

  // Spatial frequency beat interference (moiré)
  const sensorPitchFactor = sensor === 'arri' ? 1.0 : sensor === 'red' ? 1.2 : 1.35;
  const moireIntensity = Math.max(0, Math.min(0.55, ((1.8 / dist) * (p / 2.5)) * sensorPitchFactor));

  if (moireIntensity > 0.05) {
    const moireCanvas = document.createElement('canvas');
    moireCanvas.width = w;
    moireCanvas.height = h;
    const mctx = moireCanvas.getContext('2d');

    if (mctx) {
      const cx = w * 0.45;
      const cy = h * 0.52;
      const ringStep = Math.max(4, 22 - p * 1.5);

      for (let r = 0; r < Math.max(w, h); r += ringStep) {
        mctx.beginPath();
        mctx.arc(cx, cy, r, 0, Math.PI * 2);
        mctx.strokeStyle = r % (ringStep * 2) === 0 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(59, 130, 246, 0.35)';
        mctx.lineWidth = ringStep * 0.5;
        mctx.stroke();
      }

      mctx.strokeStyle = 'rgba(0, 255, 170, 0.2)';
      mctx.lineWidth = 1;
      for (let y = 0; y < h; y += 6) {
        mctx.beginPath();
        mctx.moveTo(0, y);
        mctx.lineTo(w, y + p * 8);
        mctx.stroke();
      }

      ctx.save();
      ctx.globalAlpha = moireIntensity;
      ctx.globalCompositeOperation = 'difference';
      ctx.drawImage(moireCanvas, 0, 0);
      ctx.restore();
    }
  }

  // Camera viewfinder framing
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  const padX = 35;
  const padY = 25;
  const len = 20;
  ctx.beginPath();
  ctx.moveTo(padX, padY + len);
  ctx.lineTo(padX, padY);
  ctx.lineTo(padX + len, padY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w - padX - len, padY);
  ctx.lineTo(w - padX, padY);
  ctx.lineTo(w - padX, padY + len);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padX, h - padY - len);
  ctx.lineTo(padX, padY);
  ctx.stroke();

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(w / 2 - 10, h / 2);
  ctx.lineTo(w / 2 + 10, h / 2);
  ctx.moveTo(w / 2, h / 2 - 10);
  ctx.lineTo(w / 2, h / 2 + 10);
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
  ctx.stroke();

  // Moiré telemetry HUD
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(padX, padY - 20, 310, 18);
  ctx.fillStyle = moireIntensity > 0.25 ? '#ef4444' : moireIntensity > 0.1 ? '#f59e0b' : '#10b981';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(
    `● CINEMA SENSOR: ${sensor.toUpperCase()} · MOIRÉ RISK: ${
      moireIntensity > 0.25 ? 'HIGH (Aliasing active)' : moireIntensity > 0.1 ? 'MEDIUM (Optical filter recommended)' : 'SAFE (Zero beat frequency)'
    }`,
    padX + 6,
    padY - 7
  );
  ctx.restore();
}

function renderMicroLoupe(
  ctx: CanvasRenderingContext2D,
  p: number,
  packaging: PackagingType,
  pos: { x: number; y: number }
) {
  const loupeW = 150;
  const loupeH = 95;
  let loupeX = pos.x - loupeW / 2;
  let loupeY = pos.y - loupeH - 15;

  if (loupeX < 10) loupeX = 10;
  if (loupeX + loupeW > ctx.canvas.width - 10) loupeX = ctx.canvas.width - loupeW - 10;
  if (loupeY < 10) loupeY = pos.y + 20;
  if (loupeY + loupeH > ctx.canvas.height - 10) loupeY = ctx.canvas.height - loupeH - 10;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
  ctx.strokeStyle = packaging === 'gob' ? '#f59e0b' : packaging === 'cob' ? '#38bdf8' : '#64748b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(loupeX, loupeY, loupeW, loupeH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(loupeX + 2, loupeY + 2, loupeW - 4, loupeH - 4, 4);
  ctx.clip();

  const microCols = 4;
  const microRows = 3;
  const diodePitchPx = Math.floor((loupeW - 10) / microCols);
  const diodeSize = Math.floor(diodePitchPx * 0.72);

  for (let mx = 0; mx < microCols; mx++) {
    for (let my = 0; my < microRows; my++) {
      const dx = loupeX + 8 + mx * diodePitchPx;
      const dy = loupeY + 8 + my * diodePitchPx;

      ctx.fillStyle = '#020617';
      ctx.fillRect(dx - 1, dy - 1, diodeSize + 2, diodeSize + 2);

      if (packaging === 'smd') {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(dx, dy, diodeSize, diodeSize, 2);
        ctx.fill();

        const subW = Math.max(2, Math.floor(diodeSize / 4));
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(dx + 2, dy + 3, subW, diodeSize - 6);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(dx + 2 + subW + 1, dy + 3, subW, diodeSize - 6);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(dx + 2 + subW * 2 + 2, dy + 3, subW, diodeSize - 6);
      } else if (packaging === 'gob') {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(dx, dy, diodeSize, diodeSize, 3);
        ctx.fill();

        const subW = Math.max(2, Math.floor(diodeSize / 4));
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(dx + 2, dy + 3, subW, diodeSize - 6);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(dx + 2 + subW + 1, dy + 3, subW, diodeSize - 6);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(dx + 2 + subW * 2 + 2, dy + 3, subW, diodeSize - 6);

        // Epoxy resin glaze
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.fillRect(dx - 1, dy - 1, diodeSize + 2, diodeSize + 2);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(dx - 1, dy - 1, diodeSize + 2, diodeSize + 2);
      } else if (packaging === 'cob') {
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(dx, dy, diodeSize, diodeSize);

        const chipSize = Math.max(2, Math.floor(diodeSize * 0.25));
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(dx + 2, dy + diodeSize / 2 - chipSize / 2, chipSize, chipSize);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(dx + diodeSize / 2 - chipSize / 2, dy + diodeSize / 2 - chipSize / 2, chipSize, chipSize);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(dx + diodeSize - chipSize - 2, dy + diodeSize / 2 - chipSize / 2, chipSize, chipSize);

        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fillRect(dx, dy, diodeSize, diodeSize);
      } else {
        // MIP
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.roundRect(dx + 2, dy + 2, diodeSize - 4, diodeSize - 4, 2);
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(dx + diodeSize / 2, dy + diodeSize / 2, Math.max(2, diodeSize * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const ppi = 25.4 / p;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
  ctx.fillRect(loupeX + 2, loupeY + loupeH - 16, loupeW - 4, 14);
  ctx.fillStyle = packaging === 'gob' ? '#fde047' : '#e2e8f0';
  ctx.font = '8px monospace';
  ctx.fillText(`P${p.toFixed(2)}mm · ${ppi.toFixed(1)} PPI (${packaging.toUpperCase()})`, loupeX + 6, loupeY + loupeH - 6);
  ctx.restore();
}
