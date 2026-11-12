import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
const supabaseUrl = 'https://jnsjqlzcwiocpeyoxcsf.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY!
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { agenteId, prospecto }  = await request.json();

    if (!agenteId) {
      return NextResponse.json({ error: "No se especificó un agente válido." }, { status: 400 });
    }

    // 1. BUSCAMOS EN SUPABASE AUTH (La tabla interna de usuarios por defecto)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(agenteId);

    if (userError || !userData?.user) {
      console.error("Error buscando en Supabase Auth:", userError);
      return NextResponse.json({ error: "El agente no fue encontrado en Supabase Auth." }, { status: 404 });
    }

    const emailAgente = userData.user.email;
    // El nombre normalmente se guarda en los metadatos del usuario al registrarse
    const nombreAgente = userData.user.user_metadata?.nombre || userData.user.user_metadata?.full_name || "Asesor";

    // 2. ENVIAMOS EL CORREO CON NODEMAILER Y GMAIL
    await transporter.sendMail({
      from: `"Calculadora PPR" <${process.env.GMAIL_USER}>`,
      to: emailAgente!,
      subject: `🔥 ¡Nueva solicitud de cotización de ${prospecto.nombre}!`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #3D1425; border-bottom: 2px solid #3D1425; padding-bottom: 10px;">¡Hola, ${nombreAgente}!</h2>
          <p>Has recibido una nueva solicitud de cotización a través de tu enlace personalizado.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Nombre del Prospecto:</strong> ${prospecto.nombre}</p>
            <p style="margin: 5px 0;"><strong>Correo Electrónico:</strong> <a href="mailto:${prospecto.email}">${prospecto.email}</a></p>
            <p style="margin: 5px 0;"><strong>Teléfono / WhatsApp:</strong> <a href="tel:${prospecto.telefono}">${prospecto.telefono}</a></p>
            <p style="margin: 5px 0;"><strong>Ingreso Mensual:</strong> $${prospecto.ingresoMensual?.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Ahorro Mensual:</strong> $${prospecto.ahorroMensual?.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Devolución Estimada del SAT:</strong> $${prospecto.devolucionEstimada?.toLocaleString()} (${prospecto.porcentajeDescuentoSAT}%)</p>
          </div>

          <p style="font-size: 12px; color: #64748b; text-align: center;">Ponte en contacto con tu prospecto lo antes posible.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}