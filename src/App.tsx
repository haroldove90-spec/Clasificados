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
  Sparkles,
  Lock,
  MessageSquare
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
  const [incomingAlert, setIncomingAlert] = useState<ActiveAlert | null>(null);
  const [incomingTimer, setIncomingTimer] = useState(9);

  // New states for interactive client & technician flows
  const [showTechMap, setShowTechMap] = useState(true);
  const [showClientChat, setShowClientChat] = useState(false);
  const [techPosition, setTechPosition] = useState({ x: 20, y: 15 });
  const [clientChatMessages, setClientChatMessages] = useState<{sender: 'client' | 'tech', text: string}[]>([
    { sender: 'tech', text: 'Hola, buenas tardes. Soy Carlos Mendoza, su técnico asignado.' },
    { sender: 'tech', text: 'Ya tengo sus datos y voy en camino. Llego en aproximadamente 12 minutos.' }
  ]);
  const [clientChatInput, setClientChatInput] = useState('');
  
  const [otpCodeEntered, setOtpCodeEntered] = useState('');
  const [otpIsCorrect, setOtpIsCorrect] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    if (view !== 'available') {
      setIncomingAlert(null);
      setIncomingTimer(9);
      return;
    }

    let alertTimeout: NodeJS.Timeout;

    if (!incomingAlert && !activeJob) {
      alertTimeout = setTimeout(() => {
        setIncomingAlert({
          id: 'simulated-alert',
          title: 'Fuga de agua detectada a 1.8 km (Colonia Centro)',
          description: 'Se requiere asistencia inmediata para contener fuga en tubería de baño principal.',
          distance: '1.8 km',
          category: 'plumbing',
          payout: 450,
          timeAgo: 'Hace unos instantes'
        });
        setIncomingTimer(9);
      }, 3000);
    }

    return () => {
      clearTimeout(alertTimeout);
    };
  }, [view, incomingAlert, activeJob]);

  // Countdown timer when incomingAlert is active
  useEffect(() => {
    if (!incomingAlert) return;
    if (incomingTimer < 0) return;

    if (incomingTimer === 0) {
      const resetTimeout = setTimeout(() => {
        setIncomingAlert(null);
        setIncomingTimer(9);
      }, 2000);
      return () => clearTimeout(resetTimeout);
    }

    const interval = setInterval(() => {
      setIncomingTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingAlert, incomingTimer]);

  // Simulate Carlos Mendoza moving on the map towards the client
  useEffect(() => {
    if (view !== 'emergency' || emergencyStep < 2) {
      setTechPosition({ x: 20, y: 15 });
      return;
    }

    const interval = setInterval(() => {
      setTechPosition(prev => {
        const targetX = 75;
        const targetY = 70;
        const dx = targetX - prev.x;
        const dy = targetY - prev.y;

        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
          clearInterval(interval);
          return { x: targetX, y: targetY };
        }

        // Move smoothly towards target
        return {
          x: prev.x + dx * 0.05,
          y: prev.y + dy * 0.05
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [view, emergencyStep]);
  
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

  const sendClientChatMessage = () => {
    if (!clientChatInput.trim()) return;
    setClientChatMessages(prev => [...prev, { sender: 'client', text: clientChatInput }]);
    setClientChatInput('');

    // Auto response from Carlos Mendoza
    setTimeout(() => {
      setClientChatMessages(prev => [
        ...prev,
        { sender: 'tech', text: 'Excelente, acabo de pasar la Av. Principal. Ya casi llego.' }
      ]);
    }, 1500);
  };

  const finishJob = () => {
    if (!activeJob) return;
    setEarnings(prev => prev + activeJob.payout);
    setCompletedJobs(prev => prev + 1);
    setActiveJob(null);
  };

  const handleNotifyTechs = () => {
    if (isNotifying) return;
    setIsNotifying(true);
    setHasNotified(false);
    setTimeout(() => {
      setIsNotifying(false);
      setHasNotified(true);
    }, 1500);
  };

  // --- STATE FOR MAP MODE ---
  const [mapFilter, setMapFilter] = useState<'all' | 'alerts' | 'techs' | 'hot'>('all');
  const [selectedMapPin, setSelectedMapPin] = useState<any>(null);
  const [isNotifying, setIsNotifying] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased relative text-gray-800">
      {/* Top Header Panel - Always Visible */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 md:px-12 flex justify-between items-center z-40 sticky top-0 shadow-xs">
        <div className="text-xl md:text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center shrink-0">
            <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
          </div>
          <span>🌐 FIXMATCH | Plataforma de Servicios</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 font-mono">
          <span>🕒 {currentTime}</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">PANTALLA COMPLETA</span>
        </div>
      </header>

      {/* Main Content Area in Full Screen */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-12 flex flex-col">
        <AnimatePresence mode="wait">
            
            {/* 1. HOME SCREEN */}
            {view === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full py-6 font-sans"
              >
                {/* Central Question */}
                <div className="text-center mb-10">
                  <h1 id="home-headline" className="text-2xl md:text-3xl font-black text-gray-900 tracking-widest uppercase">
                    ¿QUÉ OPERACIÓN DESEAS EJECUTAR HOY?
                  </h1>
                  <p className="text-xs md:text-sm text-gray-400 mt-2 tracking-wider font-mono">
                    SELECCIONA UN MÓDULO PARA INICIAR EL FLUJO DE SIMULACIÓN EN TIEMPO REAL
                  </p>
                </div>

                <div className="space-y-6">
                  <hr className="border-t-2 border-gray-300 opacity-60" />

                  {/* BUTTON 1: BOTÓN DE EMERGENCIA */}
                  <div className="group">
                    <button
                      id="btn-urgente"
                      onClick={() => setView('emergency')}
                      className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white p-6 md:p-8 rounded-2xl shadow-xl hover:shadow-red-200 transition-all text-left flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer active:scale-[0.99] group-hover:-translate-y-0.5 duration-200"
                    >
                      <div className="flex-1">
                        <span className="inline-block bg-white text-[#EF4444] text-xs font-black px-3 py-1 rounded-md mb-3 tracking-wider uppercase font-mono">
                          🟥 BOTÓN DE EMERGENCIA
                        </span>
                        <h2 className="text-lg md:text-xl font-extrabold tracking-tight">
                          Lanzar alerta geolocalizada a 5km a la redonda para atención inmediata
                        </h2>
                        <p className="text-xs md:text-sm mt-1.5 opacity-90 font-medium">
                          Flujo de Cliente: Solicita plomería, electricidad, cerrajería o gas en tiempo real con geolocalización, chat integrado y validación de seguridad por OTP.
                        </p>
                      </div>
                      <span className="text-2xl hidden md:block select-none opacity-50 group-hover:opacity-100 transition-opacity">
                        👉
                      </span>
                    </button>
                  </div>

                  <hr className="border-t-2 border-gray-300 opacity-60" />

                  {/* BUTTON 2: ACTIVAR MODO DISPONIBLE AHORA */}
                  <div className="group">
                    <button
                      id="btn-disponible"
                      onClick={() => setView('available')}
                      className="w-full bg-[#10B981] hover:bg-[#059669] text-white p-6 md:p-8 rounded-2xl shadow-xl hover:shadow-emerald-200 transition-all text-left flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer active:scale-[0.99] group-hover:-translate-y-0.5 duration-200"
                    >
                      <div className="flex-1">
                        <span className="inline-block bg-white text-[#10B981] text-xs font-black px-3 py-1 rounded-md mb-3 tracking-wider uppercase font-mono">
                          🟩 ACTIVAR MODO DISPONIBLE AHORA
                        </span>
                        <h2 className="text-lg md:text-xl font-extrabold tracking-tight">
                          Cambiar estado a en línea para recibir solicitudes de trabajo al instante
                        </h2>
                        <p className="text-xs md:text-sm mt-1.5 opacity-90 font-medium">
                          Flujo de Técnico / Proveedor: Recibe alertas entrantes geolocalizadas, acepta servicios de emergencia, navega con mapa en tiempo real, ingresa el código OTP del cliente y finaliza el servicio.
                        </p>
                      </div>
                      <span className="text-2xl hidden md:block select-none opacity-50 group-hover:opacity-100 transition-opacity">
                        👉
                      </span>
                    </button>
                  </div>

                  <hr className="border-t-2 border-gray-300 opacity-60" />

                  {/* BUTTON 3: VER MAPA DE CALOR DE DEMANDA */}
                  <div className="group">
                    <button
                      id="btn-mapa"
                      onClick={() => setView('map')}
                      className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white p-6 md:p-8 rounded-2xl shadow-xl hover:shadow-blue-200 transition-all text-left flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer active:scale-[0.99] group-hover:-translate-y-0.5 duration-200"
                    >
                      <div className="flex-1">
                        <span className="inline-block bg-white text-[#3B82F6] text-xs font-black px-3 py-1 rounded-md mb-3 tracking-wider uppercase font-mono">
                          🟦 VER MAPA DE CALOR DE DEMANDA
                        </span>
                        <h2 className="text-lg md:text-xl font-extrabold tracking-tight">
                          Monitorear zonas críticas de la ciudad con solicitudes insatisfechas
                        </h2>
                        <p className="text-xs md:text-sm mt-1.5 opacity-90 font-medium">
                          Flujo de Administrador: Monitorea el balance de cobertura en tiempo real, localiza déficits de técnicos (Zonas Rojas) y emite notificaciones PUSH de emergencia para movilizar personal.
                        </p>
                      </div>
                      <span className="text-2xl hidden md:block select-none opacity-50 group-hover:opacity-100 transition-opacity">
                        👉
                      </span>
                    </button>
                  </div>

                  <hr className="border-t-2 border-gray-300 opacity-60" />
                </div>

                {/* Bottom Status Info */}
                <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center font-mono">
                  <p className="text-xs text-gray-600 font-bold">
                    ESTADO DE SIMULACIÓN: <span className="text-blue-600 animate-pulse">ESPERANDO SELECCIÓN...</span>
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
                  /* ULTRA-CLEAN VISUAL "TECNICO EN CAMINO" SCREEN */
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="space-y-3">
                      
                      {/* Sub-Header style banner */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[10px] font-black uppercase text-center py-1.5 px-3 rounded-lg tracking-widest animate-pulse">
                        ✨ ¡SERVICIO CONFIRMADO! ✨
                      </div>

                      {/* Assigned Tech Card */}
                      <div className="bg-white border border-gray-150 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <img 
                              src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80"
                              alt="Carlos Mendoza" 
                              className="w-11 h-11 rounded-full object-cover border border-gray-200" 
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-sm">Carlos Mendoza</p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase">Soporte Técnico de Emergencia</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="flex items-center text-[10px] text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400 mr-0.5" /> 4.9
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">(120 servicios)</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-wider block text-center">
                            EN CAMINO
                          </span>
                          <span className="text-gray-900 font-black text-xs block mt-1 leading-none">⏱️ 12 min</span>
                          <span className="text-[8px] text-gray-400 block mt-0.5 uppercase tracking-tight">Tiempo estimado</span>
                        </div>
                      </div>

                      {/* 📍 VER MAPA EN TIEMPO REAL section */}
                      <div className="border border-gray-150 rounded-2xl overflow-hidden bg-slate-50">
                        <button
                          onClick={() => setShowTechMap(!showTechMap)}
                          className="w-full bg-gray-100 hover:bg-gray-150 border-b border-gray-150 py-2.5 px-3 flex items-center justify-between transition-colors text-left"
                        >
                          <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <MapIcon className="w-3.5 h-3.5 text-blue-600" />
                            📍 VER MAPA EN TIEMPO REAL
                          </span>
                          <span className="text-[8px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                            {showTechMap ? 'Ocultar' : 'Ver'}
                          </span>
                        </button>

                        {showTechMap && (
                          <div className="h-32 relative bg-slate-100 overflow-hidden border-b border-gray-100">
                            {/* Grid styling background */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:15px_15px] opacity-60"></div>
                            
                            {/* Path vector line */}
                            <svg className="absolute inset-0 w-full h-full">
                              <path 
                                d="M 50 40 L 120 60 L 180 130 L 250 180" 
                                fill="none" 
                                stroke="#cbd5e1" 
                                strokeWidth="4" 
                                strokeDasharray="4 4"
                              />
                              <path 
                                d="M 50 40 L 120 60 L 180 130 L 250 180" 
                                fill="none" 
                                stroke="#3b82f6" 
                                strokeWidth="4" 
                                strokeLinecap="round"
                                className="opacity-80"
                              />
                            </svg>

                            {/* Client house position (Laura Martínez) */}
                            <div className="absolute bottom-[20%] right-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 font-sans">
                              <span className="absolute w-6 h-6 bg-blue-500/20 rounded-full animate-ping"></span>
                              <div className="w-4 h-4 rounded-full bg-blue-600 border border-white flex items-center justify-center shadow-xs">
                                <span className="text-[7px] text-white font-black">H</span>
                              </div>
                              <span className="text-[6px] bg-blue-800 text-white px-1 rounded mt-0.5 font-bold uppercase tracking-tight">Tu Casa</span>
                            </div>

                            {/* Moving technician icon (Carlos Mendoza) */}
                            <div 
                              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 ease-out z-20 font-sans"
                              style={{ 
                                left: `${techPosition.x}%`, 
                                top: `${techPosition.y}%` 
                              }}
                            >
                              <span className="absolute w-8 h-8 bg-emerald-500/30 rounded-full animate-ping"></span>
                              <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md">
                                <User className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-[7px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded mt-0.5 shadow-xs whitespace-nowrap">
                                🛠️ Carlos Mendoza
                              </span>
                            </div>

                            {/* GPS floating stats indicator */}
                            <div className="absolute bottom-1.5 left-1.5 bg-white/90 border border-gray-200 px-1.5 py-0.5 rounded text-[8px] text-gray-500 font-bold flex items-center gap-1 shadow-xs font-mono">
                              <Navigation className="w-2.5 h-2.5 text-blue-500 animate-spin" />
                              Velocidad: 45 km/h • GPS Activo
                            </div>
                          </div>
                        )}
                      </div>

                      {/* OTP Security Code block */}
                      <div className="bg-amber-50/70 border border-dashed border-amber-300 rounded-2xl p-3 text-center relative overflow-hidden font-sans">
                        <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest block mb-1">
                          🔐 TU CÓDIGO DE SEGURIDAD OTP
                        </span>
                        <div className="flex justify-center gap-2 mt-1.5">
                          {['5', '8', '2', '4'].map((char, index) => (
                            <span key={index} className="w-8 h-9 bg-white border border-amber-200 rounded-lg flex items-center justify-center text-lg font-black text-amber-800 shadow-xs font-mono">
                              {char}
                            </span>
                          ))}
                        </div>
                        <span className="text-[9px] text-amber-600/90 block mt-2 font-medium">
                          Díselo al técnico cuando llegue a tu casa para validar el inicio seguro del servicio.
                        </span>
                      </div>

                      {/* Mini Chat Drawer Toggle if client Chat is active */}
                      {showClientChat && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-gray-50 border border-gray-150 rounded-2xl p-3 flex flex-col justify-between space-y-2 h-44 font-sans"
                        >
                          <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider">
                              Chat Interno con Técnico
                            </span>
                            <button 
                              onClick={() => setShowClientChat(false)}
                              className="text-[8px] font-bold text-gray-400 hover:text-gray-600 uppercase"
                            >
                              Ocultar
                            </button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 text-xs">
                            {clientChatMessages.map((msg, idx) => (
                              <div 
                                key={idx} 
                                className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div 
                                  className={`max-w-[85%] rounded-lg px-2.5 py-1 text-[10px] leading-tight ${
                                    msg.sender === 'client'
                                      ? 'bg-blue-600 text-white rounded-tr-none'
                                      : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-1 border-t border-gray-250 pt-1.5">
                            <input 
                              type="text" 
                              placeholder="Escribe mensaje..."
                              value={clientChatInput}
                              onChange={(e) => setClientChatInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && sendClientChatMessage()}
                              className="flex-1 bg-white border border-gray-200 rounded-md px-2 py-1 text-[10px] text-gray-700 focus:outline-none"
                            />
                            <button
                              onClick={sendClientChatMessage}
                              className="p-1 bg-blue-600 hover:bg-blue-500 rounded-md text-white transition-colors flex items-center justify-center cursor-pointer"
                            >
                              <Send className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Interactive Suggestion question box */}
                      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-2 text-center mt-1">
                        <span className="text-[9px] text-blue-700 font-bold block leading-relaxed">
                          💡 ¿Qué pasa cuando el técnico llega a la puerta de la casa?
                        </span>
                        <span className="text-[8px] text-blue-500 block mt-0.5">
                          Prueba simulando la perspectiva de técnico ingresando el código OTP en la sección de técnico.
                        </span>
                      </div>

                    </div>

                    {/* Action buttons stack */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => setShowClientChat(!showClientChat)}
                        className={`py-3 px-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                          showClientChat 
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' 
                            : 'bg-white hover:bg-gray-50 border-emerald-500 text-emerald-600 hover:text-emerald-700'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>🟩 CHAT INTERNO</span>
                      </button>

                      <button
                        onClick={() => {
                          setEmergencyStep(1);
                          setView('home');
                        }}
                        className="py-3 px-2 bg-white hover:bg-red-50 border border-red-500 text-red-600 hover:text-red-700 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span>🟥 CANCELAR</span>
                      </button>
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
                    <span className="text-[10px] font-extrabold tracking-tight uppercase text-emerald-600">
                      🟢 EN LÍNEA Y VISIBLE EN EL MAPA
                    </span>
                  </div>
                  <button 
                    id="btn-disconnect-tech"
                    onClick={() => {
                      setActiveJob(null);
                      setView('home');
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-lg text-[9px] font-bold tracking-wide transition-colors cursor-pointer animate-pulse"
                  >
                    <Power className="w-2.5 h-2.5" />
                    SALIR
                  </button>
                </div>

                {/* Specialty Picker & Stats if not in active job */}
                {!activeJob ? (
                  <div className="flex-1 flex flex-col space-y-3 justify-between">
                    
                    {/* Worker Profile Mini Card */}
                    <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-emerald-600 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Técnico Colaborador</p>
                          <p className="text-[9px] text-gray-400 font-mono">ID: #94218-FX</p>
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
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
                        <span className="text-[8px] text-gray-400 uppercase tracking-wider block font-bold">Trabajos</span>
                        <span className="text-sm font-bold text-gray-800">{completedJobs}</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
                        <span className="text-[8px] text-gray-400 uppercase tracking-wider block font-bold">Ingresos</span>
                        <span className="text-sm font-bold text-emerald-600">${earnings} MXN</span>
                      </div>
                    </div>

                    {/* Conditional Simulation Content: Waiting vs. Incoming Alert */}
                    {!incomingAlert ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
                        {/* Searching Pulsing Radar Visual */}
                        <div className="absolute w-32 h-32 border border-emerald-100 rounded-full flex items-center justify-center">
                          <div className="w-20 h-20 border border-emerald-50 rounded-full"></div>
                        </div>
                        <div className="absolute w-24 h-24 bg-emerald-500/5 rounded-full animate-ping"></div>
                        <div className="relative z-10 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                          <Radio className="w-4.5 h-4.5 text-white animate-pulse" />
                        </div>
                        
                        <div className="mt-4 text-center z-10">
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Buscando emergencias...
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 max-w-[180px] mx-auto leading-tight">
                            Esperando señal de auxilio a menos de 5km de tu ubicación...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col justify-between py-1"
                      >
                        {/* Heading indicating incoming alert */}
                        <div className="text-center mb-2">
                          <span className="bg-red-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse border border-white inline-block">
                            🚨 AUXILIO ENTRANTE 🚨
                          </span>
                        </div>

                        {/* Tarjeta de Alerta Entrante */}
                        <div className="bg-gradient-to-tr from-red-50/40 to-white border border-red-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-100 border border-red-250 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-bold">
                            URGENTE
                          </div>
                          <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-widest block mb-1">
                            REPORTE DE PLOMERÍA
                          </span>
                          <h4 className="font-black text-xs text-gray-900 leading-tight">
                            {incomingAlert.title}
                          </h4>
                          <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">
                            {incomingAlert.description}
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-red-100 flex justify-between items-center text-[9px] text-gray-400 font-bold">
                            <span>📍 1.8 km (Colonia Centro)</span>
                            <span className="text-red-500">Arribo estimado: 6 min</span>
                          </div>
                        </div>

                        {/* Tarjeta de Ganancia Estimada */}
                        <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-bold text-emerald-600 block uppercase tracking-wider">
                              GANANCIA ESTIMADA
                            </span>
                            <span className="text-base font-black text-emerald-700 tracking-tight block mt-0.5">
                              $450 MXN aprox.
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-gray-400 block leading-tight">
                              Tarifa predictiva por IA
                            </span>
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase tracking-wide inline-block mt-1">
                              Garantizado
                            </span>
                          </div>
                        </div>

                        {/* Botón verde gigante abajo [ ACEPTAR SERVICIO ] con temporizador */}
                        <div className="mt-3">
                          <button
                            onClick={() => acceptJob(incomingAlert)}
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black rounded-xl py-3.5 text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] border border-emerald-400"
                          >
                            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                            <span>🟩 ACEPTAR SERVICIO (0:0{incomingTimer}s)</span>
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Specialty Picker as a neat bottom footer setting if waiting */}
                    {!incomingAlert && (
                      <div className="bg-gray-50 border border-gray-150 p-2 rounded-lg flex items-center justify-between text-xs text-gray-500">
                        <span className="font-semibold">Filtrar por especialidad:</span>
                        <select 
                          value={techSpecialty} 
                          onChange={(e) => setTechSpecialty(e.target.value as any)}
                          className="bg-white border border-gray-200 text-gray-700 rounded px-1.5 py-0.5 font-bold cursor-pointer"
                        >
                          <option value="electricity">Electricidad ⚡</option>
                          <option value="plumbing">Plomería 💧</option>
                          <option value="locksmith">Cerrajería 🔑</option>
                          <option value="gas">Fugas de Gas 🔥</option>
                        </select>
                      </div>
                    )}
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
                      </div>

                      {/* Progress State indicators */}
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-1.5 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setJobProgress('accepted');
                            setOtpIsCorrect(false);
                            setOtpCodeEntered('');
                            setOtpError('');
                          }}
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
                            jobProgress === 'arrived' || otpIsCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                              : 'bg-transparent border-transparent text-gray-400'
                          }`}
                        >
                          Llegué al sitio
                        </button>
                      </div>

                      {/* Conditional Flow based on progress */}
                      {jobProgress === 'accepted' && !otpIsCorrect ? (
                        <>
                          {/* Navigation GPS Map simulation */}
                          <div className="border border-gray-150 rounded-2xl overflow-hidden bg-slate-50 relative h-32">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:15px_15px] opacity-60"></div>
                            
                            {/* Decorative map line */}
                            <svg className="absolute inset-0 w-full h-full">
                              <path 
                                d="M 50 40 L 120 60 L 180 130 L 250 180" 
                                fill="none" 
                                stroke="#10b981" 
                                strokeWidth="4" 
                                strokeLinecap="round"
                              />
                            </svg>

                            <div className="absolute bottom-[20%] right-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                              <div className="w-3 h-3 rounded-full bg-blue-600 border border-white"></div>
                              <span className="text-[6px] bg-blue-800 text-white px-1 rounded mt-0.5 font-bold">CLIENTE</span>
                            </div>

                            <div className="absolute top-[30%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                              <span className="absolute w-6 h-6 bg-emerald-500/30 rounded-full animate-ping"></span>
                              <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center shadow-xs">
                                <span className="text-[8px] text-white">🛵</span>
                              </div>
                              <span className="text-[6px] bg-emerald-600 text-white font-bold px-1 rounded mt-0.5">TÚ</span>
                            </div>

                            <div className="absolute bottom-1.5 left-1.5 bg-white/90 border border-gray-200 px-1.5 py-0.5 rounded text-[8px] text-gray-500 font-bold flex items-center gap-1 shadow-xs">
                              <Navigation className="w-2.5 h-2.5 text-blue-500 animate-spin" />
                              Navegación GPS: Ruta de arribo rápido
                            </div>
                          </div>

                          {/* Interactive Simulated Client Chat */}
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 h-32 flex flex-col justify-between">
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
                                    className={`max-w-[85%] rounded-lg px-2 py-1 text-[10px] leading-tight ${
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
                            <div className="flex gap-1.5 border-t border-gray-150 pt-1.5 mt-1">
                              <input 
                                type="text" 
                                placeholder="Escribe mensaje..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                                className="flex-1 bg-white border border-gray-200 rounded-md px-2 py-1 text-[10px] text-gray-700 focus:outline-none"
                              />
                              <button
                                onClick={sendChatMessage}
                                className="p-1 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white transition-colors flex items-center justify-center cursor-pointer"
                              >
                                <Send className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Quick Step Trigger Button */}
                          <button
                            onClick={() => setJobProgress('arrived')}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <span>📍 REGISTRAR LLEGADA EN EL SITIO</span>
                          </button>
                        </>
                      ) : jobProgress === 'arrived' && !otpIsCorrect ? (
                        /* OTP SECURE VERIFICATION SCREEN */
                        <div className="bg-white border border-gray-150 rounded-2xl p-3 text-center space-y-2">
                          <div className="flex justify-center mb-1">
                            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                              <Lock className="w-5 h-5 text-amber-500 animate-pulse" />
                            </div>
                          </div>
                          
                          <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">
                            🔒 VERIFICACIÓN DE IDENTIDAD OTP
                          </span>
                          <p className="text-[10px] text-gray-500 max-w-[210px] mx-auto leading-tight">
                            Solicita el código de 4 dígitos al cliente (Laura Martínez) para validar tu llegada.
                          </p>

                          {/* OTP Code Display Slot */}
                          <div className="flex justify-center gap-3 py-2">
                            {[0, 1, 2, 3].map((idx) => {
                              const digit = otpCodeEntered[idx];
                              return (
                                <span 
                                  key={idx} 
                                  className={`w-9 h-11 border-2 rounded-xl flex items-center justify-center text-xl font-black font-mono shadow-xs transition-colors ${
                                    digit 
                                      ? 'bg-amber-50 border-amber-500 text-amber-800' 
                                      : 'bg-gray-50 border-gray-200 text-gray-300'
                                  }`}
                                >
                                  {digit || '•'}
                                </span>
                              );
                            })}
                          </div>

                          {/* Error or Hint messages */}
                          {otpError ? (
                            <p className="text-[10px] font-bold text-red-600 animate-bounce">{otpError}</p>
                          ) : (
                            <p className="text-[9px] text-gray-400">Pista: El código del cliente es <span className="font-bold text-gray-600">5824</span></p>
                          )}

                          {/* Simulated Digital Keypad */}
                          <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto pt-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <button
                                key={num}
                                onClick={() => {
                                  if (otpCodeEntered.length < 4) {
                                    setOtpCodeEntered(prev => prev + num);
                                    setOtpError('');
                                  }
                                }}
                                className="bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold py-1.5 rounded-lg text-xs cursor-pointer border border-gray-150 active:scale-95"
                              >
                                {num}
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                setOtpCodeEntered('');
                                setOtpError('');
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 rounded-lg text-[9px] uppercase cursor-pointer border border-red-150 active:scale-95"
                            >
                              BORRAR
                            </button>
                            <button
                              onClick={() => {
                                if (otpCodeEntered.length < 4) {
                                  setOtpCodeEntered(prev => prev + '0');
                                  setOtpError('');
                                }
                              }}
                              className="bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold py-1.5 rounded-lg text-xs cursor-pointer border border-gray-150 active:scale-95"
                            >
                              0
                            </button>
                            <button
                              onClick={() => {
                                if (otpCodeEntered === '5824') {
                                  setOtpIsCorrect(true);
                                  setOtpError('');
                                } else {
                                  setOtpError('❌ CÓDIGO INCORRECTO. REINTENTE.');
                                  setOtpCodeEntered('');
                                }
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 rounded-lg text-[9px] uppercase cursor-pointer border border-emerald-400 active:scale-95 shadow-xs"
                            >
                              OK
                            </button>
                          </div>

                          {/* Quick Bypass Button */}
                          <div className="pt-1.5">
                            <button
                              onClick={() => {
                                setOtpCodeEntered('5824');
                                setOtpIsCorrect(true);
                                setOtpError('');
                              }}
                              className="text-[9px] bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-3 py-1 rounded-full uppercase tracking-wide cursor-pointer transition-colors"
                            >
                              ⚡ Auto-completar Código (5824)
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ORDEN DE TRABAJO EN CURSO - WORK ORDER WITH AI CHECKLIST */
                        <div className="bg-white border border-gray-150 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <div>
                              <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                IDENTIDAD VERIFICADA
                              </span>
                              <h4 className="font-extrabold text-xs text-gray-800 mt-1">ORDEN DE TRABAJO ACTIVA</h4>
                            </div>
                            <span className="text-emerald-600 font-black text-sm">$450 MXN</span>
                          </div>

                          {/* Checklist Section */}
                          <div className="space-y-2">
                            <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider block">
                              ⚙️ PROCEDIMIENTO RECOMENDADO POR IA:
                            </span>

                            <div className="space-y-1.5">
                              {[
                                'Cerrar la llave de paso de agua principal de la sección',
                                'Drenar tubería residual excedente en el sistema',
                                'Aplicar sellado de alta resistencia o soldadura plástica',
                                'Probar presión y flujo constante sin goteo'
                              ].map((item, index) => (
                                <label 
                                  key={index} 
                                  className="flex items-start gap-2.5 p-2 bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl cursor-pointer transition-colors"
                                >
                                  <input 
                                    type="checkbox" 
                                    defaultChecked={index < 2}
                                    className="w-4 h-4 rounded text-emerald-500 border-gray-300 focus:ring-emerald-500 mt-0.5"
                                  />
                                  <span className="text-[10px] text-gray-600 font-medium leading-tight">
                                    {item}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-2.5 text-center">
                            <span className="text-[9px] text-emerald-800 font-semibold block leading-relaxed">
                              🛠️ ¡Trabajo listo para finalizar!
                            </span>
                            <span className="text-[8px] text-emerald-500 block mt-0.5">
                              Haz clic abajo para reportar la solución y sumar tus ganancias de forma instantánea.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action button to Complete Work */}
                    <div className="mt-3 space-y-1.5">
                      {otpIsCorrect ? (
                        <button
                          onClick={finishJob}
                          className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-extrabold rounded-xl py-3 text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] border border-emerald-500 animate-pulse"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          🏁 FINALIZAR Y COBRAR CORRECTAMENTE
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-100 text-gray-400 border border-gray-200 font-extrabold rounded-xl py-3 text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          ESPERANDO VALIDACIÓN OTP DEL CLIENTE
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setActiveJob(null);
                          setOtpIsCorrect(false);
                          setOtpCodeEntered('');
                        }}
                        className="w-full bg-white hover:bg-gray-50 text-gray-400 border border-gray-200 rounded-lg py-1.5 text-[9px] uppercase tracking-wider transition-all cursor-pointer text-center"
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
                className="flex-1 flex flex-col justify-between"
              >
                {/* Header block with search filter */}
                <div className="p-4 bg-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <button 
                      id="btn-back-map"
                      onClick={() => setView('home')} 
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-600 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="font-extrabold text-sm tracking-wide uppercase text-blue-600">
                        Panel de Monitoreo Global
                      </h2>
                      <p className="text-[10px] text-gray-400">Análisis de cobertura IA en tiempo real</p>
                    </div>
                  </div>
                </div>

                {/* SVG/Styled City Map Visualization */}
                <div className="flex-1 bg-slate-50 relative overflow-hidden flex items-center justify-center p-2 min-h-[200px] max-h-[250px] border-b border-gray-100">
                  {/* Grid Lines styling */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>

                  {/* Decorative stylized vector layout (roads and rivers) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="40" x2="100" y2="40" stroke="#cbd5e1" strokeWidth="2.5" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="2.5" />
                    <line x1="0" y1="15" x2="100" y2="85" stroke="#cbd5e1" strokeWidth="1" />
                    <path d="M 0 80 Q 30 75, 50 85 T 100 70" fill="none" stroke="#93c5fd" strokeWidth="4" />
                  </svg>

                  {/* Render Custom High Fidelity Sectors Visuals */}
                  {/* Sector Norte (Zona Roja) Pulsing Circle Overlay */}
                  <div className="absolute top-[22%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <span className="absolute w-16 h-16 bg-red-500/25 rounded-full animate-ping [animation-duration:2.5s]"></span>
                    <div className="relative w-8 h-8 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-lg">
                      <Zap className="w-4 h-4 text-white animate-bounce" />
                    </div>
                    <span className="mt-1 bg-red-600 text-white font-black text-[7px] px-1.5 py-0.2 rounded shadow-sm border border-red-500 whitespace-nowrap">
                      🚨 SECTOR NORTE (ZONA ROJA)
                    </span>
                  </div>

                  {/* Sector Sur (Zona Verde) Circle Overlay */}
                  <div className="absolute bottom-[25%] left-[55%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <span className="absolute w-12 h-12 bg-emerald-500/15 rounded-full animate-pulse [animation-duration:3s]"></span>
                    <div className="relative w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md">
                      <Droplet className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="mt-1 bg-emerald-500 text-white font-black text-[7px] px-1.5 py-0.2 rounded shadow-sm border border-emerald-400 whitespace-nowrap">
                      🟢 SECTOR SUR (ZONA VERDE)
                    </span>
                  </div>

                  {/* Compass/GPS status */}
                  <div className="absolute bottom-3 right-3 bg-white/90 border border-gray-150 px-2 py-1 rounded-lg text-[9px] font-bold text-gray-500 flex items-center gap-1 shadow-xs">
                    <Navigation className="w-2.5 h-2.5 text-blue-500 animate-spin" />
                    COBERTURA ACTIVA
                  </div>
                </div>

                {/* Info Card Panel with Zonas & Actions */}
                <div className="p-4 bg-white flex flex-col space-y-3">
                  
                  {/* Title of Monitoring Zones */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                      BALANCE DE TRABAJO EN LA CIUDAD
                    </span>
                    <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                      ANALÍTICO
                    </span>
                  </div>

                  {/* 🚨 ZONA ROJA (Alta Demanda / Cero Técnicos) */}
                  <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 relative overflow-hidden">
                    <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center shrink-0 border border-red-200">
                      <Zap className="w-4 h-4 text-red-600 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-red-600 block uppercase tracking-wider">
                        🚨 ZONA ROJA (ALTA DEMANDA / CERO TÉCNICOS)
                      </span>
                      <p className="text-[11px] font-bold text-gray-800 mt-0.5 leading-snug">
                        Sector Norte - 14 solicitudes de Electricista sin atender
                      </p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        Déficit crítico detectado. Los tiempos de espera superan los 45 min.
                      </p>
                    </div>
                  </div>

                  {/* 🟢 ZONA VERDE (Oferta Cubierta) */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 relative overflow-hidden">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 border border-emerald-200">
                      <Droplet className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-emerald-600 block uppercase tracking-wider">
                        🟢 ZONA VERDE (OFERTA CUBIERTA)
                      </span>
                      <p className="text-[11px] font-bold text-gray-800 mt-0.5 leading-snug">
                        Sector Sur - 8 Plomeros activos en ruta
                      </p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        Zona balanceada. Tiempo promedio de respuesta en 7.5 min.
                      </p>
                    </div>
                  </div>

                  {/* Action Push Feedback Block */}
                  {isNotifying && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl flex items-center gap-2"
                    >
                      <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold text-blue-700 leading-none">
                        DIFUNDIENDO ALERTA PUSH PRIORITARIA EN SECTOR NORTE...
                      </span>
                    </motion.div>
                  )}

                  {hasNotified && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-500 border border-emerald-600 p-2.5 rounded-xl flex items-center gap-2 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      <div>
                        <span className="text-[10px] font-black text-white block leading-none">
                          ¡ALERTA PUSH ENVIADA CON ÉXITO!
                        </span>
                        <span className="text-[8px] text-white/90 block mt-0.5">
                          12 técnicos cercanos en tránsito recibieron aviso prioritario para equilibrar.
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Botón de acción rápida: [ 📣 NOTIFICAR A TÉCNICOS CERCANOS ] */}
                  <div className="pt-1">
                    <button
                      onClick={handleNotifyTechs}
                      disabled={isNotifying}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-xl py-3.5 text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] border border-blue-500"
                    >
                      <span>📣 NOTIFICAR A TÉCNICOS CERCANOS</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Dynamic footer with real-time metadata */}
        <footer className="w-full bg-white border-t border-gray-200 py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-mono gap-2 mt-auto z-40">
          <span>🛡️ FIXMATCH v2.0.0 • CONEXIÓN TÉCNICA ACTIVA</span>
          <span className="text-[10px] text-gray-400">Desarrollado para Google AI Studio • softwareai569@gmail.com</span>
        </footer>
      </div>
    );
  }
