"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Autenticación real con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      // Generamos y guardamos un identificador único 
      // para esta nueva sesión en los metadatos del usuario.
      const nuevoSessionId = crypto.randomUUID();
      await supabase.auth.updateUser({
        data: { current_session_id: nuevoSessionId }
      });
      //  GUARDAMOS EL ID EN UNA COOKIE SEGURA (expira en 12 horas )
      document.cookie = `my_session_id=${nuevoSessionId}; path=/; max-age=43200; SameSite=Lax`;
      // 3. Redirigimos a la calculadora como lo hacías normalmente
      router.push("/calculadoraAgente"); 
      router.refresh();
      console.log("Inicio de sesión exitoso:", data.user);

      
      
    } catch (error: any) {
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos. Verifica tus datos."
          : error.message || "Ocurrió un error al iniciar sesión. Inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-200 text-slate-800 flex items-center justify-center p-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white border border-indigo-100 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-10">
          
          {/* Encabezado */}
          <div className="text-center mb-8">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Portal de Agentes
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Iniciar Sesión
            </h1>
            <p className="text-slate-500 mt-2 text-xs sm:text-sm">
              Ingresa tus credenciales para acceder a tus prospectos y calculadoras.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Formulario de Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                placeholder="agente@tuempresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md shadow-indigo-600/20 text-sm disabled:opacity-50"
            >
              {isLoading ? "Autenticando..." : "Ingresar a mi Cuenta"}
            </button>
          </form>

          {/* Enlace de regreso a la calculadora o registro */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6 space-y-2">
            <p className="text-xs text-slate-500">
              ¿No tienes una cuenta?{" "}
              <Link href="/registro" className="text-indigo-600 hover:text-indigo-800 font-bold">
                Regístrate
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}