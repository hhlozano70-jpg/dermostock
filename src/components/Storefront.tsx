import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  BadgePercent, 
  HelpCircle,
  Tag,
  Plus
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ProductCard } from './ProductCard';
import { PriceTier, Brand } from '../types/inventory';

export const Storefront: React.FC = () => {
  const { products, priceTier, setPriceTier, openProductModal } = useInventory();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const brands = ['all', 'Nivea', 'Eucerin', 'Aquaphor', 'Aquaphor Baby', 'Nivea Men'];

  const categories = [
    'all',
    'Cuidado Corporal',
    'Reparación Dermatológica',
    'Cuidado Infantil',
    'Cuidado Facial & Labial',
    'Gel de Ducha',
    'Cuidado Masculino',
    'Protección Solar',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.presentation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchBrand =
        selectedBrand === 'all' ||
        p.brand.toLowerCase() === selectedBrand.toLowerCase() ||
        (selectedBrand === 'Aquaphor' && p.brand.includes('Aquaphor')) ||
        (selectedBrand === 'Eucerin' && p.brand.includes('Eucerin'));

      const matchCategory =
        selectedCategory === 'all' || p.category === selectedCategory;

      return matchSearch && matchBrand && matchCategory;
    });
  }, [products, searchTerm, selectedBrand, selectedCategory]);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          
          {/* Subtle header label */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
            <span>Catálogo Dermocosmético Oficial</span>
            <span aria-hidden="true">·</span>
            <span>Precios Especiales 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight font-serif text-white max-w-3xl mx-auto leading-tight">
            Cuidado Dermatológico Integral al Mejor Precio
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Fórmulas líderes de Nivea, Eucerin y Aquaphor para hidratación profunda, reparación cutánea y cuidado pediátrico. Compra al menudeo o aprovecha descuentos por mayoreo y promociones especiales.
          </p>

          {/* Price Tier Switcher Interactive Showcase */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="bg-slate-800/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl grid grid-cols-3 gap-1.5">
              
              <button
                type="button"
                onClick={() => setPriceTier('comercial')}
                className={`py-3 px-3 rounded-xl transition-all text-left flex flex-col justify-center cursor-pointer ${
                  priceTier === 'comercial'
                    ? 'bg-white text-slate-900 shadow-md ring-2 ring-blue-500/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">Comercial</span>
                  {priceTier === 'comercial' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className="text-[11px] opacity-80 mt-0.5">Precio Regular PVP</span>
              </button>

              <button
                type="button"
                onClick={() => setPriceTier('mayorista')}
                className={`py-3 px-3 rounded-xl transition-all text-left flex flex-col justify-center cursor-pointer ${
                  priceTier === 'mayorista'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">Mayorista</span>
                  <span className="text-[10px] font-extrabold bg-blue-800/80 px-1.5 py-0.5 rounded">
                    -40%
                  </span>
                </div>
                <span className="text-[11px] opacity-85 mt-0.5">Para revendedores</span>
              </button>

              <button
                type="button"
                onClick={() => setPriceTier('promocion')}
                className={`py-3 px-3 rounded-xl transition-all text-left flex flex-col justify-center cursor-pointer ${
                  priceTier === 'promocion'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">Promoción</span>
                  <span className="text-[10px] font-extrabold bg-emerald-800/80 px-1.5 py-0.5 rounded">
                    -60%
                  </span>
                </div>
                <span className="text-[11px] opacity-85 mt-0.5">Oferta Liquidación</span>
              </button>

            </div>

            <div className="text-center text-xs text-slate-400 mt-2.5 flex items-center justify-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Tarifa activa:{' '}
                <strong className="text-white uppercase font-mono">
                  {priceTier === 'comercial'
                    ? 'Comercial (Sin Descuento)'
                    : priceTier === 'mayorista'
                    ? 'Mayorista (-40% Directo)'
                    : 'Promoción (-60% Directo)'}
                </strong>
                . Los precios de todas las fichas reflejan este régimen.
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* Trust & Guarantees bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 px-6 bg-white rounded-xl border border-slate-200/80 shadow-xs text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <strong className="text-slate-900 block font-semibold">100% Originales y Sellados</strong>
              <span>Productos dermatológicos garantizados con lote verificado.</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <strong className="text-slate-900 block font-semibold">Envíos Locales y Nacionales</strong>
              <span>Despacho ágil en menos de 24 horas hábiles.</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BadgePercent className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="text-slate-900 block font-semibold">Precios de Mayorista y Promo</strong>
              <span>Ahorra hasta 60% en compras de volumen o liquidación.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Search bar & Brand chips */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedBrand === brand
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {brand === 'all' ? 'Todas las Marcas' : brand}
              </button>
            ))}
          </div>

          {/* Search Input & Add Product CTA */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                key="storefront-search-input"
                type="text"
                placeholder="Buscar crema, loción, bálsamo..."
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs"
              />
            </div>

            <button
              type="button"
              onClick={() => openProductModal(null)}
              className="flex items-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              title="Agregar un nuevo producto al catálogo"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Producto</span>
            </button>
          </div>

        </div>

        {/* Category Pill Sub-nav */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">Categorías:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-100/80 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'Ver todo' : cat}
            </button>
          ))}
        </div>

        {/* Results Count & Current Filter Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
          <span>
            Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos
          </span>
          {(selectedBrand !== 'all' || selectedCategory !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedBrand('all');
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>

      </section>

      {/* Product Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
            <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              No encontramos productos que coincidan
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Intenta buscar por otro término o restablece los filtros de marca y categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
