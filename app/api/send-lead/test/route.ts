import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client' 

export async function GET() {
  console.log("Comprobando variable:", process.env.SUPABASE_KEY ? "Detectada ✅" : "No detectada ❌");
  
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error("Error conectando a Supabase:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  console.log("¡Conexión exitosa a Supabase! Usuarios encontrados:", data.users.length);
  return NextResponse.json({ success: true, count: data.users.length });
}