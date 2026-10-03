import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  Store, 
  Truck, 
  Percent, 
  Calendar, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag,
  ExternalLink,
  Info
} from 'lucide-react';
import { BROCHURE_COMMISSIONS } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';

export const BrochureModal: React.FC = () => {
  const { isBrochureModalOpen, setIsBrochureModalOpen, setIsAuthModalOpen, giros } = useInventory();
  const activeCommissions = giros && giros.length > 0 ? giros : BROCHURE_COMMISSIONS;
  const [activeTab, setActiveTab] = useState<'folleto' | 'comisiones' | 'registro'>('folleto');
  const [registroForm, setRegistroForm] = useState({
    nombreNegocio: '',
    giro: 'Abarrotes y Minisupers',
    propietario: '',
    telefono: '',
    email: '',
    direccion: '',
    comentarios: ''
  });
  const [registroEnviado, setRegistroEnviado] = useState(false);

  if (!isBrochureModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleEnviarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistroEnviado(true);
    // Simular guardado y contacto
    const mailtoSubject = encodeURIComponent(`Solicitud de Afiliación a SILAOMARKET: ${registroForm.nombreNegocio}`);
    const mailtoBody = encodeURIComponent(
      `Hola equipo de SILAOMARKET ON LINE,\n\nDeseo afiliar mi negocio a la plataforma:\n\n` +
      `Negocio: ${registroForm.nombreNegocio}\n` +
      `Giro: ${registroForm.giro}\n` +
      `Propietario: ${registroForm.propietario}\n` +
      `Teléfono: ${registroForm.telefono}\n` +
      `Email: ${registroForm.email}\n` +
      `Dirección en Silao: ${registroForm.direccion}\n` +
      `Comentarios: ${registroForm.comentarios}\n\n` +
      `Quedo en espera de su respuesta para subir mi catálogo.\n¡Gracias!`
    );
    window.open(`mailto:hhlozano70@hotmail.com?subject=${mailtoSubject}&body=${mailtoBody}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Header Superior - No imprimir controles */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Store className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-emerald-200 uppercase">
                Programa Oficial de Afiliación
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                SILAOMARKET ON LINE
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-bold">
                  Silao, Gto.
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs selector */}
            <div className="bg-emerald-950/50 p-1 rounded-xl flex text-xs font-semibold">
              <button
                onClick={() => setActiveTab('folleto')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'folleto' ? 'bg-amber-400 text-emerald-950 shadow' : 'text-emerald-200 hover:text-white'
                }`}
              >
                📄 Folleto
              </button>
              <button
                onClick={() => setActiveTab('comisiones')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'comisiones' ? 'bg-amber-400 text-emerald-950 shadow' : 'text-emerald-200 hover:text-white'
                }`}
              >
                📊 17 Giros y Tasas
              </button>
              <button
                onClick={() => setActiveTab('registro')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'registro' ? 'bg-amber-400 text-emerald-950 shadow' : 'text-emerald-200 hover:text-white'
                }`}
              >
                ✍️ Afiliar Negocio
              </button>
            </div>

            <button
              onClick={handlePrint}
              title="Imprimir folleto para comerciantes"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={() => setIsBrochureModalOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500 text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 space-y-8 bg-slate-50 print:bg-white print:p-0">
          
          {/* TAB 1: FOLLETO VIRTUAL FIDELIDAD PDF */}
          {(activeTab === 'folleto' || window.matchMedia?.('print').matches) && (
            <div className="space-y-8 print:space-y-6">
              
              {/* PÁGINA 1: PORTADA & PROPUESTA DE VALOR */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 relative overflow-hidden print:border-none print:shadow-none print:p-0">
                
                {/* Header Branding Folleto */}
                <div className="flex flex-col sm:flex-row items-center justify-between pb-8 border-b border-slate-100 gap-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src="/images/silaomarket_logo.jpg" 
                      alt="SILAOMARKET ON LINE Logo" 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md border-2 border-emerald-500 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-1">
                        La Red de Comercio Local Más Grande de Silao
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        SILAOMARKET <span className="text-emerald-600">ON LINE</span>
                      </h1>
                      <p className="text-sm font-medium text-slate-600">
                        Vende en línea en todo Silao con un solo clic, sin costos fijos ni riesgos.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-300 rounded-2xl p-4 text-center sm:text-right">
                    <span className="text-xs font-bold text-amber-800 uppercase block">Contacto Oficial de Afiliación</span>
                    <a href="mailto:hhlozano70@hotmail.com" className="text-sm sm:text-base font-black text-emerald-700 hover:underline flex items-center justify-center sm:justify-end gap-1.5 mt-0.5">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      hhlozano70@hotmail.com
                    </a>
                    <span className="text-xs text-slate-500 block mt-1">Silao de la Victoria, Guanajuato</span>
                  </div>
                </div>

                {/* 4 Grandes Pilares del Folleto */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xl mb-2 shadow-sm">
                      0%
                    </div>
                    <h4 className="font-black text-slate-900 text-sm">Entrada Gratis</h4>
                    <p className="text-xs text-slate-600 mt-1">Sin costo de inscripción ni mensualidades obligatorias.</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xl mb-2 shadow-sm">
                      %
                    </div>
                    <h4 className="font-black text-slate-900 text-sm">8% - 18% Comisión</h4>
                    <p className="text-xs text-slate-600 mt-1">Solo pagas una comisión justa cuando realmente vendes.</p>
                  </div>

                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-sky-600 text-white flex items-center justify-center font-black text-xl mb-2 shadow-sm">
                      7
                    </div>
                    <h4 className="font-black text-slate-900 text-sm">Días Liquidación</h4>
                    <p className="text-xs text-slate-600 mt-1">Recibe tus ganancias netas directo a tu cuenta cada semana.</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xl mb-2 shadow-sm">
                      +15
                    </div>
                    <h4 className="font-black text-slate-900 text-sm">Giros Comerciales</h4>
                    <p className="text-xs text-slate-600 mt-1">Abarrotes, farmacias, helados, refacciones, servicios y más.</p>
                  </div>
                </div>

                {/* Modelo Hub Silao: Cómo Funciona para el Cliente y para Ti */}
                <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden mb-8">
                  <div className="relative z-10">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      El Poder del Carrito Único Silaoense
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black mt-1 mb-3">
                      ¿Por qué a la gente le encanta SILAOMARKET ON LINE?
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                      Un cliente en Silao puede pedir <strong>leche de la abarrotera</strong>, <strong>medicina de la farmacia</strong>, <strong>paletas de La Michoacana</strong> y <strong>un foco de la ferretería</strong> en un solo pedido. Paga una sola vez, paga un envío consolidado justo (<span className="text-amber-300 font-bold">$25 a $40</span> según comercios y piezas), y nuestro <strong className="text-white">Hub de Repartidores</strong> recoge de cada negocio y entrega todo junto a su puerta con rastreo QR.
                    </p>
                  </div>
                </div>

                {/* 4 Pasos Sencillos para Afiliarte */}
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ¿Cómo funciona para tu comercio? 4 Pasos Simples
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
                      <span className="text-3xl font-black text-emerald-200 absolute top-3 right-4">01</span>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Te Afilias Gratis</h4>
                      <p className="text-xs text-slate-600">
                        Envías un correo a <strong>hhlozano70@hotmail.com</strong> o te registras aquí. No hay costo de apertura.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
                      <span className="text-3xl font-black text-emerald-200 absolute top-3 right-4">02</span>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Subes tu Catálogo</h4>
                      <p className="text-xs text-slate-600">
                        Te asignamos tu portal de negocio para que cargues productos, precios e inventario en minutos.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
                      <span className="text-3xl font-black text-emerald-200 absolute top-3 right-4">03</span>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Recibes Pedidos</h4>
                      <p className="text-xs text-slate-600">
                        Cuando un cliente pide tus productos, preparas el paquete y el repartidor del Hub pasa por él.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
                      <span className="text-3xl font-black text-emerald-200 absolute top-3 right-4">04</span>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Cobras Semanalmente</h4>
                      <p className="text-xs text-slate-600">
                        Cada 7 días el Hub liquida tus ventas netas vía transferencia con comprobante detallado.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banner de llamada a la acción */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      📍
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">Exclusivo para Negocios y Familias de Silao</h5>
                      <p className="text-xs text-slate-500">Impulsando la economía local desde el Centro Histórico hasta las colonias y comunidades.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('registro')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Quiero Afiliar Mi Negocio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* PÁGINA 2: TABLA DE COMISIONES OFICIALES (17 GIROS) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 print:border-none print:shadow-none print:p-0 print:break-before-page">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Transparencia Total
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      Tabla Oficial de Comisiones por Giro Comercial
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Tasas competitivas calculadas para proteger tu margen de ganancia. Sin cargos ocultos.
                    </p>
                  </div>
                  
                  <div className="text-xs bg-slate-100 px-3 py-2 rounded-xl text-slate-700 border border-slate-200">
                    <strong>Liquidación:</strong> Cada 7 días calendario
                  </div>
                </div>

                {/* Grid de Comisiones */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 my-6">
                  {activeCommissions.map((item, idx) => {
                    const categoryName = item.category || item.giro || 'Giro Comercial';
                    const commissionRate = typeof item.rate === 'number' ? item.rate : (typeof item.commission === 'number' ? item.commission : 10);
                    const itemType = item.type || 'Producto';

                    return (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all bg-slate-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shadow-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h5 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                              {categoryName}
                            </h5>
                            <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded ${
                              itemType.toLowerCase() === 'servicio' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {itemType}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base sm:text-lg font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-xs">
                            {commissionRate}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resumen de Beneficios Comerciales */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900">Cobro Seguro</strong>
                      Tus ventas están respaldadas. No arriesgas entregando a desconocidos.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Truck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900">Logística Hub Incluida</strong>
                      No requieres contratar repartidor propio para vender a distancia.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900">Corte Cada 7 Días</strong>
                      Reportes detallados con cada producto vendido y comprobante fiscal/bancario.
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: DETALLE EXTENDIDO DE COMISIONES */}
          {activeTab === 'comisiones' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Estructura Tarifaria Completa</h3>
                <p className="text-sm text-slate-600 mt-1">
                  En SILAOMARKET ON LINE creemos en alianzas justas. A diferencia de plataformas transnacionales que cobran entre el 30% y 35%, nuestras tasas comienzan desde el <strong>8%</strong>.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Giro Comercial</th>
                      <th className="py-3 px-4">Modalidad</th>
                      <th className="py-3 px-4 text-center">Comisión SILAOMARKET</th>
                      <th className="py-3 px-4 text-center">Ejemplo ($100 Venta)</th>
                      <th className="py-3 px-4">Frecuencia de Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {activeCommissions.map((c, i) => {
                      const categoryName = c.category || c.giro || 'Giro Comercial';
                      const rate = typeof c.rate === 'number' ? c.rate : (typeof c.commission === 'number' ? c.commission : 10);
                      const commissionAmount = (100 * rate) / 100;
                      const merchantReceives = 100 - commissionAmount;
                      const itemType = c.type || 'Producto';

                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-400 font-bold">{i + 1}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{categoryName}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold ${
                              itemType.toLowerCase() === 'servicio' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {itemType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              {rate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-xs text-slate-600">
                            Recibes <strong className="text-slate-900">${merchantReceives.toFixed(2)}</strong> (Comisión: ${commissionAmount.toFixed(2)})
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                            Cada 7 días
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">¿Tu giro no aparece en la lista?</h4>
                  <p className="text-xs text-emerald-800">Evaluamos giros especiales y servicios personalizados con tarifas a la medida.</p>
                </div>
                <a
                  href="mailto:hhlozano70@hotmail.com?subject=Consulta%20Giro%20Especial%20Silaomarket"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Consultar con Administración
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: FORMULARIO DE REGISTRO DIRECTO */}
          {activeTab === 'registro' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              {registroEnviado ? (
                <div className="text-center py-12 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">¡Solicitud Generada con Éxito!</h3>
                  <p className="text-sm text-slate-600">
                    Se ha preparado tu correo dirigido a <strong>hhlozano70@hotmail.com</strong> con los datos de tu negocio <strong>"{registroForm.nombreNegocio}"</strong>. Un coordinador del Hub Silao se pondrá en contacto contigo a la brevedad para entregarte tu acceso y ayudarte a cargar tus productos.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setRegistroEnviado(false)}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                    >
                      Enviar Otra Solicitud
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEnviarRegistro} className="max-w-2xl mx-auto space-y-5">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Afiliación Inmediata de Comercio</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Completa este formulario para iniciar el alta de tu tienda en <strong>SILAOMARKET ON LINE</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Comercial de la Tienda *</label>
                      <input 
                        type="text" 
                        required 
                        value={registroForm.nombreNegocio}
                        onChange={e => setRegistroForm({...registroForm, nombreNegocio: e.target.value})}
                        placeholder="Ej. Abarrotes La Esperanza"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Giro Comercial Principal *</label>
                      <select
                        value={registroForm.giro}
                        onChange={e => setRegistroForm({...registroForm, giro: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        {activeCommissions.map((item, i) => {
                          const name = item.category || item.giro || 'Giro Comercial';
                          const rate = typeof item.rate === 'number' ? item.rate : (typeof item.commission === 'number' ? item.commission : 10);
                          return (
                            <option key={i} value={name}>
                              {name} ({rate}% comisión)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Propietario / Responsable *</label>
                      <input 
                        type="text" 
                        required 
                        value={registroForm.propietario}
                        onChange={e => setRegistroForm({...registroForm, propietario: e.target.value})}
                        placeholder="Ej. Juan Pérez López"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono o WhatsApp *</label>
                      <input 
                        type="tel" 
                        required 
                        value={registroForm.telefono}
                        onChange={e => setRegistroForm({...registroForm, telefono: e.target.value})}
                        placeholder="472 123 4567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                      <input 
                        type="email" 
                        required 
                        value={registroForm.email}
                        onChange={e => setRegistroForm({...registroForm, email: e.target.value})}
                        placeholder="comercio@ejemplo.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Dirección del Local en Silao *</label>
                      <input 
                        type="text" 
                        required 
                        value={registroForm.direccion}
                        onChange={e => setRegistroForm({...registroForm, direccion: e.target.value})}
                        placeholder="Calle, número, colonia o zona"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Comentarios o Productos Estrella</label>
                    <textarea 
                      rows={3}
                      value={registroForm.comentarios}
                      onChange={e => setRegistroForm({...registroForm, comentarios: e.target.value})}
                      placeholder="Platícanos qué vendes, si ya tienes lista de precios o fotos de tus productos..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0 text-amber-700" />
                    <span>
                      Al enviar tu solicitud, el Hub central te contactará para validar tu ubicación y entregarte tus credenciales de acceso al <strong>Portal de Negocio</strong>.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-xl shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Enviar Solicitud a hhlozano70@hotmail.com</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Atención a Comercios: <strong>hhlozano70@hotmail.com</strong> | Silao, Guanajuato</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsBrochureModalOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="text-emerald-700 hover:underline font-bold"
            >
              ¿Ya estás afiliado? Entra a tu Portal aquí
            </button>

            <button
              onClick={() => setIsBrochureModalOpen(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
