# 🛡️ Portal de Agentes y Calculadora PPR (Next.js & Supabase)

Sistema web moderno y seguro desarrollado para optimizar la gestión de asesores financieros y agentes de seguros, permitiendo realizar cálculos avanzados de Planes Personales de Retiro (PPR), generar reportes personalizados y administrar el flujo de prospectos.

## ✨ Características Principales

- **🔒 Control de Sesión Única (Single Session Enforcement):** Implementación de seguridad personalizada que previene inicios de sesión concurrentes. Cada nuevo login invalida automáticamente la sesión anterior mediante un identificador único (`current_session_id`) sincronizado con Supabase y cookies de corta duración.
- **🧮 Calculadora PPR Interactiva:** Herramienta dinámica para proyectar ahorros para el retiro con cálculos precisos y personalizables.
- **📄 Generación de Reportes:** Visualización estructurada de datos y proyecciones para clientes y agentes.
- **⚡ Enlaces Compartibles:** Generación automática de URLs con identificadores de agente para prospección directa.

## 🛠️ Tecnologías y Stack

Este proyecto está construido utilizando tecnologías modernas del ecosistema web:

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), React, TypeScript.
- **Estilos:** Tailwind CSS para una interfaz limpia, responsiva y profesional.
- **Backend & Auth:** [Supabase](https://supabase.com/) (`@supabase/ssr`) para la autenticación segura de usuarios y gestión de base de datos PostgreSQL.
- **Despliegue:** Optimizado para Vercel.

## 🚀 Seguridad y Autenticación
El sistema maneja un flujo robusto donde cada autenticación valida la unicidad de la sesión en el navegador, asegurando que las credenciales del agente permanezcan protegidas contra accesos simultáneos no autorizados.