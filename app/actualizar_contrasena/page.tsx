"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ActualizarPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      alert("¡Contraseña actualizada con éxito!");
      router.push("/calculadoraAgente");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
        
        {/* Encabezado idéntico al Login */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3.5 py-1 rounded-full bg-[#ede9fe] text-[#6d28d9] text-[10px] font-bold tracking-wider uppercase mb-1">
            PORTAL DE AGENTES
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Nueva Contraseña
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Ingresa tu nueva clave de acceso para asegurar tu cuenta.
          </p>
        </div>

        {/* Mensaje de error si ocurre */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleActualizar} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 tracking-wider mb-1.5 uppercase">
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-[#6d28d9] bg-white shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 tracking-wider mb-1.5 uppercase">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-[#6d28d9] bg-white shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold text-xs py-3.5 rounded-2xl shadow-md transition hover:opacity-95 disabled:opacity-50 mt-2 bg-[#581c87]"
          >
            {loading ? "Guardando cambios..." : "Actualizar Contraseña"}
          </button>
        </form>

      </div>
    </main>
  );
}