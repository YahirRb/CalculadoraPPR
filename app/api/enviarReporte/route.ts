import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount || 0);
};

export async function POST(request: Request) {
  try {
    const { prospecto } = await request.json();

    if (!prospecto || !prospecto.email) {
      return NextResponse.json({ error: "No se proporcionó un correo electrónico válido." }, { status: 400 });
    }

    const fechaHoy = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    // Envío del Reporte Financiero idéntico al diseño visual
    await transporter.sendMail({
      from: `"Estrategia de Retiro Acelerado" <${process.env.GMAIL_USER}>`,
      to: prospecto.email,
      subject: `📊 Tu Estudio Fiscal y Proyección de Retiro, ${prospecto.nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 15px; max-width: 650px; margin: auto; background-color: #ffffff;">
          
          <!-- Contenedor Principal Estilizado -->
          <div style="border: 1px solid #e2e8f0; border-radius: 20px; padding: 25px; background-color: #ffffff;">
            
            <!-- Encabezado Estilo Membrete -->
            <div style="text-align: center; background-color: #3D1425; color: #ffffff; padding: 18px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Estrategia de Retiro Acelerado</h1>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #EED5B7;">Análisis de Beneficio Fiscal (LISR Art. 151 Fracc. V)*</p>
            </div>

            <!-- Saludo y Fecha -->
            <table style="width: 100%; margin-bottom: 15px; font-size: 13px;">
              <tr>
                <td>
                  <span style="background-color: #f1f5f9; padding: 6px 12px; border-radius: 8px; font-weight: bold; color: #1e293b;">
                    Hola, <span style="color: #3D1425;">${prospecto.nombre}</span>
                  </span>
                </td>
                <td style="text-align: right; color: #64748b; font-size: 11px;">
                  ${fechaHoy}
                </td>
              </tr>
            </table>

            <p style="font-size: 12px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Con base a tu perfil de ingresos como asalariado, hemos diseñado una estrategia para convertir tu carga fiscal actual en un patrimonio garantizado para tu futuro. El objetivo de este documento es mostrarte cómo el SAT puede financiar hasta el 30% de tu fondo de retiro.
            </p>

            <!-- Sección de Tablas: Diagnóstico y Estrategia -->
            <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 20px;">
              <tr>
                <!-- Tu Diagnóstico -->
                <td style="width: 50%; vertical-align: top; padding: 0;">
                  <div style="border: 1px solid #3D1425; border-radius: 12px; overflow: hidden; background-color: #FDFBF7;">
                    <div style="background-color: #3D1425; color: #ffffff; font-size: 11px; font-weight: bold; text-align: center; padding: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Tu Diagnóstico
                    </div>
                    <div style="padding: 12px; font-size: 11px; color: #334155;">
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
                        <span>Ingreso Mensual Estimado:</span>
                        <strong style="color: #0f172a;">${formatCurrency(prospecto.ingresoMensual)}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
                        <span>Ingreso Anual Acumulable:</span>
                        <strong style="color: #0f172a;">${formatCurrency(prospecto.ingresoAnual)}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; padding-top: 2px;">
                        <span>Tasa Marginal de Impuestos:</span>
                        <strong style="color: #0f172a;">${prospecto.porcentajeSat}%</strong>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- La Estrategia -->
                <td style="width: 50%; vertical-align: top; padding: 0;">
                  <div style="border: 1px solid #3D1425; border-radius: 12px; overflow: hidden; background-color: #FDFBF7;">
                    <div style="background-color: #3D1425; color: #ffffff; font-size: 11px; font-weight: bold; text-align: center; padding: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                      La Estrategia
                    </div>
                    <div style="padding: 12px; font-size: 11px; color: #334155;">
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
                        <span>Aportación Sugerida (10%):</span>
                        <strong style="color: #0f172a;">${formatCurrency(prospecto.ingresoAnual * 0.10)}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
                        <span>Aportación Anual al PPR:</span>
                        <strong style="color: #0f172a;">${formatCurrency(prospecto.aportacionAnual)}</strong>
                      </div>
                      <div style="display: flex; justify-content: space-between; padding-top: 2px;">
                        <span>Tope legal aprovechando:</span>
                        <strong style="color: #3D1425;">10% exacto de tu ingreso</strong>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Banner de Beneficio Fiscal Inmediato -->
            <div style="background-color: #F7EEDD; border: 1px solid #C29B75; padding: 16px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
              <h4 style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #3D1425; letter-spacing: 0.5px;">El Beneficio Fiscal Inmediato</h4>
              <p style="font-size: 11px; color: #334155; margin: 0 0 12px 0; line-height: 1.5;">
                Al hacer tu declaración anual en el mes de abril, el SAT te devolverá en efectivo el impuesto retenido sobre la aportación que realizaste a tu plan.
              </p>
              
              <table style="width: 100%; border-top: 1px solid rgba(194, 155, 117, 0.4); padding-top: 10px; margin-bottom: 10px;">
                <tr>
                  <td style="width: 50%; text-align: center;">
                    <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #334155; display: block;">Devolución Estimada:</span>
                    <span style="font-size: 14px; font-weight: 900; color: #0f172a;">${formatCurrency(prospecto.devolucion)} <span style="font-size: 10px; font-weight: normal; color: #475569;">(Aprox. ${prospecto.porcentajeSat}% de tu ahorro)</span></span>
                  </td>
                  <td style="width: 50%; text-align: center;">
                    <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #334155; display: block;">Costo Real de tu PPR:</span>
                    <span style="font-size: 14px; font-weight: 900; color: #0f172a;">${formatCurrency(prospecto.costoNeto)} <span style="font-size: 10px; font-weight: normal; color: #475569;">(El gobierno financia el resto)</span></span>
                  </td>
                </tr>
              </table>

              <div style="background-color: #ffffff; padding: 10px; border-radius: 10px; font-size: 11px; color: #334155; border: 1px solid rgba(194, 155, 117, 0.3); text-align: left;">
                💡 <strong>El costo real de tu ahorro:</strong> Aunque aportas <strong style="color: #3D1425;">${formatCurrency(prospecto.aportacionMensual)}</strong> al mes en tu Plan Personal para el Retiro, al recibir tu devolución anual, el impacto real en tu bolsillo es de sólo <strong style="color: #047857;">${formatCurrency(prospecto.aportacionRealMensual)}</strong> al mes. El gobierno está pagando la diferencia.
              </div>
            </div>

            <!-- Resultado Progresivo -->
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #3D1425; text-align: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 8px; letter-spacing: 0.5px;">
                Resultado Progresivo (Proyección a ${prospecto.anosRestantes} años)
              </h3>
              <p style="font-size: 11px; color: #475569; text-align: center; margin: 0 0 12px 0; line-height: 1.4;">
                ¿Qué pasa si en lugar de gastar la devolución del SAT, la reinvertimos anualmente junto con tu plan?<br/>
                Aquí tienes la proyección del poder del interés compuesto (tasa proyectada del ${prospecto.tasaRendimiento}% anual):
              </p>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <!-- Cuadro Oscuro de Resultados -->
                  <td style="width: 68%; background-color: #3D1425; color: #ffffff; padding: 15px; border-radius: 12px; vertical-align: middle;">
                    <div style="font-size: 11px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px; margin-bottom: 6px;">
                      <span>Fondo proyectado por el Plan Personal para el Retiro (${prospecto.anosRestantes} aportaciones)</span>
                      <strong style="color: #fde047; text-align: right; min-width: 90px;">${formatCurrency(prospecto.fondoPpr)}</strong>
                    </div>
                    <div style="font-size: 11px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px; margin-bottom: 6px;">
                      <span>Fondo generado reinvirtiendo la devolución</span>
                      <strong style="color: #fde047; text-align: right; min-width: 90px;">${formatCurrency(prospecto.fondoReinversion)}</strong>
                    </div>
                    <div style="font-size: 12px; display: flex; justify-content: space-between; font-weight: 900; padding-top: 4px;">
                      <span>TOTAL PATRIMONIO AL RETIRO</span>
                      <strong style="color: #34d399; font-size: 14px; text-align: right; min-width: 90px;">${formatCurrency(prospecto.totalPatrimonio)}</strong>
                    </div>
                  </td>

                  <td style="width: 2%;"></td>

                  <!-- Cuadro de Aportación Total -->
                  <td style="width: 30%; background-color: rgba(247, 238, 221, 0.7); border: 1px solid rgba(194, 155, 117, 0.6); padding: 12px; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 10px; font-weight: bold; color: #334155; text-transform: uppercase; display: block; margin-bottom: 4px;">Y al final, tú sólo habrás contribuido</span>
                    <span style="font-size: 15px; font-weight: 900; color: #3D1425; display: block;">${formatCurrency(prospecto.aportacionPpr)}</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Frase Final -->
            <div style="text-align: center; font-weight: bold; font-size: 11px; color: #3D1425; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 0.5px;">
              Haz de La Secretaría de Hacienda y Crédito Público, tu mejor socio para el retiro.
            </div>

            <!-- Pie Legal y Firma del Agente -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center;">
              <p style="font-size: 9px; color: #64748b; line-height: 1.4; margin-bottom: 12px;">
                *Nota legal: Este documento es una proyección financiera y fiscal ilustrativa basada en la Ley del Impuesto Sobre la Renta (LISR Art. 151 y 152) vigente. Las tasas de rendimiento y valores de UMA están sujetos a variaciones del mercado y actualizaciones gubernamentales anuales.
              </p>
              
              <div style="background-color: #FDFBF7; border: 1px solid rgba(61, 20, 37, 0.2); padding: 10px; border-radius: 12px;">
                <p style="margin: 0; font-weight: bold; color: #3D1425; font-size: 11px; letter-spacing: -0.2px;">
                  Agente Profesional en Seguros: ${prospecto.agenteNombre} &nbsp;|&nbsp; 
                  WhatsApp: ${prospecto.agenteTelefono} &nbsp;|&nbsp; 
                  Registro CNSF: ${prospecto.agenteCnsf}
                </p>
              </div>
            </div>

          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}