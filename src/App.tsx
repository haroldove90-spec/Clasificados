import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  User, 
  Compass, 
  Flame, 
  Key, 
  Zap, 
  Droplet, 
  ArrowLeft, 
  Navigation, 
  Radio, 
  Send, 
  Star,
  Power,
  Map as MapIcon,
  ShieldAlert,
  Sliders,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView, Technician, ActiveAlert } from './types';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [currentTime, setCurrentTime] = useState('10:42');
  
  // Keep clock updated
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strHours = hours < 10 ? `0${hours}` : `${hours}`;
      const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setCurrentTime(`${strHours}:${strMinutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  // --- STATE FOR EMERGENCY MODE ---
  const [emergencyCategory, setEmergencyCategory] = useState<'plumbing' | 'electricity' | 'locksmith' | 'gas'>('plumbing');
  const [emergencyStep, setEmergencyStep] = useState(1);
  const [assignedTech, setAssignedTech] = useState<Technician | null>(null);
  
  useEffect(() => {
    if (view !== 'emergency') {
      setEmergencyStep(1);
      setAssignedTech(null);
      return;
    }

    if (emergencyStep < 2) {
      return;
    }

    // Step 2 -> 3 (Transmitting signals...)
    const timer2 = setTimeout(() => {
      setEmergencyStep(3);
    }, 2500);

    // Step 3 -> 4 (Assign a tech)
    const timer3 = setTimeout(() => {
      setEmergencyStep(4);
      setAssignedTech({
        id: 'tech-1',
        name: 'Hugo Ruiz',
        specialty: emergencyCategory === 'plumbing' ? 'Plomero de Emergencia' :
                   emergencyCategory === 'electricity' ? 'Técnico Electricista' :
                   emergencyCategory === 'locksmith' ? 'Cerrajero Certificado' : 'Instalador de Gas',
        distance: '1.4 km',
        rating: 4.9,
        status: 'arriving',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80'
      });
    }, 5500);

    return () => {
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [view, emergencyStep, emergencyCategory]);

  // --- STATE FOR DISPONIBLE (TECHNICIAN) MODE ---
  const [techSpecialty, setTechSpecialty] = useState<'plumbing' | 'electricity' | 'locksmith' | 'gas'>('electricity');
  const [earnings, setEarnings] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [activeJob, setActiveJob] = useState<ActiveAlert | null>(null);
  const [jobProgress, setJobProgress] = useState<'accepted' | 'arrived' | 'completed'>('accepted');
  const [technicianChat, setTechnicianChat] = useState<{sender: 'client' | 'tech', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Simulated available alerts based on category
  const [availableAlerts, setAvailableAlerts] = useState<ActiveAlert[]>([
    {
      id: 'alert-1',
      title: 'Tubería Rota en Cocina',
      description: 'Agua filtrándose al piso de abajo. Se requiere urgente.',
      distance: '0.8 km',
      category: 'plumbing',
      payout: 450,
      timeAgo: 'Hace 2 min'
    },
    {
      id: 'alert-2',
      title: 'Cortocircuito en Medidor',
      description: 'Chispas en la caja principal de fusibles. Toda la casa sin luz.',
      distance: '1.5 km',
      category: 'electricity',
      payout: 680,
      timeAgo: 'Hace 1 min'
    },
    {
      id: 'alert-3',
      title: 'Llaves Adentro de Casa',
      description: 'Puerta blindada trabada con niño adentro de la propiedad.',
      distance: '2.1 km',
      category: 'locksmith',
      payout: 500,
      timeAgo: 'Hace 5 min'
    },
    {
      id: 'alert-4',
      title: 'Olor Fuerte a Gas en Patio',
      description: 'Posible fuga en conexión de cilindro de gas LP.',
      distance: '3.4 km',
      category: 'gas',
      payout: 750,
      timeAgo: 'Hace 4 min'
    }
  ]);

  const acceptJob = (job: ActiveAlert) => {
    setActiveJob(job);
    setJobProgress('accepted');
    setTechnicianChat([
      { sender: 'client', text: '¡Hola! Qué bueno que aceptaste. ¿Cuánto tiempo tardas en llegar?' },
      { sender: 'tech', text: 'Hola, ya voy en camino. Llego en unos 10 minutos.' }
    ]);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setTechnicianChat(prev => [...prev, { sender: 'tech', text: chatInput }]);
    setChatInput('');
    
    // Auto client response
    setTimeout(() => {
      setTechnicianChat(prev => [
        ...prev, 
        { sender: 'client', text: 'Perfecto, te espero aquí. Hay lugar para estacionar.' }
      ]);
    }, 1500);
  };

  const finishJob = () => {
    if (!activeJob) return;
    setEarnings(prev => prev + activeJob.payout);
    setCompletedJobs(prev => prev + 1);
    setActiveJob(null);
  };

  // --- STATE FOR MAP MODE ---
  const [mapFilter, setMapFilter] = useState<'all' | 'alerts' | 'techs' | 'hot'>('all');
  const [selectedMapPin, setSelectedMapPin] = useState<any>(null);

  // Simulated Map Markers
  const mapMarkers = [
    { id: 'pin-1', type: 'alert', lat: 35, lng: 45, title: 'Inundación Sótano', desc: 'Auxilio urgente de plomería a 1.2km', cat: 'plumbing', severity: 'high' },
    { id: 'pin-2', type: 'alert', lat: 60, lng: 25, title: 'Falla Eléctrica Médica', desc: 'Oxigenador sin energía de respaldo. a 2.5km', cat: 'electricity', severity: 'critical' },
    { id: 'pin-3', type: 'alert', lat: 20, lng: 70, title: 'Cerradura Trabada', desc: 'Cliente atrapado en recámara. a 0.5km', cat: 'locksmith', severity: 'medium' },
    { id: 'pin-4', type: 'tech', lat: 48, lng: 55, name: 'Técnico Carlos', status: 'Trabajando', specialty: 'Electricista' },
    { id: 'pin-5', type: 'tech', lat: 72, lng: 40, name: 'Técnico Mario', status: 'Disponible', specialty: 'Cerrajero' },
    { id: 'pin-6', type: 'hot', lat: 50, lng: 30, radius: 40, name: 'Zona Centro (Alta Demanda)', load: '90%' },
    { id: 'pin-7', type: 'hot', lat: 25, lng: 60, radius: 30, name: 'Colonia Roma (Fuga Masiva)', load: '75%' },
  ];

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4 font-sans select-none antialiased relative">
      {/* Container simulating a professional, polished mobile device frame */}
      <div className="relative w-full max-w-[360px] h-[720px] bg-white rounded-[48px] border-[10px] border-[#262626] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col text-gray-800">
        
        {/* Mobile Status Bar */}
        <div className="h-8 pt-2 px-8 flex justify-between items-center text-xs font-bold z-40 bg-white border-b border-gray-50">
          <span className="text-gray-800">{currentTime}</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-4 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-4 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-4 h-2 bg-gray-800 rounded-full"></div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto relative bg-white pb-6">
          <AnimatePresence mode="wait">
            
            {/* 1. HOME SCREEN */}
            {view === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-between px-6 py-4"
              >
                {/* Brand Header */}
                <header className="w-full pt-4 pb-4 flex flex-col items-center border-b border-gray-100">
                  <div className="text-2xl font-black tracking-tighter text-black flex items-center gap-2">
                    <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                    FIXMATCH
                  </div>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    RED TÉCNICA DE EMERGENCIA
                  </p>
                </header>

                {/* Central Question */}
                <div className="my-auto text-center py-6">
                  <h1 id="home-headline" className="text-xl font-bold text-gray-800 tracking-tight">
                    ¿Qué necesitas solucionar hoy?
                  </h1>
                  <p className="text-xs text-gray-400 mt-1 max-w-[250px] mx-auto">
                    Selecciona una opción para continuar
                  </p>
                </div>

                {/* Buttons Stack */}
                <div className="space-y-4 pt-2">
                  {/* BUTTON 1: SOLICITAR AUXILIO URGENTE (RED) */}
                  <button
                    id="btn-urgente"
                    onClick={() => setView('emergency')}
                    className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white py-5 px-4 rounded-2xl shadow-lg shadow-red-100 flex flex-col items-center transition-all group cursor-pointer active:scale-[0.98]"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">EMERGENCIA</span>
                    <span className="text-lg font-extrabold tracking-wide">SOLICITAR AUXILIO URGENTE</span>
                    <span className="text-[10px] mt-1 opacity-70 italic">Señal de alerta a 5km a la redonda</span>
                  </button>

                  {/* BUTTON 2: ACTIVAR MODO DISPONIBLE (GREEN) */}
                  <button
                    id="btn-disponible"
                    onClick={() => setView('available')}
                    className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-5 px-4 rounded-2xl shadow-lg shadow-green-100 flex flex-col items-center transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">SOY TÉCNICO</span>
                    <span className="text-lg font-extrabold tracking-wide">ACTIVAR MODO DISPONIBLE</span>
                    <span className="text-[10px] mt-1 opacity-70 italic">Comienza a recibir solicitudes de trabajo</span>
                  </button>

                  {/* BUTTON 3: VER MAPA DE LA CIUDAD (BLUE) */}
                  <button
                    id="btn-mapa"
                    onClick={() => setView('map')}
                    className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-5 px-4 rounded-2xl shadow-lg shadow-blue-100 flex flex-col items-center transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">EXPLORAR</span>
                    <span className="text-lg font-extrabold tracking-wide">VER MAPA DE LA CIUDAD</span>
                    <span className="text-[10px] mt-1 opacity-70 italic">Zonas con alta demanda de servicios</span>
                  </button>
                </div>

                {/* Bottom Status Info */}
                <div className="mt-auto pt-4 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">
                    ESTADO: <span className="text-blue-600 font-bold">Esperando interacción...</span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* 2. EMERGENCY / BROADCAST SCREEN */}
            {view === 'emergency' && (
              <motion.div
                key="emergency"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col px-6 py-4 justify-between"
              >
                {/* Header bar */}
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <button 
                    id="btn-back-emergency"
                    onClick={() => setView('home')} 
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="font-extrabold text-sm tracking-wide uppercase text-red-600">
                      {emergencyStep === 1 ? "BUSCANDO EN TIEMPO REAL" : "ALERTA ENVIADA"}
                    </h2>
                    <p className="text-[10px] text-gray-400">
                      {emergencyStep === 1 ? "Análisis de cobertura IA" : "Localizando soporte de inmediato"}
                    </p>
                  </div>
                </div>

                {/* STEP 1: ULTRA-MINIMALIST PRE-CONFIRMATION INTERFACE */}
                {emergencyStep === 1 ? (
                  <div className="flex-1 flex flex-col justify-between py-2">
                    {/* Category Selector integrated beautifully to allow interactive pricing changes */}
                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2">
                        SELECCIONA TIPO DE EMERGENCIA
                      </p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'plumbing', icon: Droplet, label: 'Plomería', color: 'blue' },
                          { id: 'electricity', icon: Zap, label: 'Electricidad', color: 'amber' },
                          { id: 'locksmith', icon: Key, label: 'Cerrajería', color: 'purple' },
                          { id: 'gas', icon: Flame, label: 'Gas LP', color: 'red' }
                        ].map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = emergencyCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setEmergencyCategory(cat.id as any)}
                              className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-black text-white border-black shadow-md' 
                                  : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <Icon className={`w-4 h-4 mb-1 ${
                                isSelected 
                                  ? 'text-white' 
                                  : cat.color === 'blue' ? 'text-blue-500' : cat.color === 'amber' ? 'text-amber-500' : cat.color === 'purple' ? 'text-purple-500' : 'text-red-500'
                              }`} />
                              <span className="text-[9px] font-bold tracking-tight">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Indicator visual de radar o escaneo */}
                    <div className="flex-1 flex flex-col items-center justify-center relative my-3">
                      {/* Radar lines */}
                      <div className="absolute w-36 h-36 border border-gray-200 rounded-full flex items-center justify-center">
                        <div className="w-24 h-24 border border-gray-150 rounded-full flex items-center justify-center">
                          <div className="w-14 h-14 border border-gray-100 rounded-full"></div>
                        </div>
                      </div>

                      {/* Scanning concentric rings */}
                      <div className="absolute w-32 h-32 bg-orange-500/5 rounded-full animate-ping [animation-duration:3s]"></div>
                      <div className="absolute w-20 h-20 bg-orange-500/10 rounded-full animate-pulse"></div>

                      {/* Rotating scanning line vector */}
                      <div className="absolute w-32 h-32 rounded-full border border-dashed border-orange-300/30 animate-spin [animation-duration:8s] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full absolute top-0"></div>
                      </div>

                      {/* Center Beacon */}
                      <div className="relative z-10 w-11 h-11 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-md shadow-orange-100 border-2 border-white">
                        <Radio className="w-4.5 h-4.5 text-white animate-pulse" />
                      </div>

                      {/* Aviso de Técnicos Encontrados */}
                      <div className="mt-4 z-10">
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase animate-pulse">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          3 Técnicos encontrados a menos de 3km
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta limpia con precio estimado por la IA */}
                    <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-150 rounded-2xl p-4 shadow-sm relative overflow-hidden mb-2">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Sparkles className="w-12 h-12 text-orange-500" />
                      </div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          PRECIO ESTIMADO POR IA
                        </span>
                      </div>
                      
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-900 tracking-tight">
                          {emergencyCategory === 'plumbing' ? '$450 - $600' :
                           emergencyCategory === 'electricity' ? '$550 - $750' :
                           emergencyCategory === 'locksmith' ? '$400 - $550' : '$650 - $900'}
                        </span>
                        <span className="text-xs font-bold text-gray-500">MXN</span>
                      </div>
                      
                      <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">
                        Tarifa predictiva optimizada para el servicio de <span className="font-semibold text-gray-800">
                          {emergencyCategory === 'plumbing' ? 'Plomería' :
                           emergencyCategory === 'electricity' ? 'Electricidad' :
                           emergencyCategory === 'locksmith' ? 'Cerrajería' : 'Fuga de Gas'}
                        </span>. Incluye diagnóstico, herramientas básicas y garantía de arribo rápido.
                      </p>
                    </div>

                    {/* Botón naranja grande CONFIRMAR Y LANZAR ALERTA */}
                    <div className="mt-2">
                      <button
                        id="btn-confirm-alert"
                        onClick={() => setEmergencyStep(2)}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-3.5 px-4 rounded-xl shadow-lg shadow-orange-100 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-[0.98] border border-orange-400"
                      >
                        <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-90">COBERTURA CONFIRMADA</span>
                        <span className="text-xs font-black tracking-wide uppercase flex items-center gap-1.5 mt-0.5">
                          🟧 CONFIRMAR Y LANZAR ALERTA
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STEP 2+, 3, 4: REAL TIME MATCHING RADAR & TECHNICIAN PROGRESS */
                  <div className="flex-1 flex flex-col justify-between py-2">
                    {/* Radar visualization */}
                    <div className="flex-1 flex flex-col items-center justify-center my-2 relative">
                      {/* Circular radar line boundaries */}
                      <div className="absolute w-44 h-44 border border-gray-200 rounded-full flex items-center justify-center">
                        <div className="w-32 h-32 border border-gray-150 rounded-full flex items-center justify-center">
                          <div className="w-20 h-20 border border-gray-100 rounded-full"></div>
                        </div>
                      </div>

                      {/* Dynamic pulse signals */}
                      <div className="absolute w-36 h-36 bg-red-500/10 rounded-full animate-ping"></div>
                      <div className="absolute w-24 h-24 bg-red-500/15 rounded-full animate-ping [animation-delay:1s]"></div>

                      {/* Center core beacon */}
                      <div className="relative z-10 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-200 border border-white">
                        <Radio className="w-5 h-5 text-white animate-pulse" />
                      </div>

                      {/* Simulated 5km indicator text */}
                      <div className="mt-6 text-center px-2">
                        <div className="inline-flex items-center gap-1 text-xs text-red-600 font-bold tracking-wider">
                          <Compass className="w-3.5 h-3.5 animate-spin" />
                          TRANSMITIENDO ALERTA (5KM)
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 h-8">
                          {emergencyStep === 2 && "Buscando técnicos más cercanos..."}
                          {emergencyStep === 3 && "Alerta recibida en terminales. Esperando confirmación..."}
                          {emergencyStep >= 4 && "¡Técnico en camino!"}
                        </p>
                      </div>
                    </div>

                    {/* Response log stack */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-3">
                      <h4 className="text-[9px] font-bold tracking-wider text-gray-400 uppercase mb-2">
                        Bitácora de Conexión
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Rango de difusión:</span>
                          <span className="font-bold text-gray-800">5.000 metros (OK)</span>
                        </div>

                        {emergencyStep >= 2 && (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="flex items-center gap-1.5 text-red-600 font-semibold"
                          >
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                            Buscando especialistas en {emergencyCategory === 'plumbing' ? 'plomería' : emergencyCategory === 'electricity' ? 'electricidad' : emergencyCategory === 'locksmith' ? 'cerrajería' : 'fugas'}...
                          </motion.div>
                        )}

                        {emergencyStep >= 3 && !assignedTech && (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="flex items-center gap-1.5 text-amber-600 font-semibold"
                          >
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            Dispositivos notificados. Esperando respuesta.
                          </motion.div>
                        )}

                        {assignedTech && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="bg-white border border-gray-150 p-2.5 rounded-lg mt-1 flex items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="flex items-center gap-2">
                              <img 
                                src={assignedTech.avatar} 
                                alt={assignedTech.name} 
                                className="w-9 h-9 rounded-full object-cover border border-gray-200" 
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-bold text-gray-800 text-xs">{assignedTech.name}</p>
                                <p className="text-[10px] text-emerald-600 font-semibold">{assignedTech.specialty}</p>
                                <p className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" /> 4.9 • {assignedTech.distance}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                                En Camino
                              </span>
                              <p className="text-[9px] text-gray-400 mt-1">Llega: 8 min</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel Button */}
                <button
                  id="btn-cancel-emergency"
                  onClick={() => setView('home')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-250 rounded-xl py-3 font-bold text-xs tracking-wider transition-all cursor-pointer text-center animate-pulse"
                >
                  {emergencyStep === 1 ? "VOLVER AL MENÚ PRINCIPAL" : "CANCELAR ALERTA URGENTE"}
                </button>
              </motion.div>
            )}

            {/* 3. AVAILABLE / ACTIVE WORKER SCREEN */}
            {view === 'available' && (
              <motion.div
                key="available"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col px-6 py-4 justify-between"
              >
                {/* Header with worker status */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-600">
                      Modo Disponible
                    </span>
                  </div>
                  <button 
                    id="btn-disconnect-tech"
                    onClick={() => {
                      setActiveJob(null);
                      setView('home');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold tracking-wide transition-colors cursor-pointer"
                  >
                    <Power className="w-3 h-3" />
                    DESCONECTAR
                  </button>
                </div>

                {/* Specialty Picker & Stats if not in active job */}
                {!activeJob ? (
                  <div className="flex-1 flex flex-col space-y-3 justify-between">
                    {/* Worker Profile Mini Card */}
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                          <User className="w-4.5 h-4.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Técnico Colaborador</p>
                          <p className="text-[9px] text-gray-400">ID: #94218-FX</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-0.5 justify-end">
                          <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                          <span className="text-xs font-bold text-gray-800">5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-center">
                        <span className="text-[8px] text-gray-400 uppercase tracking-wider block font-bold">Trabajos</span>
                        <span className="text-base font-bold text-gray-800">{completedJobs}</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-center">
                        <span className="text-[8px] text-gray-400 uppercase tracking-wider block font-bold">Ingresos</span>
                        <span className="text-base font-bold text-emerald-600">${earnings} MXN</span>
                      </div>
                    </div>

                    {/* Specialty dropdown filter */}
                    <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600 font-semibold">Especialidad</span>
                      </div>
                      <select 
                        value={techSpecialty} 
                        onChange={(e) => setTechSpecialty(e.target.value as any)}
                        className="bg-white border border-gray-200 text-gray-700 text-xs rounded-md px-2 py-0.5 focus:outline-none font-semibold cursor-pointer"
                      >
                        <option value="electricity">Electricidad ⚡</option>
                        <option value="plumbing">Plomería 💧</option>
                        <option value="locksmith">Cerrajería 🔑</option>
                        <option value="gas">Fugas de Gas 🔥</option>
                      </select>
                    </div>

                    {/* Available Urgent Alarms Title */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Reportes Activos (5km)
                        </span>
                        <span className="bg-red-50 border border-red-100 text-red-600 text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                          SEÑALES
                        </span>
                      </div>

                      {/* List of active alerts filtered or general */}
                      <div className="space-y-2 max-h-[190px] overflow-y-auto pr-0.5">
                        {availableAlerts.map((alert) => {
                          const isMatch = alert.category === techSpecialty;
                          return (
                            <div 
                              key={alert.id}
                              className={`p-3 rounded-lg border transition-all ${
                                isMatch 
                                  ? 'bg-red-50/50 border-red-200 shadow-xs' 
                                  : 'bg-white border-gray-100'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-1">
                                  {alert.category === 'plumbing' && <Droplet className="w-3.5 h-3.5 text-blue-500" />}
                                  {alert.category === 'electricity' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                                  {alert.category === 'locksmith' && <Key className="w-3.5 h-3.5 text-purple-500" />}
                                  {alert.category === 'gas' && <Flame className="w-3.5 h-3.5 text-red-500" />}
                                  <h4 className="font-bold text-xs text-gray-800">{alert.title}</h4>
                                </div>
                                <span className="font-mono text-xs font-bold text-emerald-600">${alert.payout}</span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">{alert.description}</p>
                              
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                <span className="text-[9px] text-gray-400 font-medium">
                                  📍 {alert.distance} • {alert.timeAgo}
                                </span>
                                <button
                                  onClick={() => acceptJob(alert)}
                                  className={`px-2 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                                    isMatch
                                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-xs shadow-red-100'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                  }`}
                                >
                                  ATENDER
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Active Service In Progress Screens */
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Job Header Info */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-red-50 border border-red-100 text-red-600 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider block w-fit mb-1 font-mono">
                              AUXILIO EN CURSO
                            </span>
                            <h3 className="text-xs font-bold text-gray-800">{activeJob.title}</h3>
                          </div>
                          <span className="font-mono text-xs font-bold text-emerald-600">${activeJob.payout} MXN</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">{activeJob.description}</p>
                        
                        <div className="mt-2 pt-2 border-t border-gray-150 flex items-center justify-between text-[9px] text-gray-400">
                          <span>📍 {activeJob.distance}</span>
                          <span className="bg-white border border-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {activeJob.category.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Progress State indicators */}
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 flex items-center justify-between">
                        <button
                          onClick={() => setJobProgress('accepted')}
                          className={`flex-1 py-1 rounded-md text-[9px] font-bold text-center border transition-all cursor-pointer ${
                            jobProgress === 'accepted'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                              : 'bg-transparent border-transparent text-gray-400'
                          }`}
                        >
                          En camino
                        </button>
                        <div className="w-3 h-px bg-gray-200"></div>
                        <button
                          onClick={() => setJobProgress('arrived')}
                          className={`flex-1 py-1 rounded-md text-[9px] font-bold text-center border transition-all cursor-pointer ${
                            jobProgress === 'arrived'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                              : 'bg-transparent border-transparent text-gray-400'
                          }`}
                        >
                          Llegué al sitio
                        </button>
                      </div>

                      {/* Interactive Simulated Client Chat */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 h-36 flex flex-col justify-between">
                        <span className="text-[8px] font-bold text-gray-400 uppercase mb-1 block border-b border-gray-150 pb-1 text-center">
                          Contacto Directo con Solicitante
                        </span>
                        
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 text-xs">
                          {technicianChat.map((msg, idx) => (
                            <div 
                              key={idx} 
                              className={`flex ${msg.sender === 'tech' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[10px] leading-tight ${
                                  msg.sender === 'tech'
                                    ? 'bg-emerald-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-150 text-gray-700 rounded-tl-none'
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Message Input bar */}
                        <div className="flex gap-1.5 border-t border-gray-150 pt-2 mt-1.5">
                          <input 
                            type="text" 
                            placeholder="Mensaje..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                            className="flex-1 bg-white border border-gray-200 rounded-md px-2 py-1 text-[10px] text-gray-700 focus:outline-none"
                          />
                          <button
                            onClick={sendChatMessage}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action button to Complete Work */}
                    <div className="mt-3 space-y-1.5">
                      <button
                        onClick={finishJob}
                        className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-extrabold rounded-xl py-3 text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        COMPLETAR Y COBRAR (${activeJob.payout})
                      </button>
                      <button
                        onClick={() => setActiveJob(null)}
                        className="w-full bg-white hover:bg-gray-50 text-gray-400 border border-gray-200 rounded-lg py-1.5 text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Cancelar Servicio
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. MAP OF THE CITY SCREEN */}
            {view === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col"
              >
                {/* Header block with search filter */}
                <div className="p-4 bg-white border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2.5">
                    <button 
                      id="btn-back-map"
                      onClick={() => setView('home')} 
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-600 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="font-extrabold text-sm tracking-wide uppercase text-blue-600">
                        ZONAS DE DEMANDA
                      </h2>
                      <p className="text-[10px] text-gray-400">Distribución de alertas técnicas</p>
                    </div>
                  </div>

                  {/* Filter chips */}
                  <div className="flex gap-1 overflow-x-auto pb-0.5">
                    <button
                      onClick={() => { setMapFilter('all'); setSelectedMapPin(null); }}
                      className={`px-2 py-0.5 rounded-full text-[8px] font-bold whitespace-nowrap border transition-all uppercase cursor-pointer ${
                        mapFilter === 'all'
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'bg-gray-50 border-gray-150 text-gray-500'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => { setMapFilter('alerts'); setSelectedMapPin(null); }}
                      className={`px-2 py-0.5 rounded-full text-[8px] font-bold whitespace-nowrap border transition-all uppercase cursor-pointer ${
                        mapFilter === 'alerts'
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'bg-gray-50 border-gray-150 text-gray-500'
                      }`}
                    >
                      Alertas
                    </button>
                    <button
                      onClick={() => { setMapFilter('techs'); setSelectedMapPin(null); }}
                      className={`px-2 py-0.5 rounded-full text-[8px] font-bold whitespace-nowrap border transition-all uppercase cursor-pointer ${
                        mapFilter === 'techs'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-gray-50 border-gray-150 text-gray-500'
                      }`}
                    >
                      Técnicos
                    </button>
                    <button
                      onClick={() => { setMapFilter('hot'); setSelectedMapPin(null); }}
                      className={`px-2 py-0.5 rounded-full text-[8px] font-bold whitespace-nowrap border transition-all uppercase cursor-pointer ${
                        mapFilter === 'hot'
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-gray-50 border-gray-150 text-gray-500'
                      }`}
                    >
                      🔥 Demanda
                    </button>
                  </div>
                </div>

                {/* SVG/Styled City Map Visualization */}
                <div className="flex-1 bg-slate-50 relative overflow-hidden flex items-center justify-center p-2 min-h-[300px] border-b border-gray-100">
                  {/* Grid Lines styling */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>

                  {/* Decorative stylized vector layout (roads and rivers) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="40" x2="100" y2="40" stroke="#cbd5e1" strokeWidth="2.5" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="2.5" />
                    <line x1="0" y1="15" x2="100" y2="85" stroke="#cbd5e1" strokeWidth="1" />
                    <path d="M 0 80 Q 30 75, 50 85 T 100 70" fill="none" stroke="#93c5fd" strokeWidth="4" />
                  </svg>

                  {/* Render Map Items */}
                  {mapMarkers
                    .filter((m) => mapFilter === 'all' || m.type === mapFilter)
                    .map((marker) => {
                      const left = `${marker.lng}%`;
                      const top = `${marker.lat}%`;

                      return (
                        <div
                          key={marker.id}
                          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                          style={{ left, top }}
                          onClick={() => setSelectedMapPin(marker)}
                        >
                          {/* Alert Beacons */}
                          {marker.type === 'alert' && (
                            <div className="relative flex items-center justify-center">
                              <span className="absolute w-7 h-7 bg-red-500/20 rounded-full animate-ping"></span>
                              <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-md">
                                {marker.cat === 'plumbing' && <Droplet className="w-2.5 h-2.5 text-white" />}
                                {marker.cat === 'electricity' && <Zap className="w-2.5 h-2.5 text-white" />}
                                {marker.cat === 'locksmith' && <Key className="w-2.5 h-2.5 text-white" />}
                              </div>
                            </div>
                          )}

                          {/* Technician Beacons */}
                          {marker.type === 'tech' && (
                            <div className="relative flex items-center justify-center">
                              <span className="absolute w-5 h-5 bg-emerald-500/10 rounded-full"></span>
                              <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center shadow-xs">
                                <User className="w-2 h-2 text-white" />
                              </div>
                            </div>
                          )}

                          {/* Heatmap High Demand Areas */}
                          {marker.type === 'hot' && (
                            <div className="relative flex items-center justify-center">
                              <div 
                                className="bg-amber-500/15 rounded-full border border-amber-300 animate-pulse flex items-center justify-center"
                                style={{ width: `${marker.radius * 1.5}px`, height: `${marker.radius * 1.5}px` }}
                              >
                                <span className="text-[7px] text-amber-700 font-bold bg-white/95 px-1 py-0.2 rounded border border-amber-200">
                                  {marker.load}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Compass/GPS status */}
                  <div className="absolute bottom-3 right-3 bg-white/90 border border-gray-150 px-2 py-1 rounded-lg text-[9px] font-bold text-gray-500 flex items-center gap-1 shadow-xs">
                    <Navigation className="w-2.5 h-2.5 text-blue-500" />
                    GPS ACTIVO
                  </div>
                </div>

                {/* Info Card Drawer for selected map elements */}
                <div className="p-4 bg-white">
                  {selectedMapPin ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 border border-gray-100 p-3 rounded-xl"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider block w-fit mb-1 ${
                            selectedMapPin.type === 'alert' ? 'bg-red-50 text-red-700 border border-red-200' :
                            selectedMapPin.type === 'tech' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {selectedMapPin.type === 'alert' && 'EMERGENCIA'}
                            {selectedMapPin.type === 'tech' && 'SOPORTE'}
                            {selectedMapPin.type === 'hot' && 'DEMANDA'}
                          </span>
                          <h3 className="text-xs font-bold text-gray-800">
                            {selectedMapPin.title || selectedMapPin.name}
                          </h3>
                        </div>
                        <button 
                          onClick={() => setSelectedMapPin(null)}
                          className="text-[10px] text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
                        >
                          Cerrar
                        </button>
                      </div>

                      <p className="text-[10px] text-gray-500 mt-1">
                        {selectedMapPin.desc || (selectedMapPin.type === 'tech' ? `${selectedMapPin.specialty} • Estatus: ${selectedMapPin.status}` : `Foco de requerimientos activos.`)}
                      </p>

                      {selectedMapPin.type === 'alert' && (
                        <button
                          onClick={() => {
                            setView('available');
                            const dummyAlert: ActiveAlert = {
                              id: selectedMapPin.id,
                              title: selectedMapPin.title,
                              description: selectedMapPin.desc,
                              distance: '1.2 km',
                              category: selectedMapPin.cat,
                              payout: selectedMapPin.severity === 'critical' ? 700 : 400,
                              timeAgo: 'Hace 1 min'
                            };
                            acceptJob(dummyAlert);
                          }}
                          className="w-full mt-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 text-[9px] font-bold tracking-wider uppercase transition-colors cursor-pointer text-center"
                        >
                          ACEPTAR ESTE AUXILIO DESDE AQUÍ
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <div className="text-center py-2 text-gray-400">
                      <p className="text-[10px]">Toca cualquier indicador del mapa para ver los detalles.</p>
                      <div className="flex justify-center gap-4 mt-2 text-[9px] font-bold">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Alertas</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Técnicos</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Demanda</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Apple Home Indicator Bar mockup */}
        <div className="w-full h-10 flex items-center justify-center pb-2 bg-white">
          <div className="w-32 h-1 bg-gray-200 rounded-full"></div>
        </div>

      </div>

      {/* Decorative environment background tag from design */}
      <div className="absolute bottom-8 right-8 text-white/20 font-mono text-xs pointer-events-none">
        FIXMATCH_SYS_INIT_v1.0.4
      </div>
    </div>
  );
}
