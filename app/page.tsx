"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Lista de dominios temporales/desechables más comunes
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
  const searchParams = useSearchParams();
  const agenteId = searchParams.get("agente"); // Obtenemos el ID del agente de la URL
  console.log(agenteId);
  const [ingresoMensual, setIngresoMensual] = useState<number>(20000);
  const [porcentajeAhorro, setPorcentajeAhorro] = useState<number>(10);
  const [ahorroMensual, setAhorroMensual] = useState<number>(2000);
  const [edadActual, setEdadActual] = useState<number>(24);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [step, setStep] = useState<"form" | "confirmacion" | "exito">("form");
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Estado de carga para el envío

  const handleIngresoChange = (val: number) => {
    setIngresoMensual(val);
    const nuevoAhorroMensual = val * (porcentajeAhorro / 100);
    setAhorroMensual(nuevoAhorroMensual);
  };

  const handlePorcentajeChange = (val: number) => {
    setPorcentajeAhorro(val);
    const nuevoAhorroMensual = ingresoMensual * (val / 100);
    setAhorroMensual(nuevoAhorroMensual);
  };

  const handleAhorroMensualChange = (val: number) => {
    setAhorroMensual(val);
    if (ingresoMensual > 0) {
      const nuevoPorcentaje = (val / ingresoMensual) * 100;
      setPorcentajeAhorro(Math.min(Math.max(Math.round(nuevoPorcentaje), 1), 50));
    }
  };

  const ingresoAnual = ingresoMensual * 12;
  const ahorroAnualRecomendado = ahorroMensual * 12;

  const topeUmasAnual = 213973.20;
  const topeDeduccionPPR = Math.min(ingresoAnual * 0.10, topeUmasAnual);
  const deduccionEfectivaPPR = Math.min(ahorroAnualRecomendado, topeDeduccionPPR);

  const baseSinPPR = ingresoAnual;
  const isrSinPPR = calcularISR(baseSinPPR);
  const baseConPPR = Math.max(0, ingresoAnual - deduccionEfectivaPPR);
  const isrConPPR = calcularISR(baseConPPR);

  const devolucionEstimada = Math.max(0, isrSinPPR - isrConPPR);
  const porcentajeDescuentoSAT = ahorroAnualRecomendado > 0 
    ? Math.round((devolucionEstimada / ahorroAnualRecomendado) * 100) 
    : 0;

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

  // ENVÍO DE DATOS A LA API ROUTE CREADA CON NODEMAILER
  const handleConfirmarEnvioFinal = async () => {
    setIsSubmitting(true);
    setErrorValidacion(null);

    try {
      console.log("entra")
      const response = await fetch("/api/send-lead", {
        
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agenteId: agenteId || null, // Se envía el UUID del agente capturado de la URL
          prospecto: {
            ...formData,
            ingresoMensual,
            ahorroMensual,
            porcentajeDescuentoSAT,
            devolucionEstimada,
          }
        }),
      });
      console.log("llega aqui")
      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || "Error al enviar la solicitud.");
      }

      // Si el correo se envió correctamente al agente, pasamos a la pantalla de éxito
      setStep("exito");
    } catch (error: any) {
      setErrorValidacion(error.message || "Ocurrió un error al procesar tu solicitud.");
      setStep("form"); // Regresamos al formulario si ocurre algún problema
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStep("form");
    setErrorValidacion(null);
    setFormData({ nombre: "", email: "", telefono: "" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-200 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      {agenteId && (
        <div className="max-w-4xl mx-auto mb-4 bg-indigo-50 border border-indigo-200 p-3 rounded-2xl text-center text-xs text-indigo-800 font-medium">
          🛡️ Estás cotizando bajo la asesoría de un agente autorizado.
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-indigo-100 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-10">
          
          <div className="text-center mb-10">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Estrategia de retiro acelerado
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Calculadora de Ahorro 
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Determina tu aportación ideal y solicita tu proyección patrimonial personalizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                Tus Datos Financieros
              </h2>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Ingreso bruto mensual ($ MXN)</label>
                <input 
                  type="number" 
                  value={ingresoMensual} 
                  onChange={(e) => handleIngresoChange(Number(e.target.value))}
                  className="w-full mt-2 p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition"
                />
                <p className="text-xs text-indigo-600 font-medium mt-1">Ingreso Anual: {formatCurrency(ingresoAnual)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Ahorro mensual ($ MXN)</label>
                <input 
                  type="number" 
                  value={ahorroMensual}
                  onChange={(e) => handleAhorroMensualChange(Number(e.target.value))}
                  className="w-full mt-2 p-3 bg-white border-2 border-indigo-400 rounded-xl text-indigo-700 font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>% Ahorro equivalente:</span>
                  <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-md text-xs font-bold">{porcentajeAhorro}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="40" 
                  step="1"
                  value={porcentajeAhorro} 
                  onChange={(e) => handlePorcentajeChange(Number(e.target.value))}
                  className="w-full mt-3 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Edad Actual</label>
                <input 
                  type="number" 
                  value={edadActual} 
                  onChange={(e) => setEdadActual(Number(e.target.value))}
                  className="w-full mt-2 p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition"
                />
              </div>
            </div>

            <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-between shadow-xl border border-indigo-900">
              <div>
                <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider">Resumen de Tu Plan</span>
                <h3 className="text-2xl font-bold text-white mt-1">Tu Plan de Ahorro Ideal</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Basado en tu edad de {edadActual} años con meta de retiro a los 65.
                </p>
              </div>

              <div className="space-y-3 my-6 border-t border-b border-indigo-800/80 py-5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Ahorro mensual directo:</span>
                  <span className="font-bold text-emerald-400 text-base">{formatCurrency(ahorroMensual)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Ahorro anual proyectado:</span>
                  <span className="font-semibold text-indigo-200">{formatCurrency(ahorroAnualRecomendado)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-indigo-900/60">
                  <span className="text-slate-300">% Descuento del SAT:</span>
                  <span className="font-bold text-emerald-400 text-base">{porcentajeDescuentoSAT}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-400 text-center">
                  Solicita tu análisis para conocer el monto exacto que el SAT te devolverá y cómo reinvertirlo para potenciar tu retiro.
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/20 text-center"
                >
                  Solicitar Proyección Oficial
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-slate-100 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
            >
              ✕
            </button>

            {step === "form" && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-extrabold text-slate-900">Recibe tu Proyección</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Ingresa tus datos y un asesor se pondrá en contacto contigo.
                  </p>
                </div>

                {errorValidacion && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                    ⚠️ {errorValidacion}
                  </div>
                )}

                <form onSubmit={handleIrAConfirmacion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Juan Pérez"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase">Correo Electrónico</label>
                    <input 
                      type="email" 
                      required
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase">WhatsApp / Teléfono</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="10 dígitos (ej. 6641234567)"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md text-sm"
                  >
                    Continuar
                  </button>
                </form>
              </>
            )}

            {step === "confirmacion" && (
              <div className="space-y-5">
                <div className="text-center">
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Verificación importante
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-3">¿Tus datos son correctos?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    El asesor de seguros utilizará esta información para ponerse en contacto contigo.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">Nombre:</span>
                    <span className="font-bold text-slate-900">{formData.nombre}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">Correo Electrónico:</span>
                    <span className="font-bold text-indigo-600">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">WhatsApp / Teléfono:</span>
                    <span className="font-bold text-emerald-600">{formData.telefono}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setStep("form")}
                    disabled={isSubmitting}
                    className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-3 rounded-xl transition text-xs"
                  >
                    ← Corregir datos
                  </button>
                  <button 
                    onClick={handleConfirmarEnvioFinal}
                    disabled={isSubmitting}
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-3 rounded-xl transition shadow-md text-xs disabled:opacity-50"
                  >
                    {isSubmitting ? "Enviando..." : "Sí, son correctos ✓"}
                  </button>
                </div>
              </div>
            )}

            {step === "exito" && (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900">¡Solicitud Enviada!</h3>
                <p className="text-xs text-slate-500">
                  Gracias {formData.nombre}. Un asesor se pondrá en contacto contigo en breve para entregarte tu estudio fiscal y plan de retiro personalizado.
                </p>
                <button 
                  onClick={closeModal}
                  className="bg-slate-900 text-white font-semibold text-xs py-2.5 px-6 rounded-xl hover:bg-slate-800 transition"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

import { Suspense } from "react";
export default function CalculadoraPPR() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando calculadora...</div>}>
      <CalculadoraPPRContent />
    </Suspense>
  );
}