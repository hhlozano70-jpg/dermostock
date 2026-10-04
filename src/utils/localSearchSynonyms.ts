// Diccionario y expansor de sinónimos y modismos locales de Silao y el Bajío
// Facilita que términos coloquiales ("cheve", "refa", "pastillas", "ferre") encuentren productos al instante.

interface SynonymMapping {
  terms: string[];
  categoryTarget?: string;
  associatedKeywords: string[];
}

export const LOCAL_SYNONYMS: SynonymMapping[] = [
  {
    terms: ['cheve', 'cheves', 'chela', 'chelas', 'caguama', 'caguamas', 'cerveza', 'cervezas', 'corona'],
    categoryTarget: 'Cadena Fría (Aguas, Paletas, Cervezas)',
    associatedKeywords: ['cerveza', 'corona', 'bebida', 'fria', 'lata', 'botella']
  },
  {
    terms: ['agua', 'aguas', 'paleta', 'paletas', 'helado', 'helados', 'nieve', 'nieves', 'hielo', 'hielos', 'esquimo', 'michoacana'],
    categoryTarget: 'Cadena Fría (Aguas, Paletas, Cervezas)',
    associatedKeywords: ['paleta', 'helado', 'agua', 'michoacana', 'frio', 'hielo']
  },
  {
    terms: ['refa', 'refas', 'balata', 'balatas', 'bateria', 'batería', 'baterias', 'acumulador', 'filtro', 'filtros', 'aceite motor', 'gonher', 'bujia', 'bujias'],
    categoryTarget: 'Refaccionaria y Automotriz',
    associatedKeywords: ['refaccionaria', 'automotriz', 'gonher', 'aceite', 'bateria', 'balata']
  },
  {
    terms: ['ferre', 'ferres', 'tlapale', 'tlapaleria', 'tornillo', 'tornillos', 'pija', 'pijas', 'clavo', 'clavos', 'martillo', 'truper', 'foco', 'focos', 'cable'],
    categoryTarget: 'Ferretería y Tlapalería',
    associatedKeywords: ['ferreteria', 'tlapaleria', 'truper', 'herramienta', 'tornillo', 'foco']
  },
  {
    terms: ['farma', 'farmacias', 'medicina', 'medicinas', 'pastilla', 'pastillas', 'jarabe', 'curitas', 'gasas', 'alcohol', 'analgesico', 'paracetamol', 'aspirina'],
    categoryTarget: 'Farmacia y Salud',
    associatedKeywords: ['farmacia', 'salud', 'medicina', 'tabletas', 'pastillas']
  },
  {
    terms: ['cerra', 'cerrajeria', 'llave', 'llaves', 'candado', 'candados', 'chapa', 'chapas', 'cerradura', 'duplicado'],
    categoryTarget: 'Servicios Personalizados',
    associatedKeywords: ['cerrajeria', 'llave', 'candado', 'duplicado', 'servicio']
  },
  {
    terms: ['tinto', 'tintoreria', 'planchado', 'lavado', 'saco', 'sacos', 'traje', 'trajes', 'vestido', 'edredon'],
    categoryTarget: 'Servicios Personalizados',
    associatedKeywords: ['tintoreria', 'planchado', 'lavado', 'saco', 'servicio']
  },
  {
    terms: ['croqueta', 'croquetas', 'perro', 'perros', 'gato', 'gatos', 'mascota', 'mascotas', 'veterinaria', 'pedigree', 'whiskas', 'purina'],
    categoryTarget: 'Mascotas y Veterinaria',
    associatedKeywords: ['mascotas', 'veterinaria', 'croquetas', 'perro', 'gato']
  },
  {
    terms: ['cremeria', 'queso', 'quesos', 'jamon', 'salchicha', 'leche', 'huevo', 'huevos', 'frijol', 'arroz', 'azucar', 'cereal', 'refresco', 'coca', 'papitas'],
    categoryTarget: 'Abarrotes y Cremería',
    associatedKeywords: ['abarrotes', 'cremeria', 'leche', 'huevo', 'queso', 'abarrote']
  },
  {
    terms: ['flor', 'flores', 'ramo', 'ramos', 'rosas', 'rosa', 'arreglo', 'regalo', 'regalos', 'peluche', 'globo'],
    categoryTarget: 'Flores y Regalos',
    associatedKeywords: ['flores', 'regalos', 'ramo', 'rosas', 'arreglo']
  },
  {
    terms: ['shampoo', 'crema', 'jabon', 'perfume', 'desodorante', 'nivea', 'eucerin', 'aquaphor', 'maquillaje', 'bloqueador'],
    categoryTarget: 'Cuidado Personal y Belleza',
    associatedKeywords: ['belleza', 'cuidado', 'crema', 'nivea', 'eucerin', 'shampoo']
  }
];

/**
 * Normaliza y expande un término de búsqueda agregando sinónimos locales.
 */
export function getExpandedSearchKeywords(rawTerm: string): string[] {
  const clean = rawTerm.trim().toLowerCase();
  if (!clean) return [];

  const tokens = clean.split(/\s+/).filter(Boolean);
  const expansions = new Set<string>([clean, ...tokens]);

  for (const token of tokens) {
    for (const mapping of LOCAL_SYNONYMS) {
      const matchesTerm = mapping.terms.some(
        t => t === token || token.includes(t) || t.includes(token)
      );

      if (matchesTerm) {
        if (mapping.categoryTarget) {
          expansions.add(mapping.categoryTarget.toLowerCase());
        }
        for (const kw of mapping.associatedKeywords) {
          expansions.add(kw);
        }
      }
    }
  }

  return Array.from(expansions);
}

/**
 * Evalúa si un producto coincide con la búsqueda considerando sinónimos locales de Silao.
 */
export function matchesProductWithSynonyms(
  product: {
    name?: string;
    presentation?: string;
    merchantName?: string;
    category?: string;
    merchantCategory?: string;
    brand?: string;
    description?: string;
  },
  rawSearch: string
): boolean {
  const clean = rawSearch.trim().toLowerCase();
  if (!clean) return true;

  const pName = (product.name || '').toLowerCase();
  const pPres = (product.presentation || '').toLowerCase();
  const pMerch = (product.merchantName || '').toLowerCase();
  const pCat = (product.category || '').toLowerCase();
  const pBrand = (product.brand || '').toLowerCase();
  const pDesc = (product.description || '').toLowerCase();

  // Coincidencia directa inmediata
  if (
    pName.includes(clean) ||
    pPres.includes(clean) ||
    pMerch.includes(clean) ||
    pCat.includes(clean) ||
    pBrand.includes(clean) ||
    pDesc.includes(clean)
  ) {
    return true;
  }

  // Coincidencia expandida con el diccionario local
  const keywords = getExpandedSearchKeywords(clean);
  for (const kw of keywords) {
    if (
      pName.includes(kw) ||
      pCat.includes(kw) ||
      pMerch.includes(kw) ||
      pBrand.includes(kw) ||
      pPres.includes(kw) ||
      pDesc.includes(kw)
    ) {
      return true;
    }
  }

  return false;
}
