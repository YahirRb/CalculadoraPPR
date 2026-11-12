"use client";

import { useState } from "react";
import { supabase } from '@/lib/supabase/client';
import Link from "next/link";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Lista de dominios temporales/desechables para evitar registros falsos
const DOMINIOS_DESECHABLES = [
  "yopmail.com", "mailinator.com", "guerrillamail.com", 
  "10minutemail.com", "tempmail.com", "trashmail.com",
  "getnada.com", "dispostable.com"
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    cnsf: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validar Correo
    if (!esEmailValido(formData.email)) {
      setErrorMessage("Por favor ingresa un correo electrónico válido (no se permiten correos temporales).");
      return;
    }

    // 2. Validar Teléfono
    if (!esTelefonoValido(formData.telefono)) {
      setErrorMessage("Ingresa un número celular válido de México a 10 dígitos.");
      return;
    }

    // 3. Validar Contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    // 4. Validar longitud mínima de contraseña
    if (formData.password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
            telefono: formData.telefono,
            cnsf: formData.cnsf,
          },
          emailRedirectTo: 'https://retiro-acelerado.vercel.app/',
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(true);
    } catch (error: any) {
      setErrorMessage(error.message || "Ocurrió un error al procesar tu registro. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-200 text-slate-800 flex items-center justify-center p-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-md border border-indigo-100/80 rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10 transition-all">
          
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium shadow-sm flex items-center gap-2">
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          {!successMessage ? (
            <>
              {/* Encabezado del Formulario */}
              <div className="text-center mb-8">
                <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 border border-indigo-100">
                  Unirse a la Red
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Crear Cuenta de Agente
                </h1>
                <p className="text-slate-500 mt-2 text-xs sm:text-sm">
                  Regístrate para obtener tu propia calculadora personalizada y gestionar tus prospectos.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Lic. Carlos Mendoza"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Correo Electrónico Profesional
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="agente@tuempresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    WhatsApp / Teléfono Celular
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10 dígitos (ej. 6641234567)"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Registro CNSF
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. H428095"
                    value={formData.cnsf}
                    onChange={(e) => setFormData({ ...formData, cnsf: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition pr-16 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 text-xs font-bold"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Confirmar Contraseña
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-600/30 text-sm disabled:opacity-50 active:scale-[0.99]"
                >
                  {isLoading ? "Registrando cuenta..." : "Crear Cuenta de Agente"}
                </button>
              </form>

              {/* Enlace inferior del formulario */}
              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <p className="text-xs text-slate-500">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-bold transition">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* Vista de Éxito Rediseñada y Elegante */
            <div className="text-center py-6 space-y-5 animate-fade-in">
              {/* Insignia superior sutil */}
              <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                Verificación Pendiente
              </span>

              {/* Ícono de sobre moderno con halo decorativo */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25"></div>
                <div className="relative w-18 h-18 bg-gradient-to-tr from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-600 rounded-full flex items-center justify-center shadow-inner text-2xl">
                  ✉️
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  ¡Registro Exitoso!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed px-2">
                  Hemos enviado un enlace de confirmación a tu correo electrónico. Por favor, revísalo y haz clic en él para activar tu cuenta.
                </p>
              </div>

              <div className="pt-4">
                <Link 
                  href="/"
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-600/30 text-sm disabled:opacity-50 active:scale-[0.99]"
                >
                  Ir a Iniciar Sesión
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}