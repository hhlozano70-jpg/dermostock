import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  BookOpen,
  Store,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Snowflake,
  ShoppingBag,
  HelpCircle,
  FileText,
  DollarSign,
  QrCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { SILAO_COLONIAS } from '../data/silaoMarketData';

export const UserManualModal: React.FC = () => {
  const { isManualModalOpen, setIsManualModalOpen, setIsAuthModalOpen, setIsBrochureModalOpen } = useInventory();
  const [activeTab, setActiveTab] = useState<'general' | 'clientes' | 'negocios' | 'logistica' | 'faq'>('general');

  if (!isManualModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const manualText = `========================================================================
SILAOMARKET ON LINE · SILAO DE LA VICTORIA, GUANAJUATO
MANUAL OFICIAL DE USUARIO, OPERACIONES Y AFILIACIÓN
Hub Central de Consolidación: Calle 5 de Mayo #45, Silao Centro
Contacto Oficial: hhlozano70@hotmail.com
========================================================================

CAPÍTULO 1: BIENVENIDA Y FILOSOFÍA DEL PROYECTO
------------------------------------------------------------------------
Silaomarket on line es la plataforma municipal de comercio y consolidación
multitienda de Silao de la Victoria, Guanajuato.

Nuestra misión es conectar a las familias y trabajadores de Silao con los
comercios locales (abarrotes, farmacias, ferreterías, carnicerías, tortillerías,
supermercados y más), permitiendo comprar de varios negocios distintos
en UN SOLO CARRITO y pagando UN SOLO COSTO DE ENVÍO.

Ubicación del Hub Central:
Calle 5 de Mayo #45, Silao Centro, Silao de la Victoria, Guanajuato.
Horario de Despacho y Operación: Lunes a Domingo de 8:00 AM a 8:00 PM.


CAPÍTULO 2: GUÍA PARA CLIENTES (COMPRADORES)
------------------------------------------------------------------------
1. REGISTRO Y PERFIL:
   - Ingresa con tu número de WhatsApp (10 dígitos).
   - Registra tu nombre, calle y colonia de Silao.
   - Tu estatus aparecerá como "Cliente Registrado", permitiéndote ver
     el historial completo de tus pedidos y rastrear tus entregas.

2. CARRITO MULTITIENDA:
   - Puedes agregar productos de diferentes tiendas en la misma orden.
   - El sistema calcula el total consolidado automáticamente.

3. TARIFAS DE ENVÍO Y DESPACHO:
   - Tarifa estándar zona urbana Silao: $25.00 MXN.
   - Colonias periféricas o parques industriales: $35.00 a $40.00 MXN.
   - Un solo pago de envío sin importar cuántos comercios integren tu orden.

4. CADENA DE FRÍO GARANTIZADA:
   - Productos perecederos (lácteos, carnes, helados, bebidas frías)
     viajan en hieleras térmicas selladas con acumuladores de frío.

5. RASTREO Y ENTREGA:
   - Cada orden genera un código de rastreo (ej. SLO-TRK-XXXX).
   - Escanea el código QR de tu ticket o consúltalo en "Mis Pedidos".


CAPÍTULO 3: GUÍA PARA COMERCIOS Y NEGOCIOS AFILIADOS
------------------------------------------------------------------------
1. MODELO 0% CUOTA DE ENTRADA:
   - Cero pesos de inscripción y cero rentas fijas mensuales.
   - No arriesgas capital. Si no vendes, no pagas nada.

2. COMISIONES JUSTAS POR GIRO (8% al 18%):
   - Abarrotes y Minisupers: 8%
   - Carnicerías y Pollerías: 9%
   - Fruterías y Verdulerías: 9%
   - Supermercados y Despensa: 10%
   - Farmacias y Salud: 11%
   - Ferreterías y Tlapalerías: 12%
   - Tintorerías y Cerrajerías: 14%
   - Restaurantes y Alimentos Preparados: 16%
   - Regalos, Flores y Servicios Especiales: 18%

3. LIQUIDACIÓN SEMANAL CADA 7 DÍAS:
   - Cada semana recibes el pago íntegro de tus ventas netas.
   - Vía transferencia electrónica o pago en efectivo en el Hub.

4. GESTIÓN DEL CATÁLOGO:
   - Modifica precios comerciales, mayoreo y ofertas de remate en tu panel.
   - El Hub Central se encarga de recolectar o recibir tus paquetes.


CAPÍTULO 4: OPERACIÓN DEL HUB, RUTAS Y REPARTIDORES
------------------------------------------------------------------------
1. RECEPCIÓN Y CONSOLIDACIÓN:
   - Los pedidos ingresan al sistema del Hub Central (Calle 5 de Mayo #45).
   - Se agrupan los paquetes por zona de Silao.
2. COBERTURA:
   - Silao Centro, Fracc. La Joya, Los Ángeles, Valle de San José,
     Independencia, Sopeña, Parque Industrial FIPASI, Las Colinas,
     Guanajuato Puerto Interior (GPI) y comunidades aledañas.
3. SEGURIDAD:
   - Repartidores identificados con gafete oficial de SilaoMarket.
   - Validación digital de entrega al momento de recibir.


CAPÍTULO 5: PREGUNTAS FRECUENTES Y CONTACTO
------------------------------------------------------------------------
- ¿Cómo afilio mi negocio?
  Escribe a: hhlozano70@hotmail.com o acude al Hub Calle 5 de Mayo #45.
- ¿Qué pasa si un producto no está disponible?
  El Hub se comunica de inmediato contigo por WhatsApp para ofrecerte
  un reemplazo o ajuste en el monto final.

Silao de la Victoria, Guanajuato · Corazón del Bajío
Orgullo de Silao · Cerro del Cubilete · Cristo Rey
© ${new Date().getFullYear()} Silaomarket on line. Todos los derechos reservados.
`;
    const blob = new Blob([manualText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Manual_Oficial_SilaoMarket_Online_${new Date().getFullYear()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL CON MOTIVOS DE SILAO (PANTALLA) */}
        <header className="relative bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white px-5 sm:px-8 py-5 sm:py-6 border-b border-emerald-500/20 shrink-0 print:hidden overflow-hidden">
          {/* Fondo sutil de Cristo Rey */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: `url('/images/cristo_rey_silao.jpg')` }}
          />
          <div className="absolute top-0 right-10 -mt-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img 
                  src="/images/silaomarket_logo.jpg" 
                  alt="Silaomarket Logo" 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-contain bg-white p-1 border-2 border-amber-400 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full shadow-xs">
                  GTO
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Manual Oficial de Operaciones
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono shadow-2xs">
                    Silaomarket on line
                  </span>
                </div>
                <p className="text-xs text-amber-300 font-medium flex items-center gap-1.5 mt-0.5">
                  <span>⛰️ Silao de la Victoria</span>
                  <span>•</span>
                  <span>Hub Calle 5 de Mayo #45, Silao Centro</span>
                </p>
              </div>
            </div>

            {/* Acciones principales: Descarga e Imprimir */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
                title="Imprimir o guardar en PDF"
              >
                <Printer className="w-4 h-4 text-emerald-950" />
                <span className="hidden sm:inline">Descargar en PDF / Imprimir</span>
                <span className="sm:hidden">PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Descargar archivo de texto plano con el manual completo"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Descargar TXT</span>
              </button>

              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* BARRA DE PESTAÑAS NAVEGABLES */}
          <div className="relative z-10 flex items-center gap-1.5 mt-4 overflow-x-auto no-scrollbar pt-2 border-t border-white/10">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'general'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Visión & Modelo Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('clientes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'clientes'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>2. Guía para Clientes</span>
            </button>
            <button
              onClick={() => setActiveTab('negocios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'negocios'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>3. Guía Comercios (0% Entrada)</span>
            </button>
            <button
              onClick={() => setActiveTab('logistica')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'logistica'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>4. Logística & Cadena Fría</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'faq'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>5. Preguntas & Soporte</span>
            </button>
          </div>
        </header>

        {/* ENCABEZADO EXCLUSIVO PARA IMPRESIÓN Y PDF */}
        <div className="hidden print:block p-8 border-b-2 border-slate-900 text-slate-900">
          <div className="flex items-center justify-between gap-6 pb-4">
            <div className="flex items-center gap-4">
              <img 
                src="/images/silaomarket_logo.jpg" 
                alt="Silaomarket Logo" 
                className="w-20 h-20 object-contain border border-slate-300 p-1 rounded-xl"
              />
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  SILAOMARKET ON LINE
                </h1>
                <p className="text-sm font-bold text-emerald-800">
                  Plataforma Municipal de Comercio y Consolidación Multitienda
                </p>
                <p className="text-xs text-slate-600">
                  Hub Central de Operaciones: Calle 5 de Mayo #45, Silao Centro, Silao de la Victoria, Guanajuato.
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">DOCUMENTO OFICIAL</p>
              <p>Fecha de emisión: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>Contacto: hhlozano70@hotmail.com</p>
              <p className="font-semibold text-emerald-800">Cerro del Cubilete · Silao, Gto.</p>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL DEL MANUAL */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 bg-slate-50/50 print:bg-white print:p-8 print:overflow-visible">
          
          {/* TAB 1: VISIÓN Y MODELO HUB */}
          {(activeTab === 'general' || typeof window !== 'undefined') && (
            <section className={`${activeTab !== 'general' ? 'hidden print:block' : 'space-y-6'}`}>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    1. Bienvenida y Filosofía de Silaomarket on line
                  </h2>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  <strong>Silaomarket on line</strong> nace para transformar el comercio local en <strong>Silao de la Victoria, Guanajuato</strong>. En un entorno donde las grandes cadenas comerciales y aplicaciones foráneas cobran cuotas abusivas y cobran envíos individuales por cada tienda, Silaomarket implementa una solución de <strong>economía circular solidaria</strong>:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      Un Solo Carrito Multitienda
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      El cliente puede pedir fruta de la recaudería, carne de la carnicería, medicamentos de la farmacia y abarrotes en una sola compra.
                    </p>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h3 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                      Consolidación en el Hub Central
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ubicado en <strong>Calle 5 de Mayo #45, Silao Centro</strong>. El Hub recibe o recolecta los artículos, los empaca y verifica su calidad.
                    </p>
                  </div>

                  <div className="bg-cyan-50/70 border border-cyan-200 p-4 rounded-xl space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h3 className="text-xs font-black text-cyan-950 uppercase tracking-wide">
                      Un Solo Envío y Cadena Fría
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      El cliente paga una sola tarifa de envío ($25 a $40 MXN) y recibe todos sus paquetes en un solo viaje del repartidor, con hielera térmica.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                      Ubicación Estratégica
                    </span>
                    <h4 className="text-sm font-black text-white">
                      Hub Central Silao: Calle 5 de Mayo #45, Silao Centro
                    </h4>
                    <p className="text-xs text-slate-300">
                      Horario continuo de atención: Lunes a Domingo de 8:00 AM a 8:00 PM.
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black whitespace-nowrap">
                    Silao de la Victoria, Gto.
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: GUÍA PARA CLIENTES */}
          {(activeTab === 'clientes' || typeof window !== 'undefined') && (
            <section className={`${activeTab !== 'clientes' ? 'hidden print:block' : 'space-y-6'}`}>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShoppingBag className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    2. Guía Paso a Paso para Clientes (Compradores)
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-emerald-500 pl-4 py-1 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Paso 1: Identificación y Estatus de Cliente Registrado
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Al ingresar, puedes identificarte con tu número de WhatsApp de 10 dígitos y tu nombre. Al registrarte con tu dirección y colonia en Silao, obtendrás el estatus <strong>🛡️ Cliente Registrado</strong>, lo que te permite:
                    </p>
                    <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pt-1">
                      <li>Guardar tus direcciones de entrega en Silao para no reescribirlas.</li>
                      <li>Ver tu historial de pedidos realizados con tu número.</li>
                      <li>Consultar el estatus en tiempo real de cualquier compra pendiente.</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-amber-500 pl-4 py-1 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Paso 2: Exploración de Catálogos y Ofertas de Supermercados
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Utiliza la barra de búsqueda o los filtros por giro (Abarrotes, Farmacia, Ferretería, Carnicería, Frutería, etc.). Si buscas productos de despensa al mejor precio, haz clic en el botón de <strong>🛒 Ofertas de Súper</strong> para ver remates y precios mayoristas activos.
                    </p>
                  </div>

                  <div className="border-l-4 border-cyan-500 pl-4 py-1 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Paso 3: Un Solo Carrito y Cadena Fría Activa
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Agrega productos de tantos comercios como desees. Si tu pedido incluye helados, paletas, lácteos o carnes frías (identificados con el distintivo ❄️ <strong>Cadena Fría</strong>), el Hub empacará tus productos en hielera térmica hermética sin costo adicional.
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4 py-1 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Paso 4: Envío Único y Confirmación
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Al finalizar tu orden, se desglosa el costo de entrega:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-900 block">Zona Urbana Silao Centro y Colonias:</span>
                        <span className="text-sm font-black text-emerald-700">$25.00 MXN</span>
                        <span className="text-[11px] text-slate-500 block">Tarifa fija estándar por orden multitienda completa.</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-900 block">Parques Industriales y Periferia:</span>
                        <span className="text-sm font-black text-indigo-700">$35.00 a $40.00 MXN</span>
                        <span className="text-[11px] text-slate-500 block">GPI, FIPASI, Las Colinas y comunidades conurbadas.</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-emerald-600 pl-4 py-1 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Paso 5: Seguimiento y Código QR de Entrega
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Al confirmar el pedido, recibirás un comprobante digital y un <strong>Código QR de Rastreo</strong>. Puedes abrir la cámara de tu celular para escanear el QR en cualquier momento o hacer clic en "Mis Pedidos" para ver si está en recolección, consolidado en el Hub o en camino a tu puerta.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: GUÍA PARA NEGOCIOS Y COMERCIOS */}
          {(activeTab === 'negocios' || typeof window !== 'undefined') && (
            <section className={`${activeTab !== 'negocios' ? 'hidden print:block' : 'space-y-6'}`}>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Store className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    3. Guía de Afiliación y Operación para Comercios Locales
                  </h2>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-xs font-black uppercase text-amber-900">
                    ⭐ Modelo Comercial 100% Sin Riesgo
                  </span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>0% Cuota de Entrada:</strong> Cualquier tienda, taller, farmacia o comercio establecido de Silao puede registrarse sin pagar inscripción ni mensualidades forzosas. Únicamente se aplica una comisión por venta efectivamente concretada.
                  </p>
                </div>

                {/* TABLA DE COMISIONES POR GIRO */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Esquema de Comisiones Oficial por Giro Comercial:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">Abarrotes y Minisupers</span>
                      <span className="text-xs font-black text-emerald-700">8.0%</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">Carnicerías y Pollerías</span>
                      <span className="text-xs font-black text-emerald-700">9.0%</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">Fruterías y Verdulerías</span>
                      <span className="text-xs font-black text-emerald-700">9.0%</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">Supermercados y Despensa</span>
                      <span className="text-xs font-black text-emerald-700">10.0%</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">Farmacias y Salud</span>
                      <span className="text-xs font-black text-emerald-700">11.0%</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">Ferreterías y Materiales</span>
                      <span className="text-xs font-black text-emerald-700">12.0%</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">Tintorerías y Cerrajerías</span>
                      <span className="text-xs font-black text-emerald-700">14.0%</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">Restaurantes y Comida</span>
                      <span className="text-xs font-black text-emerald-700">16.0%</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">Regalos, Flores y Especiales</span>
                      <span className="text-xs font-black text-emerald-700">18.0%</span>
                    </div>
                  </div>
                </div>

                {/* LIQUIDACIÓN SEMANAL CADA 7 DÍAS */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    <span>Liquidación Semanal Garantizada (Ciclo de 7 Días)</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Las ventas acumuladas de cada comercio afiliado se liquidan puntualmente cada 7 días. El sistema genera el estado de cuenta con el desglose de ventas brutas, deducción de comisión convenida y monto neto transferido directamente a su cuenta bancaria o entregado en efectivo en el Hub Central.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    ¿Cómo comenzar como negocio?
                  </h3>
                  <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1 leading-relaxed">
                    <li>Contacta al equipo de SilaoMarket vía correo a <strong>hhlozano70@hotmail.com</strong> o acude al Hub en <strong>Calle 5 de Mayo #45, Silao Centro</strong>.</li>
                    <li>Registra el nombre de tu comercio, dirección en Silao y teléfono de contacto.</li>
                    <li>Sube tu catálogo de productos con precios comerciales, existencias e indica si manejas cadena de frío.</li>
                    <li>Recibe las notificaciones de pedidos, prepara los paquetes y entrégalos al repartidor del Hub o en la sucursal de Calle 5 de Mayo #45.</li>
                  </ol>
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: LOGÍSTICA, HUB Y CADENA FRÍA */}
          {(activeTab === 'logistica' || typeof window !== 'undefined') && (
            <section className={`${activeTab !== 'logistica' ? 'hidden print:block' : 'space-y-6'}`}>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Truck className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    4. Logística de Consolidación, Reparto y Cadena Fría
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Horario de Despacho y Operación</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      El Hub Central opera de <strong>8:00 AM a 8:00 PM los 7 días de la semana</strong>. Los pedidos realizados dentro de este horario se programan para consolidación inmediata.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-950 font-bold text-sm">
                      <Snowflake className="w-4 h-4 text-cyan-600" />
                      <span>Protocolo Térmico de Cadena Fría</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Productos como paletas, nieve, carnes frescas, quesos y bebidas heladas se trasladan en <strong>hieleras térmicas con gel refrigerante</strong> para garantizar su temperatura óptima hasta la puerta del cliente.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Cobertura Integral en Silao de la Victoria:
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Nuestras unidades y repartidores acreditados cubren todas las colonias del municipio, fraccionamientos residenciales y corredores industriales:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SILAO_COLONIAS.map((col) => (
                      <span key={col} className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-slate-700 text-xs font-medium">
                        📍 {col}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Seguridad y Repartidores Verificados</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Todos los repartidores de Silaomarket portan identificación oficial, uniforme distintivo y validan la entrega de tus paquetes mediante escaneo digital del código QR para asegurar que cada compra llegue a la persona indicada.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: PREGUNTAS FRECUENTES Y CONTACTO */}
          {(activeTab === 'faq' || typeof window !== 'undefined') && (
            <section className={`${activeTab !== 'faq' ? 'hidden print:block' : 'space-y-6'}`}>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-emerald-800">
                  <HelpCircle className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    5. Preguntas Frecuentes, Soporte y Contacto
                  </h2>
                </div>

                <div className="space-y-3">
                  <details className="group border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 open:bg-white transition-colors">
                    <summary className="font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between">
                      <span>¿Cómo funciona el pago único si compro de varias tiendas?</span>
                      <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      El sistema suma el costo de los productos de todas las tiendas seleccionadas y agrega únicamente una sola tarifa de envío ($25 MXN en zona urbana). Pagas el monto total una sola vez, y el Hub se encarga de repartir el importe correspondiente a cada comercio en su liquidación semanal.
                    </p>
                  </details>

                  <details className="group border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 open:bg-white transition-colors">
                    <summary className="font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between">
                      <span>¿Qué métodos de pago se aceptan?</span>
                      <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Aceptamos pago contra entrega en efectivo al recibir el pedido, transferencias bancarias directas (SPEI) y pago con tarjeta.
                    </p>
                  </details>

                  <details className="group border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 open:bg-white transition-colors">
                    <summary className="font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between">
                      <span>¿Puedo afiliar mi negocio si no tengo computadora?</span>
                      <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      ¡Sí! Silaomarket on line está completamente adaptada para teléfonos celulares con WhatsApp. Nuestro personal del Hub Central puede ayudarte a subir tus productos iniciales y notificarte pedidos por mensaje.
                    </p>
                  </details>

                  <details className="group border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 open:bg-white transition-colors">
                    <summary className="font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between">
                      <span>¿Qué pasa si un producto no llega en óptimas condiciones?</span>
                      <span className="text-emerald-600 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Contamos con garantía de reposición inmediata o reembolso íntegro. Reporta el detalle con el repartidor o directamente a nuestro correo de atención oficial para resolverlo en minutos.
                    </p>
                  </details>
                </div>

                {/* DIRECTORIO Y CANALES DE CONTACTO OFICIAL */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wide">
                      Canales Oficiales de Atención y Afiliación
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                      <span className="text-amber-300 font-bold block flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Hub Central
                      </span>
                      <p className="text-slate-200 leading-snug">
                        Calle 5 de Mayo #45, Silao Centro, Silao de la Victoria, Gto.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                      <span className="text-amber-300 font-bold block flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Correo Oficial
                      </span>
                      <a href="mailto:hhlozano70@hotmail.com" className="text-slate-200 hover:text-white underline font-mono break-all leading-snug">
                        hhlozano70@hotmail.com
                      </a>
                    </div>
                    <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                      <span className="text-amber-300 font-bold block flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Horario
                      </span>
                      <p className="text-slate-200 leading-snug">
                        Lunes a Domingo<br />8:00 AM – 8:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* FOOTER DEL MODAL (PANTALLA) */}
        <footer className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-emerald-800">Silaomarket on line</span>
            <span>•</span>
            <span>Orgullo Silaoense · Cerro del Cubilete & Cristo Rey</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </footer>

        {/* PIE DE PÁGINA EXCLUSIVO PARA IMPRESIÓN Y PDF */}
        <div className="hidden print:block p-8 pt-4 border-t-2 border-slate-900 text-slate-800 text-xs mt-6">
          <div className="flex items-center justify-between">
            <p>
              © {new Date().getFullYear()} Silaomarket on line · Silao de la Victoria, Guanajuato, México. Todos los derechos reservados.
            </p>
            <p className="font-bold">
              Hub Central: Calle 5 de Mayo #45, Silao Centro · hhlozano70@hotmail.com
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
