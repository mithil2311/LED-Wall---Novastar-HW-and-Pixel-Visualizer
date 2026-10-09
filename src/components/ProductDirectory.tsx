import React, { useState } from 'react';
import { Search, Filter, Server, ArrowUpRight, Cpu, Layers, X, Info } from 'lucide-react';
import { CATALOG_PRODUCTS } from '../data/novastarData';
import { ProductDirectoryItem } from '../types/novastar';

export const ProductDirectory: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'small' | 'medium' | 'large' | 'ultra'>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductDirectoryItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Products', count: CATALOG_PRODUCTS.length },
    { id: 'hseries', label: 'H Series Splicers', count: CATALOG_PRODUCTS.filter(p => p.category === 'hseries').length },
    { id: 'coex', label: 'COEX Processors', count: CATALOG_PRODUCTS.filter(p => p.category === 'coex').length },
    { id: 'vx', label: 'VX & Processors', count: CATALOG_PRODUCTS.filter(p => p.category === 'vx').length },
    { id: 'sync', label: 'Synchronous Senders', count: CATALOG_PRODUCTS.filter(p => p.category === 'sync').length },
    { id: 'async', label: 'Taurus & TU Presentation', count: CATALOG_PRODUCTS.filter(p => p.category === 'async').length },
    { id: 'consoles', label: 'Consoles & Switchers', count: CATALOG_PRODUCTS.filter(p => p.category === 'consoles').length },
    { id: 'servers', label: 'ET Media Servers', count: CATALOG_PRODUCTS.filter(p => p.category === 'servers').length },
    { id: 'cards', label: 'Receiving Cards', count: CATALOG_PRODUCTS.filter(p => p.category === 'cards').length },
    { id: 'peripherals', label: 'Fiber & Sensors', count: CATALOG_PRODUCTS.filter(p => p.category === 'peripherals').length }
  ];

  const filteredProducts = CATALOG_PRODUCTS.filter((item) => {
    // Category match
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;

    // Search query match
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      item.model.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.app.toLowerCase().includes(q) ||
      item.software.toLowerCase().includes(q);

    // Pixel capacity filter
    let matchesCapacity = true;
    if (capacityFilter === 'small') matchesCapacity = item.loadNum < 5.0;
    else if (capacityFilter === 'medium') matchesCapacity = item.loadNum >= 5.0 && item.loadNum <= 30.0;
    else if (capacityFilter === 'large') matchesCapacity = item.loadNum > 30.0 && item.loadNum <= 100.0;
    else if (capacityFilter === 'ultra') matchesCapacity = item.loadNum > 100.0;

    return matchesCategory && matchesSearch && matchesCapacity;
  });

  return (
    <section id="directory" className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
            <span>Enterprise Hardware Inventory</span>
            <span aria-hidden="true">·</span>
            <span>{CATALOG_PRODUCTS.length} Complete NovaStar Hardware Models</span>
            <span aria-hidden="true">·</span>
            <span>Pure Hardware Crossbar to COEX 5G</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Comprehensive NovaStar Product Ecosystem Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Explore hardware specifications, physical I/O configurations, slot counts, pixel loading capacities, and target application scenarios across all {CATALOG_PRODUCTS.length} NovaStar hardware models.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1.5 text-[10px] opacity-75 font-mono">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model (e.g. H9, MX40, CX80, VX1000, A10s)..."
              className="w-full bg-slate-950 border border-slate-700 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs text-slate-400 font-medium">Capacity:</span>
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-xs rounded-lg p-2 text-slate-200 font-semibold focus:outline-none flex-1 sm:flex-initial [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              <option value="all" className="bg-slate-900 text-slate-100">All Pixel Capacities</option>
              <option value="small" className="bg-slate-900 text-slate-100">Compact (&lt; 5M Pixels)</option>
              <option value="medium" className="bg-slate-900 text-slate-100">Medium (5M - 30M Pixels)</option>
              <option value="large" className="bg-slate-900 text-slate-100">High Capacity (30M - 100M Pixels)</option>
              <option value="ultra" className="bg-slate-900 text-slate-100">Ultra Capacity (100M+ Pixels)</option>
            </select>

            <span className="text-xs text-slate-400 font-mono">
              {filteredProducts.length} models
            </span>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 hover:border-slate-700 hover:bg-slate-900/80 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                    {p.model}
                  </h3>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                    {p.eco}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {p.desc}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex justify-between items-center bg-blue-950/40 p-2 rounded border border-blue-900/40">
                  <span className="text-blue-300 font-medium">Max Pixel Load:</span>
                  <span className="font-mono font-bold text-amber-400 text-xs">{p.load}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Software Platform:</span>
                  <span className="text-slate-200 font-mono">{p.software}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Physical Output:</span>
                  <span className="text-slate-200 truncate ml-2 text-right">{p.output}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Product Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl relative">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-mono text-blue-400 uppercase font-bold">
                  {selectedProduct.categoryLabel} · {selectedProduct.eco}
                </span>
                <h3 className="text-lg font-black text-white">{selectedProduct.model}</h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">{selectedProduct.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Max Pixel Loading</span>
                  <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">{selectedProduct.load}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Software Platform</span>
                  <span className="font-mono font-bold text-blue-400 text-xs mt-0.5 block">{selectedProduct.software}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Video Inputs & Slots</span>
                  <span className="text-slate-200 text-xs mt-0.5 block">{selectedProduct.input}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Transmission Output Stage</span>
                  <span className="text-slate-200 text-xs mt-0.5 block">{selectedProduct.output}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Application Scenario</span>
                  <span className="text-slate-200 text-xs mt-0.5 block">{selectedProduct.app}</span>
                </div>
              </div>

              {selectedProduct.highlights && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Key Hardware Architectural Features:</span>
                  <ul className="space-y-1 text-slate-300">
                    {selectedProduct.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors"
              >
                Close Specification Card
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
