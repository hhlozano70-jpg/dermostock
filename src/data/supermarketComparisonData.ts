export interface ComparisonItem {
  id: string;
  storeId: string;
  storeName: string;
  storeBadge: string;
  storeColor: string;
  icon: string;
  productName: string;
  brand: string;
  presentation: string;
  regularPrice: number;
  promoPrice: number;
  isBestPrice?: boolean;
  savingsVsRegular: number;
  sourceUrl?: string;
  isColdChain?: boolean;
  productId?: string;
}

export interface ComparisonCategory {
  id: string;
  title: string;
  icon: string;
  unitLabel: string;
  description: string;
  items: ComparisonItem[];
}

export const SUPERMARKET_COMPARISON_CATEGORIES: ComparisonCategory[] = [
  // 1. LECHE ENTERA (1 LITRO)
  {
    id: 'leche',
    title: 'Leche Entera (1 Litro)',
    icon: '🥛',
    unitLabel: 'Por Litro',
    description: 'Comparativa de marcas de leche entera ultrapasteurizada 100% de vaca en Silao.',
    items: [
      {
        id: 'cmp-leche-3b',
        storeId: 'merch-tiendas-3b',
        storeName: 'Tiendas 3B Silao',
        storeBadge: 'Centro & Sopeña',
        storeColor: 'border-purple-500 bg-purple-950/40 text-purple-300',
        icon: '🟣',
        productName: 'Leche Entera Vaca Blanca (1 L)',
        brand: 'Vaca Blanca',
        presentation: 'Tetra Pak 1 Litro',
        regularPrice: 20.00,
        promoPrice: 15.50,
        isBestPrice: true,
        savingsVsRegular: 4.50,
        sourceUrl: 'https://tiendas3b.com/productos/',
        productId: 'prod-sup-tiendas3b-01'
      },
      {
        id: 'cmp-leche-aurrera',
        storeId: 'merch-aurrera-silao',
        storeName: 'Bodega Aurrera Silao',
        storeBadge: 'Plaza La Joya',
        storeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
        icon: '🟢',
        productName: 'Leche Entera Great Value (1 L)',
        brand: 'Great Value',
        presentation: 'Tetra Pak 1 Litro',
        regularPrice: 24.50,
        promoPrice: 18.90,
        isBestPrice: false,
        savingsVsRegular: 5.60,
        sourceUrl: 'https://despensa.bodegaaurrera.com.mx/c/folleto-digital',
        productId: 'prod-sup-aurrera-03'
      },
      {
        id: 'cmp-leche-soriana',
        storeId: 'merch-soriana-silao',
        storeName: 'Mercado Soriana Silao',
        storeBadge: 'Blvd. Bailleres',
        storeColor: 'border-rose-500 bg-rose-950/40 text-rose-300',
        icon: '🔴',
        productName: 'Leche Entera Soriana Selección (1 L)',
        brand: 'Soriana',
        presentation: 'Tetra Pak 1 Litro',
        regularPrice: 26.00,
        promoPrice: 21.90,
        isBestPrice: false,
        savingsVsRegular: 4.10,
        sourceUrl: 'https://www.soriana.com/folleto-digital.html'
      },
      {
        id: 'cmp-leche-providencia',
        storeId: 'merch-abarrotes',
        storeName: 'Abarrotes La Providencia',
        storeBadge: 'Silao Centro',
        storeColor: 'border-amber-500 bg-amber-950/40 text-amber-300',
        icon: '🏪',
        productName: 'Leche Entera Pasteurizada Lala (1 L)',
        brand: 'Lala',
        presentation: 'Bote plástico 1 Litro',
        regularPrice: 30.00,
        promoPrice: 27.50,
        isBestPrice: false,
        savingsVsRegular: 2.50
      }
    ]
  },

  // 2. ACEITE VEGETAL (800ml - 1 LITRO)
  {
    id: 'aceite',
    title: 'Aceite Comestible (800ml - 1 Litro)',
    icon: '🌻',
    unitLabel: 'Por Botella',
    description: 'Aceite vegetal puro para freír y guisar la comida diaria en hogares de Silao.',
    items: [
      {
        id: 'cmp-aceite-3b',
        storeId: 'merch-tiendas-3b',
        storeName: 'Tiendas 3B Silao',
        storeBadge: 'Centro & Sopeña',
        storeColor: 'border-purple-500 bg-purple-950/40 text-purple-300',
        icon: '🟣',
        productName: 'Aceite Mi Marca 3B Puro de Soya (800 ml)',
        brand: 'Mi Marca 3B',
        presentation: 'Botella 800 ml',
        regularPrice: 32.00,
        promoPrice: 24.50,
        isBestPrice: true,
        savingsVsRegular: 7.50,
        sourceUrl: 'https://tiendas3b.com/productos/',
        productId: 'prod-sup-tiendas3b-03'
      },
      {
        id: 'cmp-aceite-aurrera',
        storeId: 'merch-aurrera-silao',
        storeName: 'Bodega Aurrera Silao',
        storeBadge: 'Plaza La Joya',
        storeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
        icon: '🟢',
        productName: 'Aceite Vegetal Comestible 1-2-3 (1 L)',
        brand: '1-2-3',
        presentation: 'Botella 1 Litro',
        regularPrice: 46.00,
        promoPrice: 33.90,
        isBestPrice: false,
        savingsVsRegular: 12.10,
        sourceUrl: 'https://despensa.bodegaaurrera.com.mx/c/folleto-digital',
        productId: 'prod-sup-aurrera-01'
      },
      {
        id: 'cmp-aceite-soriana',
        storeId: 'merch-soriana-silao',
        storeName: 'Mercado Soriana Silao',
        storeBadge: 'Blvd. Bailleres',
        storeColor: 'border-rose-500 bg-rose-950/40 text-rose-300',
        icon: '🔴',
        productName: 'Aceite Vegetal Mixto Precissimo (850 ml)',
        brand: 'Precissimo',
        presentation: 'Botella 850 ml',
        regularPrice: 39.00,
        promoPrice: 31.50,
        isBestPrice: false,
        savingsVsRegular: 7.50,
        sourceUrl: 'https://www.soriana.com/folleto-digital.html'
      },
      {
        id: 'cmp-aceite-bara',
        storeId: 'merch-super-bara',
        storeName: 'Super Bara Silao',
        storeBadge: 'Sopeña / Ducoing',
        storeColor: 'border-amber-500 bg-amber-950/40 text-amber-300',
        icon: '🟠',
        productName: 'Aceite Comestible Nutrioli Puro de Soya (850 ml)',
        brand: 'Nutrioli',
        presentation: 'Botella 850 ml',
        regularPrice: 44.00,
        promoPrice: 37.00,
        isBestPrice: false,
        savingsVsRegular: 7.00,
        sourceUrl: 'https://bara.com.mx/promociones'
      }
    ]
  },

  // 3. HUEVO BLANCO (CONO 30 PZS / 1 KG)
  {
    id: 'huevo',
    title: 'Huevo Blanco Fresco (30 pzs / 1 kg)',
    icon: '🥚',
    unitLabel: 'Por Paquete/Kilo',
    description: 'El alimento rey del desayuno en Silao: comparativa de cono de 30 piezas y kilo suelto.',
    items: [
      {
        id: 'cmp-huevo-aurrera',
        storeId: 'merch-aurrera-silao',
        storeName: 'Bodega Aurrera Silao',
        storeBadge: 'Plaza La Joya',
        storeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
        icon: '🟢',
        productName: 'Huevo Blanco El Calvario (Cono 30 pzs)',
        brand: 'El Calvario',
        presentation: 'Cono de cartón 30 pzs (~1.8 kg)',
        regularPrice: 88.00,
        promoPrice: 69.50,
        isBestPrice: true,
        savingsVsRegular: 18.50,
        sourceUrl: 'https://despensa.bodegaaurrera.com.mx/c/folleto-digital',
        productId: 'prod-sup-aurrera-02'
      },
      {
        id: 'cmp-huevo-soriana',
        storeId: 'merch-soriana-silao',
        storeName: 'Mercado Soriana Silao',
        storeBadge: 'Blvd. Bailleres',
        storeColor: 'border-rose-500 bg-rose-950/40 text-rose-300',
        icon: '🔴',
        productName: 'Huevo Blanco Precissimo (Cono 30 pzs)',
        brand: 'Precissimo',
        presentation: 'Cono de cartón 30 piezas',
        regularPrice: 86.00,
        promoPrice: 73.90,
        isBestPrice: false,
        savingsVsRegular: 12.10,
        sourceUrl: 'https://www.soriana.com/folleto-digital.html'
      },
      {
        id: 'cmp-huevo-providencia',
        storeId: 'merch-abarrotes',
        storeName: 'Abarrotes La Providencia',
        storeBadge: 'Silao Centro',
        storeColor: 'border-amber-500 bg-amber-950/40 text-amber-300',
        icon: '🏪',
        productName: 'Huevo Blanco San Juan (Bolsa 1 kg - 16 pzs)',
        brand: 'San Juan',
        presentation: 'Bolsa 1 kg seleccionado',
        regularPrice: 52.00,
        promoPrice: 48.00,
        isBestPrice: false,
        savingsVsRegular: 4.00,
        productId: 'prod-silao-abarrotes-01'
      },
      {
        id: 'cmp-huevo-bara',
        storeId: 'merch-super-bara',
        storeName: 'Super Bara Silao',
        storeBadge: 'Sopeña / Ducoing',
        storeColor: 'border-amber-500 bg-amber-950/40 text-amber-300',
        icon: '🟠',
        productName: 'Huevo Blanco Granja Bajío (Cono 30 pzs)',
        brand: 'Granja Bajío',
        presentation: 'Cono 30 piezas',
        regularPrice: 89.00,
        promoPrice: 75.00,
        isBestPrice: false,
        savingsVsRegular: 14.00,
        sourceUrl: 'https://bara.com.mx/promociones'
      }
    ]
  },

  // 4. FRIJOL (900g)
  {
    id: 'frijol',
    title: 'Frijol Negro y Peruano (900g)',
    icon: '🌾',
    unitLabel: 'Por Bolsa 900g',
    description: 'Frijol limpio y seleccionado para preparar refritos o de la olla.',
    items: [
      {
        id: 'cmp-frijol-3b',
        storeId: 'merch-tiendas-3b',
        storeName: 'Tiendas 3B Silao',
        storeBadge: 'Centro & Sopeña',
        storeColor: 'border-purple-500 bg-purple-950/40 text-purple-300',
        icon: '🟣',
        productName: 'Frijol Peruano 3B (900g)',
        brand: 'Mi Marca 3B',
        presentation: 'Bolsa 900 gramos',
        regularPrice: 38.00,
        promoPrice: 28.50,
        isBestPrice: true,
        savingsVsRegular: 9.50,
        sourceUrl: 'https://tiendas3b.com/productos/',
        productId: 'prod-sup-tiendas3b-07'
      },
      {
        id: 'cmp-frijol-aurrera',
        storeId: 'merch-aurrera-silao',
        storeName: 'Bodega Aurrera Silao',
        storeBadge: 'Plaza La Joya',
        storeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
        icon: '🟢',
        productName: 'Frijol Negro Verde Valle (900g)',
        brand: 'Verde Valle',
        presentation: 'Bolsa 900 gramos',
        regularPrice: 46.00,
        promoPrice: 35.00,
        isBestPrice: false,
        savingsVsRegular: 11.00,
        sourceUrl: 'https://despensa.bodegaaurrera.com.mx/c/folleto-digital',
        productId: 'prod-sup-aurrera-04'
      },
      {
        id: 'cmp-frijol-soriana',
        storeId: 'merch-soriana-silao',
        storeName: 'Mercado Soriana Silao',
        storeBadge: 'Blvd. Bailleres',
        storeColor: 'border-rose-500 bg-rose-950/40 text-rose-300',
        icon: '🔴',
        productName: 'Frijol Negro Precissimo (900g)',
        brand: 'Precissimo',
        presentation: 'Bolsa 900 gramos',
        regularPrice: 41.00,
        promoPrice: 32.90,
        isBestPrice: false,
        savingsVsRegular: 8.10,
        sourceUrl: 'https://www.soriana.com/folleto-digital.html'
      },
      {
        id: 'cmp-frijol-providencia',
        storeId: 'merch-abarrotes',
        storeName: 'Abarrotes La Providencia',
        storeBadge: 'Silao Centro',
        storeColor: 'border-amber-500 bg-amber-950/40 text-amber-300',
        icon: '🏪',
        productName: 'Frijol Flor de Mayo Granel de Campo (1 kg)',
        brand: 'Cosecha Local',
        presentation: 'Bolsa 1 kg granel',
        regularPrice: 42.00,
        promoPrice: 38.00,
        isBestPrice: false,
        savingsVsRegular: 4.00
      }
    ]
  },

  // 5. PAPEL HIGIÉNICO (RENDIMIENTO Y COSTO)
  {
    id: 'papel',
    title: 'Papel Higiénico (4 a 12 Rollos)',
    icon: '🧻',
    unitLabel: 'Por Paquete',
    description: 'Comparación de suavidad, cantidad de rollos y costo unitario por rollo.',
    items: [
      {
        id: 'cmp-papel-3b',
        storeId: 'merch-tiendas-3b',
        storeName: 'Tiendas 3B Silao',
        storeBadge: 'Centro & Sopeña',
        storeColor: 'border-purple-500 bg-purple-950/40 text-purple-300',
        icon: '🟣',
        productName: 'Papel Higiénico Nube 3B (4 Rollos Dobles)',
        brand: 'Nube',
        presentation: 'Paquete de 4 rollos dobles ($3.97 / rollo)',
        regularPrice: 22.00,
        promoPrice: 15.90,
        isBestPrice: true,
        savingsVsRegular: 6.10,
        sourceUrl: 'https://tiendas3b.com/productos/',
        productId: 'prod-sup-tiendas3b-02'
      },
      {
        id: 'cmp-papel-aurrera',
        storeId: 'merch-aurrera-silao',
        storeName: 'Bodega Aurrera Silao',
        storeBadge: 'Plaza La Joya',
        storeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
        icon: '🟢',
        productName: 'Papel Higiénico Pétalo Rendimax (12 Rollos)',
        brand: 'Pétalo',
        presentation: 'Paquete de 12 rollos dobles ($5.82 / rollo)',
        regularPrice: 92.00,
        promoPrice: 69.90,
        isBestPrice: false,
        savingsVsRegular: 22.10,
        sourceUrl: 'https://despensa.bodegaaurrera.com.mx/c/folleto-digital',
        productId: 'prod-sup-aurrera-06'
      },
      {
        id: 'cmp-papel-soriana',
        storeId: 'merch-soriana-silao',
        storeName: 'Mercado Soriana Silao',
        storeBadge: 'Blvd. Bailleres',
        storeColor: 'border-rose-500 bg-rose-950/40 text-rose-300',
        icon: '🔴',
        productName: 'Papel Higiénico Regio Rinde+ (12 Rollos)',
        brand: 'Regio',
        presentation: 'Paquete 12 rollos dobles ($6.50 / rollo)',
        regularPrice: 95.00,
        promoPrice: 78.00,
        isBestPrice: false,
        savingsVsRegular: 17.00,
        sourceUrl: 'https://www.soriana.com/folleto-digital.html'
      },
      {
        id: 'cmp-papel-providencia',
        storeId: 'merch-abarrotes',
        storeName: 'Abarrotes La Providencia',
        storeBadge: 'Silao Centro',
        storeColor: 'border-amber-500 bg-amber-950/40 text-amber-300',
        icon: '🏪',
        productName: 'Papel Higiénico Suavel Tradicional (4 Rollos)',
        brand: 'Suavel',
        presentation: 'Paquete 4 rollos ($6.00 / rollo)',
        regularPrice: 28.00,
        promoPrice: 24.00,
        isBestPrice: false,
        savingsVsRegular: 4.00
      }
    ]
  },

  // 6. DETERGENTE Y LIMPIEZA
  {
    id: 'limpieza',
    title: 'Detergente y Lavandería (1 kg / 400g)',
    icon: '🧼',
    unitLabel: 'Por Empaque',
    description: 'Básicos del lavado de ropa y pisos con alto poder arranca-grasa.',
    items: [
      {
        id: 'cmp-limpieza-aurrera-roma',
        storeId: 'merch-aurrera-silao',
        storeName: 'Bodega Aurrera Silao',
        storeBadge: 'Plaza La Joya',
        storeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
        icon: '🟢',
        productName: 'Detergente Multiusos Roma en Polvo (1 kg)',
        brand: 'Roma',
        presentation: 'Bolsa 1 kg biodegradable',
        regularPrice: 38.00,
        promoPrice: 28.50,
        isBestPrice: true,
        savingsVsRegular: 9.50,
        sourceUrl: 'https://despensa.bodegaaurrera.com.mx/c/folleto-digital',
        productId: 'prod-sup-aurrera-07'
      },
      {
        id: 'cmp-limpieza-aurrera-zote',
        storeId: 'merch-aurrera-silao',
        storeName: 'Bodega Aurrera Silao',
        storeBadge: 'Plaza La Joya',
        storeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
        icon: '🟢',
        productName: 'Jabón de Lavandería Zote Rosa (400g)',
        brand: 'La Corona',
        presentation: 'Barra 400g',
        regularPrice: 26.00,
        promoPrice: 19.50,
        isBestPrice: false,
        savingsVsRegular: 6.50,
        sourceUrl: 'https://despensa.bodegaaurrera.com.mx/c/folleto-digital',
        productId: 'prod-sup-aurrera-08'
      },
      {
        id: 'cmp-limpieza-3b-brillin',
        storeId: 'merch-tiendas-3b',
        storeName: 'Tiendas 3B Silao',
        storeBadge: 'Centro & Sopeña',
        storeColor: 'border-purple-500 bg-purple-950/40 text-purple-300',
        icon: '🟣',
        productName: 'Lavatrastes Líquido Limón Brillín (750 ml)',
        brand: 'Brillín',
        presentation: 'Botella 750 ml arranca-grasa',
        regularPrice: 21.00,
        promoPrice: 14.90,
        isBestPrice: false,
        savingsVsRegular: 6.10,
        sourceUrl: 'https://tiendas3b.com/productos/',
        productId: 'prod-sup-tiendas3b-08'
      },
      {
        id: 'cmp-limpieza-soriana-suavitel',
        storeId: 'merch-soriana-silao',
        storeName: 'Mercado Soriana Silao',
        storeBadge: 'Blvd. Bailleres',
        storeColor: 'border-rose-500 bg-rose-950/40 text-rose-300',
        icon: '🔴',
        productName: 'Suavizante Suavitel Fresco Aroma (2.8 L)',
        brand: 'Suavitel',
        presentation: 'Garrafa familiar 2.8 Litros',
        regularPrice: 86.00,
        promoPrice: 62.90,
        isBestPrice: false,
        savingsVsRegular: 23.10,
        sourceUrl: 'https://www.soriana.com/folleto-digital.html',
        productId: 'prod-sup-soriana-09'
      }
    ]
  },

  // 7. QUESOS Y LÁCTEOS (400g)
  {
    id: 'quesos',
    title: 'Quesos Frescos y Hebra (400g)',
    icon: '🧀',
    unitLabel: 'Por 400 gramos',
    description: 'Queso panela y oaxaca con transporte en frío garantizado.',
    items: [
      {
        id: 'cmp-queso-bara',
        storeId: 'merch-super-bara',
        storeName: 'Super Bara Silao',
        storeBadge: 'Sopeña / Ducoing',
        storeColor: 'border-amber-500 bg-amber-950/40 text-amber-300',
        icon: '🟠',
        productName: 'Queso Oaxaca Hebra Don Lucas (400g)',
        brand: 'Don Lucas',
        presentation: 'Bolsa sellada 400 gramos',
        regularPrice: 58.00,
        promoPrice: 43.50,
        isBestPrice: true,
        savingsVsRegular: 14.50,
        sourceUrl: 'https://bara.com.mx/promociones',
        isColdChain: true,
        productId: 'prod-sup-superbara-05'
      },
      {
        id: 'cmp-queso-soriana',
        storeId: 'merch-soriana-silao',
        storeName: 'Mercado Soriana Silao',
        storeBadge: 'Blvd. Bailleres',
        storeColor: 'border-rose-500 bg-rose-950/40 text-rose-300',
        icon: '🔴',
        productName: 'Queso Panela FUD en Barra (400g)',
        brand: 'FUD',
        presentation: 'Empaque al vacío 400 gramos',
        regularPrice: 68.00,
        promoPrice: 49.90,
        isBestPrice: false,
        savingsVsRegular: 18.10,
        sourceUrl: 'https://www.soriana.com/folleto-digital.html',
        isColdChain: true,
        productId: 'prod-sup-soriana-05'
      },
      {
        id: 'cmp-queso-providencia',
        storeId: 'merch-abarrotes',
        storeName: 'Abarrotes La Providencia',
        storeBadge: 'Silao Centro',
        storeColor: 'border-amber-500 bg-amber-950/40 text-amber-300',
        icon: '🏪',
        productName: 'Queso Ranchero Artesanal de Rancho (500g)',
        brand: 'Rancho Silao',
        presentation: 'Pieza fresca 500 gramos',
        regularPrice: 70.00,
        promoPrice: 65.00,
        isBestPrice: false,
        savingsVsRegular: 5.00,
        isColdChain: false
      }
    ]
  },

  // 8. FRUTAS Y VERDURAS (1 KG)
  {
    id: 'frescura',
    title: 'Frutas y Verduras (1 Kilogramo)',
    icon: '🍅',
    unitLabel: 'Por Kilo',
    description: 'Comparativa de jitomate, aguacate y plátano con frescura de huerto.',
    items: [
      {
        id: 'cmp-frescura-soriana-jitomate',
        storeId: 'merch-soriana-silao',
        storeName: 'Mercado Soriana Silao',
        storeBadge: 'Blvd. Bailleres',
        storeColor: 'border-rose-500 bg-rose-950/40 text-rose-300',
        icon: '🔴',
        productName: 'Jitomate Saladette Fresco Silao (1 kg)',
        brand: 'Campo del Bajío',
        presentation: 'Kilo seleccionado',
        regularPrice: 38.00,
        promoPrice: 22.90,
        isBestPrice: true,
        savingsVsRegular: 15.10,
        sourceUrl: 'https://www.soriana.com/folleto-digital.html',
        productId: 'prod-sup-soriana-01'
      },
      {
        id: 'cmp-frescura-soriana-aguacate',
        storeId: 'merch-soriana-silao',
        storeName: 'Mercado Soriana Silao',
        storeBadge: 'Blvd. Bailleres',
        storeColor: 'border-rose-500 bg-rose-950/40 text-rose-300',
        icon: '🔴',
        productName: 'Aguacate Hass de Michoacán (1 kg)',
        brand: 'Selección Soriana',
        presentation: 'Kilo en su punto',
        regularPrice: 78.00,
        promoPrice: 54.90,
        isBestPrice: true,
        savingsVsRegular: 23.10,
        sourceUrl: 'https://www.soriana.com/folleto-digital.html',
        productId: 'prod-sup-soriana-02'
      },
      {
        id: 'cmp-frescura-aurrera-jitomate',
        storeId: 'merch-aurrera-silao',
        storeName: 'Bodega Aurrera Silao',
        storeBadge: 'Plaza La Joya',
        storeColor: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
        icon: '🟢',
        productName: 'Jitomate Saladette Primera (1 kg)',
        brand: 'Aurrera Frescura',
        presentation: 'Kilo a granel',
        regularPrice: 36.00,
        promoPrice: 28.50,
        isBestPrice: false,
        savingsVsRegular: 7.50,
        sourceUrl: 'https://despensa.bodegaaurrera.com.mx/c/folleto-digital'
      },
      {
        id: 'cmp-frescura-providencia-jitomate',
        storeId: 'merch-abarrotes',
        storeName: 'Abarrotes La Providencia',
        storeBadge: 'Silao Centro',
        storeColor: 'border-amber-500 bg-amber-950/40 text-amber-300',
        icon: '🏪',
        productName: 'Jitomate de Invernadero Guanajuato (1 kg)',
        brand: 'Huerto Regional',
        presentation: 'Bolsa 1 kg firme',
        regularPrice: 38.00,
        promoPrice: 34.00,
        isBestPrice: false,
        savingsVsRegular: 4.00
      }
    ]
  }
];

