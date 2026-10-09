import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Cpu, Layers, FileCode } from 'lucide-react';
import { CONTROLLER_MODELS, RECEIVING_CARDS } from '../data/novastarData';
import { ControllerCategory } from '../types/novastar';

export const CompatibilityEngine: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModelKey, setSelectedModelKey] = useState<string>('mx40pro');
  const [selectedCardKey, setSelectedCardKey] = useState<string>('armor_a10s');
  const [matrixFilter, setMatrixFilter] = useState<'all' | 'traditional' | 'hseries' | 'coex'>('all');

  const model = CONTROLLER_MODELS[selectedModelKey] || CONTROLLER_MODELS.mx40pro;
  const card = RECEIVING_CARDS[selectedCardKey];

  // Evaluate compatibility
  let isCompatible = false;
  let verdictTitle = '';
  let verdictReason = '';
  let fileType = model.ncp
    ? '.ncp (NovaStar Cabinet Package)'
    : model.category === 'hseries'
    ? '.rcfgx (via Web GUI / FPGA Crossbar)'
    : '.rcfgx (Cabinet Configuration File)';

  if (selectedCardKey === 'all') {
    // Overview mode
    verdictTitle = `${model.name} Ecosystem Overview`;
    verdictReason = `Active in the ${
      model.eco === 'coex'
        ? 'COEX VMP Platform'
        : model.eco === 'hseries'
        ? 'H Series Modular Matrix Splicer Platform'
        : 'Traditional NovaLCT Platform'
    }. Drives up to ${model.load} total pixels managed via ${model.software}.`;
  } else {
    // Specific card check
    if (selectedCardKey === 'mrv' && model.mrv) isCompatible = true;
    if (selectedCardKey === 'dh' && model.dh) isCompatible = true;
    if (selectedCardKey === 'br' && model.br) isCompatible = true;
    if (selectedCardKey === 'at' && model.br) isCompatible = true;
    if ((selectedCardKey === 'armor' || selectedCardKey === 'armor_a10s') && model.armor) isCompatible = true;
    if (selectedCardKey === 'caxa' && model.caxa) isCompatible = true;

    if (isCompatible) {
      verdictTitle = 'Verified Hardware Pair';
      if (model.eco === 'coex') {
        verdictReason = `Fully compatible under Vision Management Platform (VMP) driving up to ${model.load}. Requires the cabinet manufacturer to generate a validated .ncp package file to activate VMP image processing, Shutter Fit, and full-grayscale calibration.`;
      } else if (model.category === 'hseries') {
        verdictReason = `Fully compatible in the ${model.name} modular chassis via standard RJ45 or Optical sending cards. Managed directly through the embedded FPGA Web GUI.`;
      } else {
        verdictReason = `Fully compatible within the traditional NovaLCT ecosystem driving up to ${model.load} using standard .rcfgx configuration files.`;
      }
    } else {
      verdictTitle = 'Incompatible Hardware Combination';
      if (model.eco === 'coex' && (selectedCardKey === 'mrv' || selectedCardKey === 'dh' || selectedCardKey === 'br')) {
        verdictReason = `Architectural protocol mismatch. COEX controllers require unified .ncp packages and high-level packet framing under VMP. Traditional HUB75 receiving cards (MRV/DH/BR) only accept legacy .rcfgx configuration profiles via NovaLCT.`;
      } else if (model.category === 'coex5g' && (selectedCardKey === 'armor' || selectedCardKey === 'armor_a10s')) {
        verdictReason = `Physical layer (PHY) mismatch. COEX 5G controllers transmit over 5 Gbps Base-T copper Ethernet. Standard 1G Armor cards cannot negotiate 5G physical PHY links without a 1G down-converter.`;
      } else if ((model.eco === 'traditional' || model.category === 'hseries') && selectedCardKey === 'caxa') {
        verdictReason = `Physical transmission mismatch. CA/XA series cards operate exclusively on 5 Gbps Base-T physical links and cannot communicate with standard 1G Gigabit Ethernet sending ports.`;
      } else {
        verdictReason = `Incompatible platform protocol or physical transmission framework between sending architecture and receiver card.`;
      }
    }
  }

  // Filter models for dropdown
  const filteredModelKeys = Object.keys(CONTROLLER_MODELS).filter((key) => {
    if (selectedCategory === 'all') return true;
    return CONTROLLER_MODELS[key].category === selectedCategory;
  });

  return (
    <section id="compatibility" className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
        {/* Section Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
            <span>Dynamic Logic Verification</span>
            <span aria-hidden="true">·</span>
            <span>PHY Layer Physical Check</span>
            <span aria-hidden="true">·</span>
            <span>VMP .ncp vs NovaLCT .rcfgx</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Interactive Hardware Compatibility & Protocol Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Select any NovaStar sending controller, video processor, or H Series modular chassis to cross-reference pixel loading limits, physical Ethernet PHY standards, and software configuration workflows.
          </p>
        </div>

        {/* 3 Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Controller Family
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                const firstMatching = Object.keys(CONTROLLER_MODELS).find(
                  (k) => e.target.value === 'all' || CONTROLLER_MODELS[k].category === e.target.value
                );
                if (firstMatching) setSelectedModelKey(firstMatching);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 font-medium focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              <option value="all" className="bg-slate-900 text-slate-100">-- All Product Categories --</option>
              <option value="hseries" className="bg-slate-900 text-slate-100">H Series Modular Matrix Splicers (H2 - H20 & H Pro)</option>
              <option value="coex1g" className="bg-slate-900 text-slate-100">COEX 1G Series (VMP Platform)</option>
              <option value="coex5g" className="bg-slate-900 text-slate-100">COEX 5G & Mainframes (VMP Ultra)</option>
              <option value="vx" className="bg-slate-900 text-slate-100">VX & VX Pro All-in-One Processors</option>
              <option value="mctrl" className="bg-slate-900 text-slate-100">MCTRL Series Dedicated Senders</option>
              <option value="taurus" className="bg-slate-900 text-slate-100">Taurus TB Series Cloud Media Players</option>
              <option value="tuseries" className="bg-slate-900 text-slate-100">TU Series Presentation Systems</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sending Hardware Model
            </label>
            <select
              value={selectedModelKey}
              onChange={(e) => setSelectedModelKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 font-medium focus:outline-none font-mono [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              {filteredModelKeys.map((key) => (
                <option key={key} value={key} className="bg-slate-900 text-slate-100">
                  {CONTROLLER_MODELS[key].name} ({CONTROLLER_MODELS[key].load})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Receiving Card Series
            </label>
            <select
              value={selectedCardKey}
              onChange={(e) => setSelectedCardKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 font-medium focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              <option value="all" className="bg-slate-900 text-slate-100">-- All Receiving Card Series (Overview) --</option>
              <option value="mrv" className="bg-slate-900 text-slate-100">MRV Series (Standard Commercial HUB75)</option>
              <option value="dh" className="bg-slate-900 text-slate-100">DH Series (Cost-Effective HUB75)</option>
              <option value="br" className="bg-slate-900 text-slate-100">BR Series (3-in-1 Integrated Power/Hub)</option>
              <option value="at" className="bg-slate-900 text-slate-100">AT Series (Fine-Pitch Commercial Header)</option>
              <option value="armor" className="bg-slate-900 text-slate-100">Armor Series (High-Perf 18-bit+ Board-to-Board)</option>
              <option value="armor_a10s" className="bg-slate-900 text-slate-100">Armor A10s Pro (Flagship 1G Broadcast / xR)</option>
              <option value="caxa" className="bg-slate-900 text-slate-100">CA / XA Series (COEX 5G Base-T High Density)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Compatibility Result Card */}
        <div
          className={`p-6 rounded-xl border transition-all ${
            selectedCardKey === 'all'
              ? 'bg-slate-950 border-slate-800'
              : isCompatible
              ? 'bg-emerald-950/40 border-emerald-800/80'
              : 'bg-rose-950/40 border-rose-800/80'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg text-white ${
                  selectedCardKey === 'all'
                    ? 'bg-blue-600'
                    : isCompatible
                    ? 'bg-emerald-600'
                    : 'bg-rose-600'
                }`}
              >
                {selectedCardKey === 'all' ? (
                  <Cpu className="w-5 h-5" />
                ) : isCompatible ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    selectedCardKey === 'all'
                      ? 'text-blue-400'
                      : isCompatible
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {verdictTitle}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {model.name} {selectedCardKey !== 'all' && `+ ${card?.name}`}
                </h3>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Software Suite</span>
              <span className="text-xs font-bold text-blue-400 font-mono">{model.software}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            {verdictReason}
          </p>

          {/* Quick Technical Specs Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Controller Pixel Capacity</span>
              <span className="font-bold text-amber-400 font-mono text-sm mt-0.5 block">{model.load}</span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Video Inputs / Slots</span>
              <span className="font-bold text-slate-200 text-xs mt-0.5 block truncate">{model.input}</span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Transmission Outputs</span>
              <span className="font-bold text-slate-200 text-xs mt-0.5 block truncate">{model.output}</span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Config File Standard</span>
              <span className="font-bold text-blue-400 font-mono text-xs mt-0.5 block">{fileType}</span>
            </div>
          </div>

          {/* Card compatibility pill indicator strip */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold mr-1">Compatible Receiver Cards:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${model.mrv ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-600 line-through'}`}>MRV Series</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${model.dh ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-600 line-through'}`}>DH Series</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${model.br ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-600 line-through'}`}>BR Series</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${model.armor ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-slate-900 text-slate-600 line-through'}`}>Armor (A5s - A10s)</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${model.caxa ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-900 text-slate-600 line-through'}`}>CA / XA (5G Base-T)</span>
          </div>
        </div>

        {/* Protocol Compatibility Cross-Reference Matrix Table */}
        <div id="matrix" className="space-y-4 pt-6 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Protocol & Hardware Cross-Compatibility Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                System-level reference mapping sending controllers against pixel capacities and receiving card series.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Ecosystem:</span>
              <select
                value={matrixFilter}
                onChange={(e) => setMatrixFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-xs rounded-lg p-1.5 text-slate-200 font-semibold focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="all" className="bg-slate-900 text-slate-100">Show All Ecosystems</option>
                <option value="traditional" className="bg-slate-900 text-slate-100">Traditional NovaLCT Only</option>
                <option value="hseries" className="bg-slate-900 text-slate-100">H Series Modular Only</option>
                <option value="coex" className="bg-slate-900 text-slate-100">COEX VMP Platform Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="p-3 min-w-[200px]">Controller / Chassis</th>
                  <th className="p-3 min-w-[130px]">Max Pixel Load</th>
                  <th className="p-3 min-w-[140px]">Software Suite</th>
                  <th className="p-3 text-center">MRV Series</th>
                  <th className="p-3 text-center">DH Series</th>
                  <th className="p-3 text-center">BR Series</th>
                  <th className="p-3 text-center">Armor 1G</th>
                  <th className="p-3 text-center">Armor A10s Pro</th>
                  <th className="p-3 text-center">CA/XA (5G)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
                {Object.keys(CONTROLLER_MODELS)
                  .filter((key) => {
                    const item = CONTROLLER_MODELS[key];
                    if (matrixFilter === 'traditional') return item.eco === 'traditional';
                    if (matrixFilter === 'hseries') return item.eco === 'hseries';
                    if (matrixFilter === 'coex') return item.eco === 'coex';
                    return true;
                  })
                  .map((key) => {
                    const item = CONTROLLER_MODELS[key];
                    return (
                      <tr key={key} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-white whitespace-nowrap">{item.name}</td>
                        <td className="p-3 font-mono font-bold text-amber-400 whitespace-nowrap">{item.load}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              item.eco === 'coex'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : item.eco === 'hseries'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.software}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {item.mrv ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}
                        </td>
                        <td className="p-3 text-center">
                          {item.dh ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}
                        </td>
                        <td className="p-3 text-center">
                          {item.br ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}
                        </td>
                        <td className="p-3 text-center">
                          {item.armor ? (
                            item.ncp ? (
                              <span className="text-[10px] font-mono font-bold text-blue-400">.NCP</span>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                            )
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-700 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {item.armor ? (
                            item.ncp ? (
                              <span className="text-[10px] font-mono font-bold text-blue-400">.NCP</span>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                            )
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-700 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {item.caxa ? (
                            <span className="text-[10px] font-mono font-bold text-purple-400">5G .NCP</span>
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-700 mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
