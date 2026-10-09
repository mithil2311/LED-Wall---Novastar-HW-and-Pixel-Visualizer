import React from 'react';
import { CreditCard, X, Wifi } from 'lucide-react';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenPpi: number;
  onScreenPpiChange: (ppi: number) => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  screenPpi,
  onScreenPpiChange
}) => {
  if (!isOpen) return null;

  // Real credit card width is 85.6 mm = 3.37 inches
  // Pixels = 3.37 * PPI
  const cardPxWidth = Math.round((85.6 / 25.4) * screenPpi);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span>1:1 Life-Size Screen Calibration</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Hold a physical <strong>credit card</strong> or driver's license against your display. Drag the calibration slider until the simulated card below matches your card's exact physical width (<span className="font-mono text-amber-300 font-bold">85.6 mm</span>).
        </p>

        {/* The Calibration Card Render Target */}
        <div className="flex items-center justify-center p-4 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
          <div
            style={{ width: `${cardPxWidth}px`, height: `${Math.round(cardPxWidth * 0.63)}px` }}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800 rounded-lg shadow-xl text-white p-3.5 flex flex-col justify-between transition-all"
          >
            <div className="flex justify-between items-center text-[10px] font-mono text-blue-200">
              <span>CALIBRATION CARD</span>
              <Wifi className="w-3.5 h-3.5" />
            </div>
            <div className="font-mono text-xs tracking-widest text-slate-200">
              •••• •••• •••• 85.6mm
            </div>
            <div className="text-[9px] text-blue-300 uppercase font-mono">
              Real-World Standard ID-1 Form Factor
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Calibrated Screen Density</span>
            <span className="font-mono text-blue-400 font-bold">{screenPpi} PPI</span>
          </div>
          <input
            type="range"
            min="72"
            max="240"
            step="1"
            value={screenPpi}
            onChange={(e) => onScreenPpiChange(parseInt(e.target.value) || 96)}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>72 PPI (Old Display)</span>
            <span>96 PPI (Standard 1080p)</span>
            <span>220 PPI (Retina Laptop)</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-lg transition-colors shadow"
        >
          Save & Apply 1:1 Scale
        </button>
      </div>
    </div>
  );
};
