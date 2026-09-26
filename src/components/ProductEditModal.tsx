import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  ScanLine
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product, Brand, Category } from '../types/inventory';
import { ProductVisual } from './ProductVisual';

export const ProductEditModal: React.FC = () => {
  const { 
    isProductModalOpen, 
    productToEdit, 
    closeProductModal, 
    updateProduct, 
    addProduct,
    addStockMovement
  } = useInventory();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [presentation, setPresentation] = useState('');
  const [brand, setBrand] = useState<Brand>('Nivea');
  const [customBrand, setCustomBrand] = useState('');
  const [isCustomBrand, setIsCustomBrand] = useState(false);

  const [category, setCategory] = useState<Category>('Cuidado Corporal');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [commercialPrice, setCommercialPrice] = useState<number>(100);
  const [wholesalePrice, setWholesalePrice] = useState<number>(60);
  const [promoPrice, setPromoPrice] = useState<number>(40);
  const [autoCalculateDiscounts, setAutoCalculateDiscounts] = useState(true);

  const [stock, setStock] = useState<number>(5);
  const [minStockAlert, setMinStockAlert] = useState<number>(2);
  const [description, setDescription] = useState('');
  const [packagingType, setPackagingType] = useState<Product['packagingType']>('bottle');
  const [volume, setVolume] = useState('');
  
  // Image handling
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [imageError, setImageError] = useState('');

  // Check if editing an existing saved product with an ID
  const isExisting = Boolean(productToEdit && 'id' in productToEdit && productToEdit.id);

  // Synchronize when productToEdit changes
  useEffect(() => {
    if (productToEdit && 'id' in productToEdit && productToEdit.id) {
      setName(productToEdit.name ?? '');
      setSku(productToEdit.sku ?? '');
      setBarcode(productToEdit.barcode ?? '');
      setPresentation(productToEdit.presentation ?? '');
      
      const standardBrands = ['Nivea', 'Eucerin', 'Aquaphor', 'Aquaphor Baby', 'Nivea Men', 'Aquaphor / Eucerin'];
      const editBrand = productToEdit.brand || 'Nivea';
      if (standardBrands.includes(editBrand)) {
        setBrand(editBrand as Brand);
        setIsCustomBrand(false);
      } else {
        setBrand('Otro');
        setCustomBrand(editBrand);
        setIsCustomBrand(true);
      }

      const standardCategories = [
        'Cuidado Corporal',
        'Reparación Dermatológica',
        'Cuidado Infantil',
        'Cuidado Facial & Labial',
        'Gel de Ducha',
        'Cuidado Masculino',
        'Protección Solar',
      ];
      const editCategory = productToEdit.category || 'Cuidado Corporal';
      if (standardCategories.includes(editCategory)) {
        setCategory(editCategory as Category);
        setIsCustomCategory(false);
      } else {
        setCategory('Otro');
        setCustomCategory(editCategory);
        setIsCustomCategory(true);
      }

      setCommercialPrice(productToEdit.commercialPrice ?? 100);
      setWholesalePrice(productToEdit.wholesalePrice ?? 60);
      setPromoPrice(productToEdit.promoPrice ?? 40);
      setAutoCalculateDiscounts(false);

      setStock(productToEdit.stock ?? 0);
      setMinStockAlert(productToEdit.minStockAlert ?? 2);
      setDescription(productToEdit.description ?? '');
      setPackagingType(productToEdit.packagingType ?? 'bottle');
      setVolume(productToEdit.volume ?? '');
      setImageUrl(productToEdit.imageUrl ?? '');
      setUrlInput(productToEdit.imageUrl ?? '');
    } else {
      // New product defaults (may have pre-filled barcode from scanner)
      setName(productToEdit?.name ?? '');
      setSku(productToEdit?.sku ?? `SKU-${Date.now().toString().slice(-4)}`);
      setBarcode(productToEdit?.barcode ?? '');
      setPresentation(productToEdit?.presentation ?? 'Botella 400 ml');
      setBrand('Nivea');
      setIsCustomBrand(false);
      setCustomBrand('');
      setCategory('Cuidado Corporal');
      setIsCustomCategory(false);
      setCustomCategory('');
      setCommercialPrice(100);
      setWholesalePrice(60);
      setPromoPrice(40);
      setAutoCalculateDiscounts(true);
      setStock(5);
      setMinStockAlert(2);
      setDescription('');
      setPackagingType('bottle');
      setVolume('400 ml');
      setImageUrl('');
      setUrlInput('');
    }
    setImageError('');
  }, [productToEdit, isProductModalOpen]);

  // Handle commercial price changes & auto discount calculation
  const handleCommercialPriceChange = (val: number) => {
    setCommercialPrice(val);
    if (autoCalculateDiscounts) {
      setWholesalePrice(Number((val * 0.6).toFixed(2))); // -40%
      setPromoPrice(Number((val * 0.4).toFixed(2)));     // -60%
    }
  };

  // Image upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('La imagen no debe superar los 5MB.');
      return;
    }

    setImageError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      setUrlInput('');
    };
    reader.readAsDataURL(file);
  };

  // Set image from web URL
  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setImageUrl('');
      return;
    }
    setImageUrl(urlInput.trim());
    setImageError('');
  };

  // Remove custom image
  const handleRemoveImage = () => {
    setImageUrl('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isProductModalOpen) return null;

  // Mock product object for live preview
  const previewProduct: Product = {
    id: isExisting ? (productToEdit as Product).id : 'preview-id',
    sku: sku || 'SKU-000',
    barcode: barcode.trim() || undefined,
    name: name || 'Nombre del Producto',
    presentation: presentation || 'Presentación',
    brand: isCustomBrand ? customBrand || 'Marca' : brand,
    category: isCustomCategory ? customCategory || 'Categoría' : category,
    commercialPrice: commercialPrice || 0,
    wholesalePrice: wholesalePrice || 0,
    promoPrice: promoPrice || 0,
    stock: stock || 0,
    minStockAlert: minStockAlert || 2,
    description,
    packagingType,
    volume: volume || presentation,
    imageUrl: imageUrl || undefined,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setImageError('El nombre del producto es obligatorio.');
      return;
    }

    const finalBrand = isCustomBrand ? customBrand.trim() || 'Marca General' : brand;
    const finalCategory = isCustomCategory ? customCategory.trim() || 'Cuidado Corporal' : category;

    if (isExisting) {
      const existing = productToEdit as Product;
      // Stock diff for Kardex
      const prevStock = existing.stock;
      const stockDiff = stock - prevStock;

      const updated: Product = {
        ...existing,
        name: name.trim(),
        sku: sku.trim(),
        barcode: barcode.trim() || undefined,
        presentation: presentation.trim(),
        brand: finalBrand,
        category: finalCategory,
        commercialPrice: Number(commercialPrice),
        wholesalePrice: Number(wholesalePrice),
        promoPrice: Number(promoPrice),
        stock: Number(stock),
        minStockAlert: Number(minStockAlert),
        description: description.trim(),
        packagingType,
        volume: volume.trim() || presentation.trim(),
        imageUrl: imageUrl.trim() || undefined,
      };

      updateProduct(updated);

      if (stockDiff !== 0) {
        addStockMovement(
          updated.id,
          'ajuste',
          stock,
          `Ajuste manual de existencias al editar (${stockDiff > 0 ? '+' : ''}${stockDiff} pzas)`,
          'EDIT-PRODUCT'
        );
      }
    } else {
      addProduct({
        sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        presentation: presentation.trim(),
        brand: finalBrand,
        category: finalCategory,
        commercialPrice: Number(commercialPrice),
        wholesalePrice: Number(wholesalePrice),
        promoPrice: Number(promoPrice),
        stock: Number(stock),
        minStockAlert: Number(minStockAlert),
        description: description.trim(),
        packagingType,
        volume: volume.trim() || presentation.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });
    }

    closeProductModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold">
              {isExisting ? 'Editar Producto y Modificar Imagen' : 'Agregar Nuevo Producto al Catálogo'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isExisting 
                ? `Actualiza información, código de barras, precios y fotografía de "${(productToEdit as Product).name}"`
                : 'Completa los campos para catalogar un nuevo artículo con código de barras, foto e inventario'}
            </p>
          </div>
          <button
            onClick={closeProductModal}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with 2-Column Split: Form Left, Real-Time Preview Right */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form Controls (7 cols) */}
          <form id="product-edit-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
            
            {/* SECTION 1: FOTOGRAFÍA / IMAGEN DEL PRODUCTO */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Imagen / Fotografía del Producto
                </span>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar foto personalizada</span>
                  </button>
                )}
              </div>

              {/* Tabs for Image input mode */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`py-1.5 px-3 rounded-lg font-medium transition-colors cursor-pointer ${
                    imageInputMode === 'upload'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  Subir desde Dispositivo
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`py-1.5 px-3 rounded-lg font-medium transition-colors cursor-pointer ${
                    imageInputMode === 'url'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 inline mr-1" />
                  URL de Imagen Web
                </button>
              </div>

              {imageInputMode === 'upload' ? (
                <div key="image-upload-wrapper">
                  <input
                    key="file-input-upload"
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <label
                    htmlFor="product-image-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 bg-white cursor-pointer transition-colors text-center"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">
                      Haz clic para seleccionar una foto de tu equipo o teléfono
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Formatos compatibles: PNG, JPG, WebP (máx. 5MB)
                    </span>
                  </label>
                </div>
              ) : (
                <div key="image-url-wrapper" className="flex gap-2">
                  <input
                    key="url-input-field"
                    type="url"
                    placeholder="https://ejemplo.com/foto-producto.jpg"
                    value={urlInput || ''}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="py-2 px-3 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              )}

              {imageError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              {/* Alternative visual style if no custom image */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Estilo de Empaque Predeterminado (render 3D / SVG cuando no hay foto):
                </label>
                <select
                  value={packagingType ?? 'bottle'}
                  onChange={(e: any) => setPackagingType(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bottle">Botella de Loción o Gel (400-500 ml)</option>
                  <option value="large_bottle">Botella Familiar / Maxi (650-1000 ml)</option>
                  <option value="pump">Botella con Dispensador Pump Clínico</option>
                  <option value="tube">Tubo de Ungüento o Crema Dermatológica</option>
                  <option value="tin">Lata Metálica Azul Clásica (Nivea Creme)</option>
                  <option value="lip_balm">Pack x2 Bálsamo Labial en Barra</option>
                  <option value="box">Caja de Tratamiento o Bálsamo After-Shave</option>
                  <option value="jar">Tarro / Pote de Crema Facial</option>
                  <option value="dropper">Frasco Gotero de Serum</option>
                </select>
              </div>
            </div>

            {/* SECTION 2: DATOS DEL PRODUCTO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Producto y Presentación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Nivea Milk Nutritiva (400 ml)"
                  value={name ?? ''}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código SKU / Referencia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. NIV-MILK-400"
                  value={sku ?? ''}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Código de Barras (EAN / UPC / QR)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Escaneable</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej. 7501001150001"
                    value={barcode ?? ''}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <ScanLine className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Presentación / Volumen
                </label>
                <input
                  type="text"
                  placeholder="Ej. 400 ml, 50 g, Pack x2"
                  value={presentation ?? ''}
                  onChange={(e) => {
                    setPresentation(e.target.value);
                    if (!volume) setVolume(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Brand Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marca
                </label>
                <select
                  value={isCustomBrand ? 'Otro' : (brand ?? 'Nivea')}
                  onChange={(e) => {
                    if (e.target.value === 'Otro') {
                      setIsCustomBrand(true);
                    } else {
                      setIsCustomBrand(false);
                      setBrand(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Nivea">Nivea</option>
                  <option value="Eucerin">Eucerin</option>
                  <option value="Aquaphor">Aquaphor</option>
                  <option value="Aquaphor / Eucerin">Aquaphor / Eucerin</option>
                  <option value="Aquaphor Baby">Aquaphor Baby</option>
                  <option value="Nivea Men">Nivea Men</option>
                  <option value="Otro">+ Otra marca personalizada...</option>
                </select>
                {isCustomBrand && (
                  <input
                    key="custom-brand-input"
                    type="text"
                    required
                    placeholder="Escribe el nombre de la marca"
                    value={customBrand || ''}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  />
                )}
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoría
                </label>
                <select
                  value={isCustomCategory ? 'Otro' : (category || 'Cuidado Corporal')}
                  onChange={(e) => {
                    if (e.target.value === 'Otro') {
                      setIsCustomCategory(true);
                    } else {
                      setIsCustomCategory(false);
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Cuidado Corporal">Cuidado Corporal</option>
                  <option value="Reparación Dermatológica">Reparación Dermatológica</option>
                  <option value="Cuidado Infantil">Cuidado Infantil</option>
                  <option value="Cuidado Facial & Labial">Cuidado Facial & Labial</option>
                  <option value="Gel de Ducha">Gel de Ducha</option>
                  <option value="Cuidado Masculino">Cuidado Masculino</option>
                  <option value="Protección Solar">Protección Solar</option>
                  <option value="Otro">+ Otra categoría...</option>
                </select>
                {isCustomCategory && (
                  <input
                    key="custom-category-input"
                    type="text"
                    required
                    placeholder="Escribe la categoría"
                    value={customCategory || ''}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  />
                )}
              </div>
            </div>

            {/* SECTION 3: ESTRUCTURA DE PRECIOS */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Estructura de Precios (MXN)
                </span>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(autoCalculateDiscounts)}
                    onChange={(e) => {
                      setAutoCalculateDiscounts(e.target.checked);
                      if (e.target.checked) {
                        setWholesalePrice(Number((commercialPrice * 0.6).toFixed(2)));
                        setPromoPrice(Number((commercialPrice * 0.4).toFixed(2)));
                      }
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>Calcular -40% y -60% automáticamente</span>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    P. Comercial (PVP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={Number.isFinite(commercialPrice) ? commercialPrice : ''}
                      onChange={(e) => handleCommercialPriceChange(parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-blue-700 mb-1">
                    Mayorista (-40%) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400 font-mono text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      disabled={autoCalculateDiscounts}
                      value={Number.isFinite(wholesalePrice) ? wholesalePrice : ''}
                      onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                      className={`w-full pl-6 pr-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold ${
                        autoCalculateDiscounts
                          ? 'bg-blue-50/60 text-blue-900 border-blue-200'
                          : 'bg-white text-blue-900 border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-emerald-700 mb-1">
                    Promoción (-60%) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400 font-mono text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      disabled={autoCalculateDiscounts}
                      value={Number.isFinite(promoPrice) ? promoPrice : ''}
                      onChange={(e) => setPromoPrice(parseFloat(e.target.value) || 0)}
                      className={`w-full pl-6 pr-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold ${
                        autoCalculateDiscounts
                          ? 'bg-emerald-50/60 text-emerald-900 border-emerald-200'
                          : 'bg-white text-emerald-900 border-slate-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: INVENTARIO & ALERTAS */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Existencias en Almacén (Piezas) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={Number.isFinite(stock) ? stock : ''}
                  onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Umbral de Alerta de Stock Bajo
                </label>
                <input
                  type="number"
                  min="1"
                  value={Number.isFinite(minStockAlert) ? minStockAlert : ''}
                  onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción / Beneficios Dermatológicos
              </label>
              <textarea
                rows={3}
                placeholder="Fórmula, modo de uso, propiedades y público objetivo..."
                value={description ?? ''}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </form>

          {/* Right Column: Live Card Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start bg-slate-50/80 p-4 rounded-xl border border-slate-200/90">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Vista Previa en Tienda y Catálogo
            </span>

            {/* Simulated Live Product Card */}
            <div className="w-full max-w-xs bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
              <div className="p-2 bg-[#FBFBF9]">
                <ProductVisual product={previewProduct} size="md" />
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>{previewProduct.category}</span>
                  <span>·</span>
                  <span>{previewProduct.volume}</span>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {previewProduct.name}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-1">
                  {previewProduct.presentation}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Precio Comercial</span>
                    <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      ${previewProduct.commercialPrice.toFixed(2)} MXN
                    </span>
                  </div>

                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Stock: {previewProduct.stock} pzas
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 w-full space-y-1">
              <div className="flex justify-between">
                <span>SKU:</span>
                <span className="font-mono font-bold text-slate-800">{previewProduct.sku}</span>
              </div>
              {previewProduct.barcode && (
                <div className="flex justify-between">
                  <span>Código de Barras:</span>
                  <span className="font-mono font-bold text-slate-800">{previewProduct.barcode}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Precio Mayoreo (-40%):</span>
                <span className="font-mono text-blue-700 font-semibold">${previewProduct.wholesalePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Precio Promoción (-60%):</span>
                <span className="font-mono text-emerald-700 font-semibold">${previewProduct.promoPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estado de Alerta:</span>
                <span className={`font-semibold ${previewProduct.stock <= previewProduct.minStockAlert ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {previewProduct.stock === 0 ? 'Agotado' : previewProduct.stock <= previewProduct.minStockAlert ? 'Crítico' : 'Normal'}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={closeProductModal}
            className="py-2 px-4 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="product-edit-form"
            className="flex items-center gap-1.5 py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{productToEdit ? 'Guardar Cambios' : 'Agregar al Catálogo'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
