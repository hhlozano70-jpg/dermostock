import React, { useState } from 'react';
import { MapPin, Info, ExternalLink, Sparkles, Building2, Mountain, Compass, ShieldCheck } from 'lucide-react';

interface Landmark {
  id: string;
  name: string;
  shortTitle: string;
  category: string;
  tag: string;
  imageUrl: string;
  description: string;
  historicalNote: string;
  location: string;
}

export const SILAO_LANDMARKS: Landmark[] = [
  {
    id: 'cubilete',
    name: 'Santuario y Monumento a Cristo Rey',
    shortTitle: 'Cerro del Cubilete',
    category: 'Monumento Histórico y Espiritual',
    tag: '2,579 msnm · Silao, Gto',
    imageUrl: '/images/cristo_rey_silao.jpg',
    description: 'La estatua monumental de bronce de 20 metros y 80 toneladas con los brazos abiertos en la cúspide de la montaña, reconocida a nivel internacional.',
    historicalNote: 'Ubicado en el centro geográfico del país dentro del municipio de Silao. Obra arquitectónica de Nicolás Mariscal coronada en los años 40.',
    location: 'Cima del Cerro del Cubilete, Silao de la Victoria'
  },
  {
    id: 'parroquia',
    name: 'Parroquia de Santiago Apóstol',
    shortTitle: 'Templo de Santiago Apóstol',
    category: 'Joya Colonial y Centro Histórico',
    tag: 'Siglo XVII · Cantera Rosa',
    imageUrl: '/images/parroquia_santiago_silao.jpg',
    description: 'Majestuosa parroquia de estilo barroco con fachada y torre de cantera, enmarcando el Jardín Principal de Silao y sus portales tradicionales.',
    historicalNote: 'Corazón histórico de Silao fundado en la época virreinal, a unos pasos de nuestro Hub de Consolidación sobre la emblemática Calle 5 de Mayo.',
    location: 'Plaza Principal s/n, Silao Centro'
  },
  {
    id: 'bicentenario',
    name: 'Parque Guanajuato Bicentenario',
    shortTitle: 'Parque Bicentenario Silao',
    category: 'Complejo Cultural y Recreativo',
    tag: '14.5 Hectáreas · Eventos & Cultura',
    imageUrl: '/images/bicentenario_silao.jpg',
    description: 'Impresionante recinto temático de pabellones interactivos, museos de talla internacional y áreas verdes que conmemoran la historia patria.',
    historicalNote: 'Sede de festivales gastronómicos, muestras artesanales y exposiciones mundiales sobre la carretera de cuota Silao - Guanajuato.',
    location: 'Carretera Silao - Gto Km 3.8, Silao'
  },
  {
    id: 'puerto-interior',
    name: 'Guanajuato Puerto Interior & FIPASI',
    shortTitle: 'Puerto Interior y Corredor Industrial',
    category: 'Motor Económico y Logístico',
    tag: 'Hub Industrial del Bajío',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    description: 'La plataforma logística y parque industrial más competitivo de México, con aduana interior, terminal ferroviaria y aeropuerto internacional.',
    historicalNote: 'Posiciona a Silao como el epicentro de la manufactura aeroespacial y automotriz, abastecido por nuestro sistema de entrega local.',
    location: 'Corredor Industrial Silao - León, Silao'
  }
];

export const SilaoLandmarksShowcase: React.FC = () => {
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Identidad & Orgullo de Silao de la Victoria</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Símbolos y Lugares Emblemáticos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Conoce los íconos arquitectónicos, culturales e industriales que dan vida a nuestro municipio en el corazón de Guanajuato.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>Hub Operativo en Silao Centro</span>
        </div>
      </div>

      {/* Grid of 4 Showcase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SILAO_LANDMARKS.map((landmark) => (
          <div
            key={landmark.id}
            onClick={() => setSelectedLandmark(landmark)}
            className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-400 transition-all duration-300 cursor-pointer flex flex-col"
          >
            {/* Image Container with Aspect Ratio */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              <img
                src={landmark.imageUrl}
                alt={landmark.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              {/* Category Tag */}
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs">
                  {landmark.tag}
                </span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
                  {landmark.category}
                </span>
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {landmark.shortTitle}
                </h3>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {landmark.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium truncate max-w-[170px]">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{landmark.location}</span>
                </span>
                <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                  Ver detalle →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Quick View for Landmark */}
      {selectedLandmark && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedLandmark(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 sm:h-72 w-full bg-slate-900">
              <img 
                src={selectedLandmark.imageUrl} 
                alt={selectedLandmark.name}
                decoding="async"
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <button
                onClick={() => setSelectedLandmark(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40 inline-block mb-1.5">
                  {selectedLandmark.tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight">
                  {selectedLandmark.name}
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedLandmark.location}</span>
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Descripción & Relevancia
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedLandmark.description}
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-1">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Historia y Vínculo con Silao</span>
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {selectedLandmark.historicalNote}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  📍 Silao de la Victoria, Guanajuato
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLandmark(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