/**
 * Canasta Básica Inteligente Optimizada:
 * Los 6 productos clave tomando la opción más barata de cada súper
 */
export const OPTIMIZED_SMART_BASKET = [
  { itemTitle: 'Huevo Blanco (Cono 30 pzs)', bestStore: 'Bodega Aurrera', bestPrice: 69.50, regularPrice: 88.00, productId: 'prod-sup-aurrera-02' },
  { itemTitle: 'Leche Entera (1 L)', bestStore: 'Tiendas 3B', bestPrice: 15.50, regularPrice: 24.50, productId: 'prod-sup-tiendas3b-01' },
  { itemTitle: 'Aceite Vegetal (800 ml)', bestStore: 'Tiendas 3B', bestPrice: 24.50, regularPrice: 46.00, productId: 'prod-sup-tiendas3b-03' },
  { itemTitle: 'Frijol (900g)', bestStore: 'Tiendas 3B', bestPrice: 28.50, regularPrice: 46.00, productId: 'prod-sup-tiendas3b-07' },
  { itemTitle: 'Papel Higiénico (12 rollos)', bestStore: 'Bodega Aurrera', bestPrice: 69.90, regularPrice: 92.00, productId: 'prod-sup-aurrera-06' },
  { itemTitle: 'Detergente Roma (1 kg)', bestStore: 'Bodega Aurrera', bestPrice: 28.50, regularPrice: 38.00, productId: 'prod-sup-aurrera-07' },
  { itemTitle: 'Jitomate Saladette (1 kg)', bestStore: 'Mercado Soriana', bestPrice: 22.90, regularPrice: 38.00, productId: 'prod-sup-soriana-01' },
  { itemTitle: 'Queso Oaxaca (400g)', bestStore: 'Super Bara', bestPrice: 43.50, regularPrice: 58.00, productId: 'prod-sup-superbara-05' },
];
