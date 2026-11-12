"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { supabase } from "@/lib/supabase/client";

// Lista de dominios temporales/desechables comunes
const DOMINIOS_DESECHABLES = [
  "yopmail.com", "mailinator.com", "guerrillamail.com", 
  "10minutemail.com", "tempmail.com", "trashmail.com",
  "getnada.com", "dispostable.com"
];

// Tabla de ISR Art. 152 LISR
const TABLA_ISR = [
  { limiteInferior: 0.01, limiteSuperior: 8952.49, cuotaFija: 0, porcentaje: 0.0192 },
  { limiteInferior: 8952.50, limiteSuperior: 75984.55, cuotaFija: 172, porcentaje: 0.0640 },
  { limiteInferior: 75984.56, limiteSuperior: 133536.07, cuotaFija: 4462, porcentaje: 0.1088 },
  { limiteInferior: 133536.08, limiteSuperior: 155229.80, cuotaFija: 10724, porcentaje: 0.1600 },
  { limiteInferior: 155229.81, limiteSuperior: 185852.57, cuotaFija: 14195, porcentaje: 0.1792 },
  { limiteInferior: 185852.58, limiteSuperior: 374837.88, cuotaFija: 19682, porcentaje: 0.2352 },
  { limiteInferior: 374837.89, limiteSuperior: 590795.99, cuotaFija: 64129, porcentaje: 0.3000 },
  { limiteInferior: 590796.00, limiteSuperior: 1127926.84, cuotaFija: 128917, porcentaje: 0.3200 },
  { limiteInferior: 1127926.85, limiteSuperior: 1503902.46, cuotaFija: 300798, porcentaje: 0.3400 },
  { limiteInferior: 1503902.47, limiteSuperior: 999999999.00, cuotaFija: 428630, porcentaje: 0.3500 },
];
// Función para leer una cookie por su nombre en el cliente
function obtenerCookie(nombre: string) {
  const valor = `; ${document.cookie}`;
  const partes = valor.split(`; ${nombre}=`);
  if (partes.length === 2) return partes.pop()?.split(';').shift();
}

function calcularISR(baseGravable: number): number {
  if (baseGravable <= 0) return 0;
  
  const tramo = TABLA_ISR.find(
    (t) => baseGravable >= t.limiteInferior && baseGravable <= t.limiteSuperior
  );

  if (!tramo) return 0;

  const excedente = baseGravable - tramo.limiteInferior;
  const impuestoExcedente = excedente * tramo.porcentaje;
  return tramo.cuotaFija + impuestoExcedente;
}

function CalculadoraPPRContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agenteUrlId = searchParams.get("agente"); // Detecta si un cliente entró por enlace de agente

  // Estado para la barra del agente logueado
  const [agenteLogueado, setAgenteLogueado] = useState<any>(null);
  const [enlaceCompartible, setEnlaceCompartible] = useState("");
  const [copiado, setCopiado] = useState(false);

  // Validar si hay un agente con sesión activa en este momento en el navegador
  // Validar si hay un agente con sesión activa en este momento en el navegador
  useEffect(() => {
    const verificarSesionAgente = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // Si ocurre un error o no hay un usuario autenticado, lo mandamos al login de inmediato
      if (error || !user) {
        router.push("/login");
        return;
      }
      // Obtenemos el ID de sesión más reciente que está guardado en Supabase
      const sessionEnServidor = user.user_metadata?.current_session_id;
      
      //Obtenemos el ID que tiene la cookie de este navegador
      const sessionEnCookie = obtenerCookie("my_session_id");
      // SI NO COINCIDEN, significa que se inició sesión en otro dispositivo
      if (sessionEnServidor && sessionEnCookie && sessionEnServidor !== sessionEnCookie) {
        
        
        // Borramos la cookie expirándola de inmediato
        document.cookie = "my_session_id=; path=/; max-age=0;";
        
        alert("Tu sesión ha sido cerrada porque se inició sesión en otro dispositivo.");
        router.push("/login");
        return;
      }
      // Si sí está logueado, guardamos sus datos y armamos su enlace único
      setAgenteLogueado(user);
      const urlCompartir = `${window.location.origin}/calculadoraAgente?agente=${user.id}`;
      setEnlaceCompartible(urlCompartir);
    };

    verificarSesionAgente();
    // 🌟 3. Opcional: Volver a verificar automáticamente cuando el usuario regresa a la pestaña
    const handleFocus = () => {
      verificarSesionAgente();
    };

    window.addEventListener("focus", handleFocus);
    
    // Limpiar el listener al desmontar el componente
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  const copiarEnlace = () => {
    navigator.clipboard.writeText(enlaceCompartible);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  // Entradas principales
  const [ingresoMensual, setIngresoMensual] = useState<number>(30000); 
  const [otrasDeducciones, setOtrasDeducciones] = useState<number>(0);
  const [porcentajeAhorro, setPorcentajeAhorro] = useState<number>(10);
  const [aportacionMensual, setAhorroMensual] = useState<number>(3000);
  const [edadActual, setEdadActual] = useState<number>(24);
  const [tasaRendimiento, setTasaRendimiento] = useState<number>(8); 
  
  const [fondoProyectadoPPR, setFondoProyectadoPPR] = useState<number>(3303669);
  const [aportacionTotal, setAportacionTotal] = useState<number>(391911);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [step, setStep] = useState<"form" | "confirmacion" | "exito">("form");
  const [formData, setFormData] = useState({ nombre: "", email: "", telefono: "" });
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const handleIngresoChange = (val: number) => {
    setIngresoMensual(val);
    const nuevaAportacionMensual = val * (porcentajeAhorro / 100);
    setAhorroMensual(nuevaAportacionMensual);
  };

  const handlePorcentajeChange = (val: number) => {
    setPorcentajeAhorro(val);
    const nuevaAportacionMensual = ingresoMensual * (val / 100);
    setAhorroMensual(nuevaAportacionMensual);
  };

  const handleQuincenalChange = (val: number) => {
    setAhorroMensual(val);
    const aportacionMensualEquivalente = val * 2;
    if (ingresoMensual > 0) {
      const nuevoPorcentaje = (aportacionMensualEquivalente / ingresoMensual) * 100;
      setPorcentajeAhorro(Math.min(Math.max(Math.round(nuevoPorcentaje), 1), 50));
    }
  };

  const ingresoBrutoAnual = ingresoMensual * 12;
  const aportacionAnualPPR = aportacionMensual * 12;
  const anosRestantes = Math.max(1, 65 - edadActual);

  const tope10Porciento = ingresoBrutoAnual * 0.10;
  const topeUmasAnual = 213973.20; 
  const limiteDeduciblePermitido = Math.min(tope10Porciento, topeUmasAnual);
  const aportacionDeducibleReal = Math.min(aportacionAnualPPR, limiteDeduciblePermitido);
  const excedenteNoDeducible = Math.max(0, aportacionAnualPPR - limiteDeduciblePermitido);

  const baseSinPPR = ingresoBrutoAnual - otrasDeducciones;
  const isrSinPPR = calcularISR(Math.max(0, baseSinPPR));

  const baseConPPR = ingresoBrutoAnual - otrasDeducciones - aportacionDeducibleReal;
  const isrConPPR = calcularISR(Math.max(0, baseConPPR));

  const devolucionEstimada = Math.max(0, isrSinPPR - isrConPPR);
  const costoRealNetoPPR = aportacionAnualPPR - devolucionEstimada;
  const porcentajeDescuentoSAT = aportacionAnualPPR > 0 
    ? Math.round((devolucionEstimada / aportacionAnualPPR) * 100) 
    : 0;

  const contribucionSatMensual = devolucionEstimada / 12;
  const aportacionRealAnual = aportacionAnualPPR  - devolucionEstimada;

  const r = tasaRendimiento / 100;
  const calcularFondoProyectado = (pmt: number, anos: number, tasa: number) => {
    if (tasa === 0) return pmt * anos;
    return pmt * ((Math.pow(1 + tasa, anos) - 1) / tasa);
  };

  const fondoGeneradoReinversion = calcularFondoProyectado(devolucionEstimada, anosRestantes, r);
  const totalPatrimonioRetiro = Number(fondoProyectadoPPR) + fondoGeneradoReinversion;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount);
  };

  const esEmailValido = (email: string): boolean => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) return false;
    const dominio = email.split("@")[1]?.toLowerCase();
    if (DOMINIOS_DESECHABLES.includes(dominio)) return false;
    return true;
  };

  const esTelefonoValido = (telefono: string): boolean => {
    const phoneNumber = parsePhoneNumberFromString(telefono, "MX");
    return phoneNumber ? phoneNumber.isValid() : false;
  };

  const handleIrAConfirmacion = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    if (!esEmailValido(formData.email)) {
      setErrorValidacion("Ingresa un correo electrónico válido (no se admiten correos temporales).");
      return;
    }

    if (!esTelefonoValido(formData.telefono)) {
      setErrorValidacion("Ingresa un número celular válido de México a 10 dígitos (ej. 6641234567).");
      return;
    }

    setStep("confirmacion");
  };

  const handleConfirmarEnvioFinal = () => {
    const params = new URLSearchParams({
      nombre: formData.nombre || "Cliente",
      correo:formData.email || "Correo",
      ingresoMensual: ingresoMensual.toString(),
      ingresoAnual: ingresoBrutoAnual.toString(),
      aportacionAnual: aportacionAnualPPR.toString(),
      aportacionMensual: aportacionMensual.toString(),
      devolucion: devolucionEstimada.toString(),
      costoNeto: costoRealNetoPPR.toString(),
      aportacionRealAnual: aportacionRealAnual.toString(),
      porcentajeSat: porcentajeDescuentoSAT.toString(),
      fondoPpr: fondoProyectadoPPR.toString(),
      fondoReinversion: fondoGeneradoReinversion.toString(),
      totalPatrimonio: totalPatrimonioRetiro.toString(),
      totalContribuido: (costoRealNetoPPR * anosRestantes).toString(),
      anosRestantes: anosRestantes.toString(),
      tasaRendimiento: tasaRendimiento.toString(),
      aportacionTotal: aportacionTotal.toString(),
    });

    // Si hay un agente asociado por la URL, lo propagamos al reporte también si es necesario
    if (agenteUrlId) {
      params.append("agente", agenteUrlId);
    }

    router.push(`/reporte?${params.toString()}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStep("form");
    setErrorValidacion(null);
    setFormData({ nombre: "", email: "", telefono: "" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* BARRA DE HERRAMIENTAS PARA EL AGENTE LOGUEADO */}
        {agenteLogueado && (
          <div className="bg-indigo-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-700">
            <div>
              <span className="bg-indigo-800 text-indigo-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Sesión de Agente Activa
              </span>
              <h2 className="text-sm font-bold mt-2">Hola, {agenteLogueado.user_metadata?.nombre || agenteLogueado.email}</h2>
              <p className="text-xs text-indigo-200">Comparte este enlace para recibir solicitudes de cotización canalizadas a tu registro de agente.</p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="text" 
                readOnly 
                value={enlaceCompartible}
                className="bg-indigo-950 border border-indigo-700 text-indigo-200 text-xs px-3 py-2.5 rounded-xl outline-none w-full sm:w-72"
              />
              <button 
                onClick={copiarEnlace}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-md shrink-0"
              >
                {copiado ? "¡Copiado! ✓" : "Copiar Enlace"}
              </button>
            </div>
          </div>
        )}

        {/* Encabezado */}
        <div className="text-center mb-8">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-200">
            Estrategia de Retiro Acelerado
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Calculadora de Beneficio Fiscal Art. 151 LISR
          </h1>
          <p className="text-slate-600 mt-2 text-sm">
            Proyección detallada de deducción de impuestos, ahorro inteligente y efecto palanca al retiro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: Entradas del Cliente */}
          <div className="lg:col-span-5 space-y-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                Datos del Cliente
              </h2>
            </div>

            <div className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Ingreso Bruto Mensual ($ MXN)</label>
                <input 
                  type="number" 
                  value={ingresoMensual} 
                  onChange={(e) => handleIngresoChange(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Otras Deducciones Personales ($)</label>
                <input 
                  type="number" 
                  value={otrasDeducciones} 
                  onChange={(e) => setOtrasDeducciones(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Ahorro mensual ($ MXN)</label>
                <input 
                  type="number" 
                  value={aportacionMensual} 
                  onChange={(e) => handleQuincenalChange(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-white border-2 border-indigo-400 rounded-xl text-indigo-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 uppercase">
                  <span>% Ahorro equivalente:</span>
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-bold">{porcentajeAhorro}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="40" 
                  step="1"
                  value={porcentajeAhorro} 
                  onChange={(e) => handlePorcentajeChange(Number(e.target.value))}
                  className="w-full mt-1.5 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Edad Actual</label>
                  <input 
                    type="number" 
                    value={edadActual} 
                    onChange={(e) => setEdadActual(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Años Retiro</label>
                  <input 
                    type="text" 
                    disabled 
                    value={`${anosRestantes} años`}
                    className="w-full mt-1 p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-indigo-700 font-bold text-sm text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Tasa de Rendimiento Anual Est. (%)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={tasaRendimiento} 
                  onChange={(e) => setTasaRendimiento(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-700 uppercase">
                  Fondo Proyectado PPR  ($)
                </label>
                <input 
                  type="number" 
                  value={fondoProyectadoPPR} 
                  onChange={(e) => setFondoProyectadoPPR(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-indigo-50/50 border-2 border-indigo-300 rounded-xl text-indigo-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-700 uppercase">
                  Aportación Total ($)
                </label>
                <input 
                  type="number" 
                  value={aportacionTotal} 
                  onChange={(e) => setAportacionTotal(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 bg-indigo-50/50 border-2 border-indigo-300 rounded-xl text-indigo-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition"
                />
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Resultados */}
          <div className="lg:col-span-7 space-y-6">

            <div className="bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-md">
              <div className="bg-indigo-900 px-5 py-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Desglose Anual del Plan
                </h3>
              </div>
              <div className="p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Aportación Anual al PPR:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(aportacionAnualPPR)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Contribución SAT anual:</span>
                  <span className="font-bold text-emerald-600">+{formatCurrency(devolucionEstimada)}</span>
                </div>
                <div className="flex justify-between py-2 bg-indigo-50/80 px-3 rounded-xl border border-indigo-100 mt-1">
                  <span className="font-extrabold text-indigo-900">Aportación Real Neta Anual:</span>
                  <span className="font-extrabold text-indigo-700 text-base">{formatCurrency(aportacionRealAnual)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
              <div className="bg-slate-800 px-5 py-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Validación de Topes Fiscales (Art. 151 LISR)
                </h3>
              </div>
              <div className="p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Tope 10% del Ingreso:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(tope10Porciento)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Tope 5 UMAs Anuales ($213,973.20):</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(topeUmasAnual)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Límite Deducible Permitido:</span>
                  <span className="font-semibold text-indigo-700">{formatCurrency(limiteDeduciblePermitido)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 bg-amber-50/70 px-2.5 rounded-lg">
                  <span className="font-bold text-amber-900">Aportación Deducible Real:</span>
                  <span className="font-bold text-amber-900">{formatCurrency(aportacionDeducibleReal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Excedente No Deducible:</span>
                  <span className="font-semibold text-slate-500">{formatCurrency(excedenteNoDeducible)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
              <div className="bg-slate-800 px-5 py-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Impacto Fiscal y Devolución Estimada
                </h3>
              </div>
              <div className="p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Base Gravable Sin PPR:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(baseSinPPR)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">ISR Causado Sin PPR:</span>
                  <span className="font-semibold text-rose-600">{formatCurrency(isrSinPPR)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Base Gravable Con PPR:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(baseConPPR)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">ISR Causado Con PPR:</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(isrConPPR)}</span>
                </div>
                <div className="flex justify-between py-2.5 bg-emerald-600 text-white px-3.5 rounded-xl shadow-sm">
                  <span className="font-extrabold uppercase text-xs sm:text-sm">Devolución Estimada (Saldo a Favor):</span>
                  <span className="font-extrabold text-base">{formatCurrency(devolucionEstimada)}</span>
                </div>
                <div className="flex justify-between py-1 pt-2">
                  <span className="text-slate-600">Costo Real Neto del PPR (Anual):</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(costoRealNetoPPR)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Porcentaje de Descuento del SAT:</span>
                  <span className="font-bold text-indigo-700">{porcentajeDescuentoSAT}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-lg p-5 space-y-4">
              <div className="bg-slate-800 -mx-5 -mt-5 p-4 mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Efecto Palanca / Reinversión al Retiro (A los 65 años)
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm pt-1">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Fondo proyectado por la aportación al PPR:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(Number(fondoProyectadoPPR))}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Fondo generado reinvirtiendo devolución:</span>
                  <span className="font-bold text-indigo-700">{formatCurrency(fondoGeneradoReinversion)}</span>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-md">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide block text-indigo-300">Total Patrimonio al Retiro</span>
                  <span className="text-xs text-slate-400">Con tasa estimada del {tasaRendimiento}% anual</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">{formatCurrency(totalPatrimonioRetiro)}</span>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-4 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/20 text-center text-sm"
              >
                Generar Proyección
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* MODAL DE CAPTURA DE DATOS PARA EL REPORTE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            
            {step === "form" && (
              <>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-extrabold text-slate-900">Datos para tu Reporte</h3>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                </div>
                <p className="text-xs text-slate-600">
                  Ingresa tus datos de contacto para generar y desbloquear tu reporte patrimonial personalizado.
                </p>

                <form onSubmit={handleIrAConfirmacion} className="space-y-3.5 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      value={formData.nombre} 
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej. Carlos Mendoza" 
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase">Correo Electrónico</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="correo@ejemplo.com" 
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase">Teléfono Celular (10 dígitos)</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.telefono} 
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="6641234567" 
                      className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {errorValidacion && (
                    <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      {errorValidacion}
                    </p>
                  )}

                  <div className="pt-2 flex space-x-3">
                    <button 
                      type="button" 
                      onClick={closeModal}
                      className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-xs"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-md shadow-indigo-500/20"
                    >
                      Continuar
                    </button>
                  </div>
                </form>
              </>
            )}

            {step === "confirmacion" && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h3 className="text-lg font-extrabold text-slate-900">¡Todo listo, {formData.nombre}!</h3>
                <p className="text-xs text-slate-600">
                  Tus datos han sido validados correctamente. Haz clic en el botón de abajo para visualizar tu reporte oficial detallado.
                </p>
                <div className="pt-3 flex space-x-3">
                  <button 
                    onClick={() => setStep("form")}
                    className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-xs"
                  >
                    Atrás
                  </button>
                  <button 
                    onClick={handleConfirmarEnvioFinal}
                    className="w-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-md shadow-emerald-500/20"
                  >
                    Ver mi Reporte
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
      
    </main>
  );
}

// Envolvemos en Suspense por el uso de useSearchParams en Next.js App Router
import { Suspense } from "react";
export default function CalculadoraPPR() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando calculadora...</div>}>
      <CalculadoraPPRContent />
    </Suspense>
  );
}