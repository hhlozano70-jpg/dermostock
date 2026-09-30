import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Navigation, 
  QrCode, 
  Phone, 
  MessageCircle, 
  User, 
  Store, 
  Snowflake, 
  AlertTriangle, 
  BarChart3, 
  Calendar, 
  Layers, 
  Filter, 
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  Share2
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Order, TrackingStatus, Driver } from '../types/inventory';
import { checkOperatingHours, checkHourCapacity, getOperatingHoursDistribution } from '../utils/operatingHours';
import { calculateCollectionLeadTime } from '../utils/collectionTime';

export const HubOrdersManager: React.FC = () => {
  const { 
    orders, 
    drivers, 
    assignDriverToOrder, 
    updateOrderStatus, 
    openTrackingModal, 
    settings,
    setIsSettingsModalOpen
  } = useInventory();

  const [activeFilter, setActiveFilter] = useState<'todos' | 'recibido' | 'en_recoleccion' | 'en_camino' | 'entregado'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverMap, setSelectedDriverMap] = useState<{ [orderId: string]: string }>({});
  const [deliveryNoteMap, setDeliveryNoteMap] = useState<{ [orderId: string]: string }>({});

  // 1. Horario de operación (8:00 AM a 8:00 PM)
  const operatingStatus = useMemo(() => {
    return checkOperatingHours(settings);
  }, [settings]);

  // 2. Control de saturación horaria
  const maxPerHour = settings.maxOrdersPerHour || 12;
  const capacityStatus = useMemo(() => {
    return checkHourCapacity(orders, maxPerHour);
  }, [orders, maxPerHour]);

  // 3. Distribución gráfica en bloques de 8:00 AM a 8:00 PM
  const hourlySlots = useMemo(() => {
    return getOperatingHoursDistribution(orders, maxPerHour);
  }, [orders, maxPerHour]);

  // Contadores por estatus
  const counts = useMemo(() => {
    return {
      todos: orders.length,
      recibido: orders.filter(o => o.trackingStatus === 'recibido' || (!o.trackingStatus && o.status === 'pendiente')).length,
      en_recoleccion: orders.filter(o => o.trackingStatus === 'en_recoleccion').length,
      en_camino: orders.filter(o => o.trackingStatus === 'en_camino').length,
      entregado: orders.filter(o => o.trackingStatus === 'entregado' || o.status === 'entregado').length,
    };
  }, [orders]);

  // Filtrado de pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchFilter = 
        activeFilter === 'todos' ||
        (activeFilter === 'recibido' && (o.trackingStatus === 'recibido' || (!o.trackingStatus && o.status === 'pendiente'))) ||
        o.trackingStatus === activeFilter;

      const term = searchTerm.toLowerCase();
      const matchSearch = 
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        (o.deliveryColonia && o.deliveryColonia.toLowerCase().includes(term)) ||
        (o.courierName && o.courierName.toLowerCase().includes(term));

      return matchFilter && matchSearch;
    });
  }, [orders, activeFilter, searchTerm]);

  // Tiempos de recolección previa (1 a 2 horas)
  const avgCollectionLeadTime = useMemo(() => {
    if (orders.length === 0) return '1h 30m';
    const totalMinutes = orders.reduce((sum, o) => {
      const lt = calculateCollectionLeadTime(o);
      return sum + lt.minutes;
    }, 0);
    const avg = Math.round(totalMinutes / orders.length);
    const h = Math.floor(avg / 60);
    const m = avg % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }, [orders]);

  const urgentPickupsCount = useMemo(() => {
    return orders.filter(o => {
      if (o.trackingStatus === 'entregado' || o.status === 'entregado') return false;
      const lt = calculateCollectionLeadTime(o);
      return lt.urgency === 'urgente' || lt.urgency === 'proximo';
    }).length;
  }, [orders]);

  // Generador de enlace de WhatsApp con QR y GPS para el Driver
  const handleSendToDriver = (order: Order, driver: Driver) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://silaomarket-online.onrender.com';
    const qrUrl = `${origin}/?rastreo=${order.trackingCode || order.id}`;
    
    // Dirección para Google Maps / Navegador GPS
    const destinationQuery = encodeURIComponent(
      `${order.customerAddress || order.deliveryColonia || 'Silao Centro'}, Silao, Guanajuato`
    );
    const gpsUrl = `https://www.google.com/maps/search/?api=1&query=${destinationQuery}`;

    const storesList = order.merchantsNames?.map(m => `   🏪 ${m}`).join('\n') || '   🏪 Comercios Centro Silao';
    const leadTime = calculateCollectionLeadTime(order);

    const text = 
      `🛵 *DESPACHO DE PEDIDO HUB SILAO*\n` +
      `--------------------------------\n` +
      `*Folio:* #${order.id}\n` +
      `*Driver Asignado:* ${driver.name}\n` +
      `*Cliente:* ${order.customerName}\n` +
      `*Teléfono:* ${order.customerPhone}\n` +
      `*Dirección:* ${order.customerAddress || order.deliveryColonia || 'Silao, Gto'}\n\n` +
      `⏱️ *TIEMPO DE RECOLECCIÓN PREVIA:* ${leadTime.hoursFormatted} (${leadTime.minutes} min antes)\n` +
      `🕒 *HORA RECOMENDADA DE INICIO EN TIENDAS:* ${leadTime.pickupStartTimeStr}\n` +
      `🎯 *HORA ESTIMADA DE ENTREGA:* ${leadTime.targetDeliveryTimeStr}\n` +
      `📋 *Cálculo Logístico:* ${leadTime.breakdown}\n\n` +
      `🗺️ *GUIAR POR GPS (Google Maps / Waze):*\n${gpsUrl}\n\n` +
      `📱 *QR DE ENTREGA AL CLIENTE:*\n${qrUrl}\n\n` +
      `🛒 *COMERCIOS A RECOLECTAR EN SILAO:*\n${storesList}\n\n` +
      `💵 *TOTAL A COBRAR:* $${order.total.toFixed(2)} MXN\n` +
      `💳 *Método de Pago:* ${order.paymentMethod.toUpperCase()}\n` +
      `🚚 *Costo de Envío:* $${(order.deliveryFee || 25).toFixed(2)} MXN\n` +
      (order.hasColdChain ? `❄️ *ATENCIÓN:* Llevar hielera térmica activa para Cadena Fría.\n\n` : `\n`) +
      `Por favor confirma recolección y avanza a domicilio. ¡Buen viaje!`;

    const cleanPhone = driver.phone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* 1. Header con Control de Horarios y Capacidad Anti-Saturación */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <Truck className="w-3.5 h-3.5" />
              <span>Hub Central Silao · Despacho y Logística</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">Control de Pedidos & Drivers</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Monitorea pedidos recibidos, asigna rutas a repartidores con enlace GPS, genera códigos QR y supervisa la capacidad horaria de 8:00 AM a 8:00 PM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Ajustar Horario y Capacidad</span>
            </button>
          </div>
        </div>

        {/* 3 Badges de Monitoreo en Tiempo Real (Horario Comercial + Anti-Saturación + Tiempos de Recolección) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/10">
          
          {/* Tarjeta Horario 8am - 8pm */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            operatingStatus.isOpen 
              ? 'bg-emerald-900/40 border-emerald-500/30 text-emerald-200' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                operatingStatus.isOpen ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
                  Horario de Pedidos Silao (8am - 8pm)
                </span>
                <span className="text-sm font-black text-white">
                  {operatingStatus.isOpen ? '🟢 Hub Abierto' : '🌙 Fuera de Horario'}
                </span>
                <span className="text-xs block opacity-90 mt-0.5">
                  {operatingStatus.message}
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono font-bold bg-black/40 px-2 py-1 rounded">
                {operatingStatus.currentHour.toString().padStart(2, '0')}:{operatingStatus.currentMinute.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Tarjeta Anti-Saturación por Hora */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            capacityStatus.isSaturated 
              ? 'bg-red-950/40 border-red-500/40 text-red-200' 
              : 'bg-slate-800/60 border-slate-700 text-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                capacityStatus.isSaturated ? 'bg-red-500 text-white animate-pulse' : 'bg-sky-500 text-slate-950'
              }`}>
                {capacityStatus.isSaturated ? <AlertTriangle className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
                  Capacidad de Envíos en esta Hora
                </span>
                <span className="text-sm font-black text-white">
                  {capacityStatus.currentHourOrders} de {capacityStatus.maxAllowed} envíos
                </span>
                <span className="text-xs block opacity-90 mt-0.5">
                  {capacityStatus.isSaturated ? 'Capacidad máxima alcanzada' : `${capacityStatus.remainingSlots} turnos disponibles`}
                </span>
              </div>
            </div>

            {/* Barra de progreso de saturación */}
            <div className="w-20 text-right">
              <span className="text-xs font-mono font-bold">{capacityStatus.saturationPercentage}%</span>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full transition-all ${
                    capacityStatus.saturationPercentage >= 90 ? 'bg-red-500' : capacityStatus.saturationPercentage >= 60 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${capacityStatus.saturationPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tarjeta Ventana de Recolección (1 a 2 horas antes) */}
          <div className="p-4 rounded-2xl border bg-indigo-950/40 border-indigo-500/30 text-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-slate-950 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
                  Recolección en Comercios
                </span>
                <span className="text-sm font-black text-white">
                  1 a 2 Horas Previas
                </span>
                <span className="text-xs block opacity-90 mt-0.5">
                  Promedio: <strong>{avgCollectionLeadTime}</strong> por ruta ({urgentPickupsCount} en ventana activa)
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded font-bold">
                Silao Hub
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 2. VISUALIZACIONES GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica 1: Estatus de Envíos (Recibidos, En Camino, Entregados) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Estatus de Envíos en Hub</span>
            </h3>
            <span className="text-xs text-slate-500">Total: {orders.length}</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Recibidos */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>Recibidos / Pendientes</span>
                </span>
                <span className="font-mono">{counts.recibido} ({orders.length ? Math.round((counts.recibido / orders.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${orders.length ? (counts.recibido / orders.length) * 100 : 0}%` }} />
              </div>
            </div>

            {/* En Recolección */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>En Recolección (Tiendas)</span>
                </span>
                <span className="font-mono">{counts.en_recoleccion} ({orders.length ? Math.round((counts.en_recoleccion / orders.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${orders.length ? (counts.en_recoleccion / orders.length) * 100 : 0}%` }} />
              </div>
            </div>

            {/* En Camino */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <span>En Camino a Domicilio</span>
                </span>
                <span className="font-mono">{counts.en_camino} ({orders.length ? Math.round((counts.en_camino / orders.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600" style={{ width: `${orders.length ? (counts.en_camino / orders.length) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Entregados */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Entregados con Éxito</span>
                </span>
                <span className="font-mono">{counts.entregado} ({orders.length ? Math.round((counts.entregado / orders.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600" style={{ width: `${orders.length ? (counts.entregado / orders.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfica 2: Carga y Tiempos de Entrega por Franjas (8:00 AM a 8:00 PM) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Envíos por Horario (8am - 8pm)</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold">Tope: {maxPerHour * 2}/bloque</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 items-end h-36 pt-4">
            {hourlySlots.map((slot, idx) => {
              const heightPct = Math.min(100, Math.max(10, Math.round((slot.orderCount / (maxPerHour * 2 || 24)) * 100)));
              return (
                <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded px-1.5 py-0.5 pointer-events-none whitespace-nowrap z-20">
                    {slot.slot}: {slot.orderCount} ord. ({slot.deliveredCount} entregadas)
                  </div>

                  <span className="text-[10px] font-black font-mono text-slate-800">{slot.orderCount}</span>
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-700 group-hover:to-teal-500 transition-all shadow-xs"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] text-slate-500 font-semibold truncate w-full text-center">
                    {slot.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Histograma de demanda de entregas en Silao según el horario comercial.
          </p>
        </div>

        {/* Gráfica 3: Asignación a Drivers de Silao */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              <span>Flotilla de Repartidores ({drivers.length})</span>
            </h3>
            <span className="text-xs text-emerald-700 font-bold">Activos</span>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {drivers.map((drv) => {
              const driverOrders = orders.filter(o => o.driverId === drv.id || o.courierName?.includes(drv.name));
              const inProgress = driverOrders.filter(o => o.trackingStatus === 'en_camino' || o.trackingStatus === 'en_recoleccion').length;

              return (
                <div key={drv.id} className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900">{drv.name}</strong>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        drv.status === 'en_ruta' || inProgress > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {inProgress > 0 ? `${inProgress} en ruta` : drv.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                      {drv.vehicle}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900">{driverOrders.length} ord.</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{drv.phone}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. CONTROL Y BANDEJA DE PEDIDOS EN EL HUB */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        
        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900">Bandeja de Despacho y Asignación</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestiona los cambios de estado, asigna conductores y envía el QR y enlace GPS al teléfono del repartidor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por cliente, folio o zona..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Tabs de Filtro por Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 text-xs font-bold">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'todos' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({counts.todos})
          </button>
          <button
            onClick={() => setActiveFilter('recibido')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'recibido' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📥 Recibidos ({counts.recibido})
          </button>
          <button
            onClick={() => setActiveFilter('en_recoleccion')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'en_recoleccion' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🏪 En Recolección ({counts.en_recoleccion})
          </button>
          <button
            onClick={() => setActiveFilter('en_camino')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'en_camino' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🛵 En Camino ({counts.en_camino})
          </button>
          <button
            onClick={() => setActiveFilter('entregado')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'entregado' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ✅ Entregados ({counts.entregado})
          </button>
        </div>

        {/* Listado de Pedidos en Tarjetas de Despacho */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Package className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No hay pedidos con el filtro seleccionado</p>
            <p className="text-xs text-slate-500">Prueba cambiando de pestaña o limpiando el término de búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const currentDriverId = selectedDriverMap[order.id] || order.driverId || drivers[0]?.id;
              const assignedDriver = drivers.find(d => d.id === (order.driverId || currentDriverId)) || drivers[0];
              const leadTime = calculateCollectionLeadTime(order);
              const totalPieces = order.items.reduce((sum, i) => sum + i.quantity, 0);

              return (
                <div 
                  key={order.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-xs space-y-4"
                >
                  {/* Encabezado del Pedido */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-black text-sm">
                        📦
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm">Pedido #{order.id}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            order.trackingStatus === 'entregado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.trackingStatus === 'en_camino'
                                ? 'bg-purple-100 text-purple-800'
                                : order.trackingStatus === 'en_recoleccion'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.trackingStatus || 'Recibido'}
                          </span>
                          {order.hasColdChain && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center gap-1">
                              <Snowflake className="w-3 h-3" />
                              Cadena Fría
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(order.date).toLocaleString('es-MX')} · {totalPieces} pieza(s) en {order.merchantsCount || 1} comercio(s)
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-base font-black text-slate-900 block font-mono">
                        ${order.total.toFixed(2)} MXN
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Envío: <strong>${(order.deliveryFee || 25).toFixed(2)} MXN</strong> ({order.paymentMethod})
                      </span>
                    </div>
                  </div>

                  {/* Banner de Tiempo de Recolección Previa (1h a 2h antes) */}
                  <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                    leadTime.urgency === 'urgente'
                      ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                      : leadTime.urgency === 'proximo'
                        ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                        : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        leadTime.urgency === 'urgente'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : leadTime.urgency === 'proximo'
                            ? 'bg-amber-500 text-white'
                            : 'bg-indigo-600 text-white'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-xs">
                            ⏱️ Recolección Previa: <strong className="text-indigo-950 font-black">{leadTime.hoursFormatted}</strong> ({leadTime.minutes} min antes)
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${leadTime.urgencyBadgeColor}`}>
                            {leadTime.urgencyLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {leadTime.breakdown} · Requiere visitar {order.merchantsCount || 1} negocio(s) y recolectar {totalPieces} artículo(s).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right shrink-0">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Iniciar Recolección</span>
                        <span className="font-mono font-black text-indigo-950 text-xs">{leadTime.pickupStartTimeStr}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Entrega al Cliente</span>
                        <span className="font-mono font-black text-emerald-800 text-xs">{leadTime.targetDeliveryTimeStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo: Datos del Cliente & Comercios a Recolectar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Cliente & Destino */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-slate-700 font-bold">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>Cliente: {order.customerName}</span>
                        </span>
                        <a href={`tel:${order.customerPhone}`} className="text-emerald-700 hover:underline font-mono">
                          {order.customerPhone}
                        </a>
                      </div>
                      
                      <div className="text-slate-600 flex items-start gap-1.5 pt-1">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block">{order.deliveryColonia || 'Silao Centro'}</strong>
                          <span>{order.customerAddress || 'Entrega en domicilio local'}</span>
                        </div>
                      </div>

                      {/* Botón de Enlace Directo GPS a Google Maps / Waze */}
                      <div className="pt-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((order.customerAddress || order.deliveryColonia || 'Silao') + ', Silao, Guanajuato')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[11px] transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5 text-sky-600" />
                          <span>Abrir Dirección en GPS (Google Maps)</span>
                          <ExternalLink className="w-3 h-3 text-sky-500" />
                        </a>
                      </div>
                    </div>

                    {/* Comercios a Recolectar en Silao */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Comercios para recolección del Hub ({order.merchantsCount || 1}):</span>
                      </span>
                      <ul className="space-y-1 pl-2 border-l-2 border-indigo-200">
                        {order.merchantsNames?.map((mName, mIdx) => (
                          <li key={mIdx} className="text-slate-700 font-medium flex items-center justify-between">
                            <span>🏪 {mName}</span>
                            <span className="text-[10px] text-slate-400">Silao</span>
                          </li>
                        )) || (
                          <li className="text-slate-600">Comercios del Centro de Silao</li>
                        )}
                      </ul>
                    </div>

                  </div>

                  {/* Acciones de Despacho & Asignación al Conductor */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* Control de Estatus del Hub */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-500 mr-1">Cambiar Estado:</span>
                      
                      <button
                        onClick={() => updateOrderStatus(order.id, 'recibido')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          order.trackingStatus === 'recibido'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Recibido
                      </button>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'en_recoleccion')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          order.trackingStatus === 'en_recoleccion'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        En Recolección
                      </button>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'en_camino')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          order.trackingStatus === 'en_camino'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        En Camino
                      </button>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'entregado')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          order.trackingStatus === 'entregado'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Entregado
                      </button>
                    </div>

                    {/* Asignación de Driver & Enlace WhatsApp con QR + GPS */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      
                      {/* Selector de Driver */}
                      <select
                        value={selectedDriverMap[order.id] || order.driverId || drivers[0]?.id}
                        onChange={(e) => {
                          const newDId = e.target.value;
                          setSelectedDriverMap({ ...selectedDriverMap, [order.id]: newDId });
                          assignDriverToOrder(order.id, newDId);
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
                      >
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>
                            🛵 {d.name} ({d.vehicle.split('-')[0].trim()})
                          </option>
                        ))}
                      </select>

                      {/* Botón WhatsApp con QR y GPS */}
                      <button
                        onClick={() => handleSendToDriver(order, assignedDriver)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Enviar guía completa por WhatsApp con QR y enlace GPS para el repartidor"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Enviar QR & GPS a Driver</span>
                      </button>

                      {/* Ver QR de Rastreo */}
                      <button
                        onClick={() => openTrackingModal(order)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                        title="Ver Código QR en pantalla"
                      >
                        <QrCode className="w-4 h-4 text-slate-800" />
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
