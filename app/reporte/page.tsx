"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
const obtenerCookie = (nombre: string) => {
    const valor = `; ${document.cookie}`;
    const partes = valor.split(`; ${nombre}=`);
    if (partes.length === 2) return partes.pop()?.split(';').shift();
  };
function ReporteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados para almacenar la información del usuario y control de envío por correo
  const [usuarioSupabase, setUsuarioSupabase] = useState<any>(null);
  const [fechaActual, setFechaActual] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [mensajeEnvio, setMensajeEnvio] = useState<string | null>(null);

  // 🛡️ Validación de sesión activa al cargar la página del reporte
  useEffect(() => {
    const verificarSesionReporte = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // Si no hay sesión activa o hay error, redirigimos al login inmediatamente
      if (error || !user) {
        router.push("/login");
        return;
      }

      // Validamos el control de sesión única
      const sessionEnServidor = user.user_metadata?.current_session_id;
      const sessionEnCookie = obtenerCookie("my_session_id");

      if (sessionEnServidor && sessionEnCookie && sessionEnServidor !== sessionEnCookie) {
        document.cookie = "my_session_id=; path=/; max-age=0;";
        
        alert("Tu sesión ha sido cerrada porque se inició sesión en otro dispositivo.");
        router.push("/login");
        return;
      }
      
      setUsuarioSupabase(user);
    };

    verificarSesionReporte();

    // Definir la fecha formateada solo en el cliente al montar
    
    setFechaActual(new Date().toLocaleDateString());
    const handleFocus = () => {
      verificarSesionReporte();
    };

    window.addEventListener("focus", handleFocus);
    
    // Limpiar el listener al desmontar el componente
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  // Recogemos los datos prioritariamente de la URL
  const nombre = searchParams.get("nombre") || usuarioSupabase?.user_metadata?.nombre || "Cliente";
  const correo = searchParams.get("correo") || "";
  const ingresoMensual = Number(searchParams.get("ingresoMensual") || 3000);
  const ingresoAnual = Number(searchParams.get("ingresoAnual") || 36000);
  const aportacionAnual = Number(searchParams.get("aportacionAnual") || 36000);
  const aportacionMensual = Number(searchParams.get("aportacionMensual") || 3000);
  const devolucion = Number(searchParams.get("devolucion") || 8467);
  const costoNeto = Number(searchParams.get("costoNeto") || 27533);
  const aportacionRealMensual = aportacionMensual - (devolucion / 12);
  const porcentajeSat = Number(searchParams.get("porcentajeSat") || 24);
  const fondoPpr = Number(searchParams.get("fondoPpr") || 3303669);
  const aportacionPpr = Number(searchParams.get("aportacionTotal") || 391911);
  const fondoReinversion = Number(searchParams.get("fondoReinversion") || 2377429);
  const totalPatrimonio = Number(searchParams.get("totalPatrimonio") || 5681098);
  const totalContribuido = Number(searchParams.get("totalContribuido") || 1101320);
  const anosRestantes = Number(searchParams.get("anosRestantes") || 41);
  const tasaRendimiento = Number(searchParams.get("tasaRendimiento") || 8);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount);
  };

  useEffect(() => {
    document.title = `Proyeccion ${nombre}`;
  }, [nombre]);

  const handlePrint = () => {
    document.title = `Proyeccion ${nombre}`;
    window.print();
  };

  // Función para enviar el reporte actual por correo al cliente usando tu API route
  const handleEnviarCorreo = async () => {
    if (!correo || correo === "Correo") {
      alert("No se encontró un correo electrónico válido para este cliente en la URL.");
      return;
    }

    try {
      setIsSending(true);
      setMensajeEnvio(null);

      const response = await fetch("/api/enviarReporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospecto: {
            nombre,
            email: correo,
            telefono: searchParams.get("telefono") || "No proporcionado",
            ingresoMensual,
            ingresoAnual,
            aportacionAnual,
            aportacionMensual,
            devolucion,
            costoNeto,
            aportacionRealMensual,
            porcentajeSat,
            fondoPpr,
            aportacionPpr,
            fondoReinversion,
            totalPatrimonio,
            totalContribuido,
            anosRestantes,
            tasaRendimiento,
            agenteNombre: usuarioSupabase?.user_metadata?.nombre || "Asesor Profesional",
            agenteTelefono: usuarioSupabase?.user_metadata?.telefono || "Disponible vía WhatsApp",
            agenteCnsf: usuarioSupabase?.user_metadata?.cnsf || "Pendiente",
          }
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || "Error al enviar el correo.");
      }

      setMensajeEnvio("¡Reporte completo enviado con éxito al correo del cliente!");
      setTimeout(() => setMensajeEnvio(null), 5000);
    } catch (error: any) {
      alert(`Error al enviar: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-800 p-4 sm:p-6 font-sans">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        @media print {
          html, body {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-4 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm print-avoid-break">
        
        {/* Botones de acción superior (No se imprimen) */}
        <div className="flex flex-wrap justify-between items-center gap-2 no-print border-b pb-3">
          <button 
            onClick={() => window.history.back()}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 py-2 px-4 rounded-xl transition"
          >
            ← Volver
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleEnviarCorreo}
              disabled={isSending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition disabled:opacity-50"
            >
              {isSending ? "Enviando..." : "✉️ Enviar por correo"}
            </button>

            <button 
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow transition"
            >
              🖨️ PDF
            </button>
          </div>
        </div>

        {/* Mensaje de éxito de envío */}
        {mensajeEnvio && (
          <div className="no-print bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl text-center font-semibold">
            {mensajeEnvio}
          </div>
        )}

        {/* Membrete / Encabezado */}
        <div className="text-center border-b pb-3">
          <div className="py-2.5 px-4 rounded-xl mt-1 shadow-sm" style={{ backgroundColor: '#3D1425', color: '#ffffff' }}>
            <h1 className="text-base sm:text-lg font-bold">Estrategia de Retiro Acelerado</h1>
            <p className="text-[11px] text-[#EED5B7]">Análisis de Beneficio Fiscal (LISR Art. 151 Fracc. V)*</p>
          </div>
        </div>

        {/* Saludo y Fecha (Protegido contra SSR mismatch) */}
        <div className="flex justify-between items-center text-xs px-1">
          <span className="font-semibold text-slate-800 bg-slate-100 py-1 px-3 rounded-lg">
            Hola, <strong className="text-[#3D1425]">{nombre}</strong>
          </span>
          <span className="text-[11px] text-slate-500">{fechaActual || "Cargando..."}</span>
        </div>

        <p className="text-xs text-slate-600 px-1 leading-relaxed">
          Con base a tu perfil de ingresos como asalariado, hemos diseñado una estrategia para convertir tu carga fiscal actual en un patrimonio garantizado para tu futuro. El objetivo de este documento es mostrarte cómo el SAT puede financiar hasta el 30% de tu fondo de retiro.
        </p>

        {/* Tablas de Diagnóstico y Estrategia */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-[#3D1425] rounded-xl overflow-hidden shadow-sm">
            <div className="text-[11px] font-bold py-1.5 text-center uppercase tracking-wider" style={{ backgroundColor: '#3D1425', color: '#ffffff' }}>
              Tu Diagnóstico
            </div>
            <div className="p-2.5 bg-[#FDFBF7] space-y-1 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="text-slate-600">Ingreso Mensual Estimado:</span>
                <span className="font-bold text-slate-900">{formatCurrency(ingresoMensual)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="text-slate-600">Ingreso Anual Acumulable:</span>
                <span className="font-bold text-slate-900">{formatCurrency(ingresoAnual)}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-600">Tasa Marginal de Impuestos:</span>
                <span className="font-bold text-slate-900">{porcentajeSat}%</span>
              </div>
            </div>
          </div>

          <div className="border border-[#3D1425] rounded-xl overflow-hidden shadow-sm">
            <div className="text-[11px] font-bold py-1.5 text-center uppercase tracking-wider" style={{ backgroundColor: '#3D1425', color: '#ffffff' }}>
              La Estrategia
            </div>
            <div className="p-2.5 bg-[#FDFBF7] space-y-1 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="text-slate-600">Aportación Sugerida (10%):</span>
                <span className="font-bold text-slate-900">{formatCurrency(ingresoAnual * 0.10)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-0.5">
                <span className="text-slate-600">Aportación Anual al PPR:</span>
                <span className="font-bold text-slate-900">{formatCurrency(aportacionAnual)}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-600">Tope legal aprovechando:</span>
                <span className="font-bold text-[#3D1425]">10% exacto de tu ingreso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner de Beneficio Fiscal Inmediato */}
        <div className="bg-[#F7EEDD] border border-[#C29B75] p-3 rounded-2xl space-y-1.5 text-center shadow-sm">
          <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#3D1425]">El Beneficio Fiscal Inmediato</h4>
          <p className="text-[11px] text-slate-700">
            Al hacer tu declaración anual en el mes de abril, el SAT te devolverá en efectivo el impuesto retenido sobre la aportación que realizaste a tu plan.
          </p>
          <div className="flex justify-around items-center pt-1.5 border-t border-[#C29B75]/40 gap-2">
            <div>
              <span className="text-[10px] font-bold block uppercase text-slate-700">Devolución Estimada:</span>
              <span className="text-sm font-black text-slate-900">{formatCurrency(devolucion)} <span className="text-[10px] font-normal">(Aprox. {porcentajeSat}% de tu ahorro)</span></span>
            </div>
            <div>
              <span className="text-[10px] font-bold block uppercase text-slate-700">Costo Real de tu PPR:</span>
              <span className="text-sm font-black text-slate-900">{formatCurrency(costoNeto)} <span className="text-[10px] font-normal">(El gobierno financia el resto)</span></span>
            </div>
          </div>
          <div className="bg-white/90 p-2 rounded-xl text-[11px] text-slate-700 mt-1 font-medium border border-[#C29B75]/30">
            💡 El costo real de tu ahorro: Aunque aportas <strong className="text-[#3D1425]">{formatCurrency(aportacionMensual)}</strong> al mes en tu Plan Personal para el Retiro, al recibir tu devolución anual, el impacto real en tu bolsillo es de sólo <strong className="text-emerald-700">{formatCurrency(aportacionRealMensual)}</strong> al mes. El gobierno está pagando la diferencia.
          </div>
        </div>

        {/* Resultado Progresivo */}
        <div className="space-y-2 pt-1 print-avoid-break">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3D1425] border-b border-slate-300 pb-0.5">
            RESULTADO PROGRESIVO (PROYECCIÓN A {anosRestantes} AÑOS)
          </h3>
          <p className="text-[11px] text-slate-600 text-center">
            ¿Qué pasa si en lugar de gastar la devolución del SAT, la reinvertimos anualmente junto con tu plan?<br />
            Aquí tienes la proyección del poder del interés compuesto (tasa proyectada del {tasaRendimiento}% anual):
          </p>

          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-8 p-3 rounded-xl space-y-1.5 text-xs shadow-sm" style={{ backgroundColor: '#3D1425', color: '#ffffff' }}>
              <div className="flex justify-between border-b border-white/20 pb-0.5 text-[11px]">
                <span>Fondo proyectado por el Plan Personal para el Retiro ({anosRestantes} aportaciones)</span>
                <span className="font-bold text-amber-300">{formatCurrency(fondoPpr)}</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-0.5 text-[11px]">
                <span>Fondo generado reinvirtiendo la devolución</span>
                <span className="font-bold text-amber-300">{formatCurrency(fondoReinversion)}</span>
              </div>
              <div className="flex justify-between pt-0.5 text-xs font-black">
                <span>TOTAL PATRIMONIO AL RETIRO</span>
                <span className="text-emerald-400 text-sm">{formatCurrency(totalPatrimonio)}</span>
              </div>
            </div>

            <div className="col-span-4 bg-[#F7EEDD]/70 border border-[#C29B75]/60 p-2.5 rounded-xl text-center space-y-0.5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">Y al final, tú sólo habrás contribuido</span>
              <span className="text-base font-black text-[#3D1425]">{formatCurrency(aportacionPpr)}</span>
            </div>
          </div>
        </div>

        <div className="text-center font-bold text-[11px] text-[#3D1425] uppercase tracking-wide pt-1">
          Haz de La Secretaría de Hacienda y Crédito Público, tu mejor socio para el retiro.
        </div>

        {/* Pie Legal y Firma */}
        <div className="border-t pt-2 space-y-2 text-center">
          <p className="text-[9px] text-slate-500">
            *Nota legal: Este documento es una proyección financiera y fiscal ilustrativa basada en la Ley del Impuesto Sobre la Renta (LISR Art. 151 y 152) vigente. Las tasas de rendimiento y valores de UMA están sujetos a variaciones del mercado y actualizaciones gubernamentales anuales.
          </p>
          
         <div className="w-full bg-[#FDFBF7] border border-[#3D1425]/20 py-2 px-3 rounded-xl shadow-sm">
            <p className="font-bold text-[#3D1425] text-[10px] sm:text-[11px] tracking-tight">
              Agente Profesional en Seguros: {usuarioSupabase?.user_metadata?.nombre || "Cargando..."} &nbsp;|&nbsp; 
              WhatsApp: {usuarioSupabase?.user_metadata?.telefono || "Cargando..."} &nbsp;|&nbsp; 
              Registro CNSF: {usuarioSupabase?.user_metadata?.cnsf || "Cargando..."} &nbsp; 
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function ReportePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Cargando reporte...</div>}>
      <ReporteContent />
    </Suspense>
  );
}