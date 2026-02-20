import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://jidou-navi.app";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_ORIGINS = [
  "https://jidou-navi.app",
  "https://www.jidou-navi.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function getEmailContent(lang: string, platformDisplay: string, unsubscribeUrl: string) {
  if (lang === 'es') {
    return {
      subject: "¡Bienvenido a JidouNavi!",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root { color-scheme: light; }
    @media (prefers-color-scheme: dark) {
      .body-bg { background-color: #FDF3E7 !important; }
      .card-bg { background-color: #ffffff !important; }
      .footer-bg { background-color: #f9f5f0 !important; }
    }
  </style>
</head>
<body class="body-bg" style="margin: 0; padding: 0; background-color: #FDF3E7 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="body-bg" style="background-color: #FDF3E7 !important; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" class="card-bg" style="max-width: 500px; background-color: #ffffff !important; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <!-- Header with inline logo and title -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; text-align: center;">
                    <img src="${SITE_URL}/assets/icon.png" alt="JidouNavi" width="96" height="96" style="border-radius: 50%; display: inline-block; vertical-align: middle;">
                  </td>
                  <td style="vertical-align: middle; padding-left: 16px; text-align: left;">
                    <span style="font-size: 32px; font-weight: 700; color: #2B2B2B; vertical-align: middle;">JidouNavi</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #2B2B2B;">¿Listo para explorar?</h2>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                Gracias por unirte a la lista de espera de JidouNavi para <strong style="color: #2B2B2B;">${platformDisplay}</strong>. Estamos construyendo algo especial para cazadores de máquinas expendedoras como tú.
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                Te enviaremos un solo correo — el día del lanzamiento. Nada más.
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                ¿Quieres estar al tanto? Síguenos en Instagram para adelantos y novedades:
                <a href="https://instagram.com/jidou.navi" style="color: #E1306C; text-decoration: none; font-weight: 600;">@jidou.navi</a>
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                Nos vemos pronto,<br>
                <strong style="color: #2B2B2B;">El equipo de JidouNavi</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer-bg" style="padding: 20px 40px; background-color: #f9f5f0 !important; border-top: 1px solid #E8DDD0;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #8A8A8A; text-align: center;">
                <a href="${SITE_URL}/es/privacy" style="color: #8A8A8A; text-decoration: none;">Privacidad</a>
                <span style="margin: 0 6px;">·</span>
                <a href="${SITE_URL}/es/terms" style="color: #8A8A8A; text-decoration: none;">Términos</a>
                <span style="margin: 0 6px;">·</span>
                <a href="mailto:jidou.navi@gmail.com" style="color: #8A8A8A; text-decoration: none;">Contacto</a>
                <span style="margin: 0 6px;">·</span>
                <a href="${unsubscribeUrl}" style="color: #8A8A8A; text-decoration: none;">Cancelar suscripción</a>
              </p>
              <p style="margin: 0 0 6px; font-size: 11px; color: #A0A0A0; text-align: center;">
                ¿Preguntas? Escríbenos a <a href="mailto:jidou.navi@gmail.com" style="color: #A0A0A0;">jidou.navi@gmail.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #A0A0A0; text-align: center;">
                © 2026 JidouNavi
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim(),
      text: `
¿Listo para explorar?

Gracias por unirte a la lista de espera de JidouNavi para ${platformDisplay}. Estamos construyendo algo especial para cazadores de máquinas expendedoras como tú.

Te enviaremos un solo correo — el día del lanzamiento. Nada más.

¿Quieres estar al tanto? Síguenos en Instagram: https://instagram.com/jidou.navi

Nos vemos pronto,
El equipo de JidouNavi

---
Privacidad: ${SITE_URL}/es/privacy
Términos: ${SITE_URL}/es/terms
Contacto: jidou.navi@gmail.com
Cancelar suscripción: ${unsubscribeUrl}

© 2026 JidouNavi`.trim(),
    };
  }

  // Default: English
  return {
    subject: "Welcome to JidouNavi!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root { color-scheme: light; }
    @media (prefers-color-scheme: dark) {
      .body-bg { background-color: #FDF3E7 !important; }
      .card-bg { background-color: #ffffff !important; }
      .footer-bg { background-color: #f9f5f0 !important; }
    }
  </style>
</head>
<body class="body-bg" style="margin: 0; padding: 0; background-color: #FDF3E7 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="body-bg" style="background-color: #FDF3E7 !important; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" class="card-bg" style="max-width: 500px; background-color: #ffffff !important; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <!-- Header with inline logo and title -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; text-align: center;">
                    <img src="${SITE_URL}/assets/icon.png" alt="JidouNavi" width="96" height="96" style="border-radius: 50%; display: inline-block; vertical-align: middle;">
                  </td>
                  <td style="vertical-align: middle; padding-left: 16px; text-align: left;">
                    <span style="font-size: 32px; font-weight: 700; color: #2B2B2B; vertical-align: middle;">JidouNavi</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #2B2B2B;">Ready to explore?</h2>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                Thanks for joining the JidouNavi waitlist for <strong style="color: #2B2B2B;">${platformDisplay}</strong>. We're building something special for vending machine hunters like you.
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                We'll email you once — on launch day. That's it.
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                Want to stay in the loop? Follow us on Instagram for sneak peeks and updates:
                <a href="https://instagram.com/jidou.navi" style="color: #E1306C; text-decoration: none; font-weight: 600;">@jidou.navi</a>
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                See you soon,<br>
                <strong style="color: #2B2B2B;">The JidouNavi Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer-bg" style="padding: 20px 40px; background-color: #f9f5f0 !important; border-top: 1px solid #E8DDD0;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #8A8A8A; text-align: center;">
                <a href="${SITE_URL}/privacy.html" style="color: #8A8A8A; text-decoration: none;">Privacy</a>
                <span style="margin: 0 6px;">·</span>
                <a href="${SITE_URL}/terms.html" style="color: #8A8A8A; text-decoration: none;">Terms</a>
                <span style="margin: 0 6px;">·</span>
                <a href="mailto:jidou.navi@gmail.com" style="color: #8A8A8A; text-decoration: none;">Contact</a>
                <span style="margin: 0 6px;">·</span>
                <a href="${unsubscribeUrl}" style="color: #8A8A8A; text-decoration: none;">Unsubscribe</a>
              </p>
              <p style="margin: 0 0 6px; font-size: 11px; color: #A0A0A0; text-align: center;">
                Questions? Reach us at <a href="mailto:jidou.navi@gmail.com" style="color: #A0A0A0;">jidou.navi@gmail.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #A0A0A0; text-align: center;">
                © 2026 JidouNavi
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim(),
    text: `
Ready to explore?

Thanks for joining the JidouNavi waitlist for ${platformDisplay}. We're building something special for vending machine hunters like you.

We'll email you once — on launch day. That's it.

Want to stay in the loop? Follow us on Instagram: https://instagram.com/jidou.navi

See you soon,
The JidouNavi Team

---
Privacy: ${SITE_URL}/privacy.html
Terms: ${SITE_URL}/terms.html
Contact: jidou.navi@gmail.com
Unsubscribe: ${unsubscribeUrl}

© 2026 JidouNavi`.trim(),
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, unsubscribe_token, platform, lang } = await req.json();

    // Validate email format on server side
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!unsubscribe_token) {
      return new Response(
        JSON.stringify({ error: "Missing unsubscribe_token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the email and token exist in database (prevents abuse)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: record, error: dbError } = await supabase
      .from("waitlist")
      .select("email, unsubscribe_token, subscribed")
      .eq("email", email)
      .eq("unsubscribe_token", unsubscribe_token)
      .single();

    if (dbError || !record) {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Don't send email if user has unsubscribed
    if (!record.subscribed) {
      return new Response(
        JSON.stringify({ error: "User has unsubscribed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailLang = lang === 'es' ? 'es' : 'en';
    const unsubscribeUrl = emailLang === 'es'
      ? `${SITE_URL}/es/unsubscribe.html?token=${unsubscribe_token}`
      : `${SITE_URL}/unsubscribe.html?token=${unsubscribe_token}`;
    const platformDisplay = platform === "ios" ? "iOS" : "Android";

    const emailContent = getEmailContent(emailLang, platformDisplay, unsubscribeUrl);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "JidouNavi <noreply@jidou-navi.app>",
        reply_to: "jidou.navi@gmail.com",
        to: [email],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: data }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
