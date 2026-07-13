// Launch-day announcement email to the waitlist.
//
// Admin-triggered only: requires the x-admin-secret header to match the
// ADMIN_SECRET function secret. Sends one email per subscribed waitlist row,
// EN or ES by lang, and stamps launch_email_sent_at so re-running the
// function can never email the same person twice.
//
// Test mode: pass { "test_email": "you@example.com", "play_store_url": "..." }
// to send both language variants to that address without touching the table.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://jidou-navi.app";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET");

// Resend free tier allows ~2 requests/second
const SEND_DELAY_MS = 600;

function getEmailContent(lang: string, playStoreUrl: string, unsubscribeUrl: string) {
  const isEs = lang === "es";

  const t = isEs
    ? {
        subject: "¡JidouNavi ya está disponible en Android! 🎉",
        heading: "¡Es el día del lanzamiento!",
        body1: "Hace un tiempo nos dejaste tu correo y te uniste a nuestra lista de espera — gracias por tu confianza. Hoy el equipo de JidouNavi está orgulloso de anunciar que oficialmente estamos en Google Play. Casi 6 meses de desarrollo continuo, una incontable cantidad de tardes en cafés en Japón: dos amigos con el objetivo de construir una herramienta que localice a todas las máquinas expendedoras raras del país y te haga sentir en un juego.",
        body2: "Sí, es pequeña. Encontrarás bugs y habrá cosas que mejorar con el tiempo, pero cada máquina que ya está ahí fue información recolectada a mano — y ahora necesitamos que tú salgas a cazar. Si te encuentras en Japón o tienes planeado visitarlo, danos una oportunidad: no te arrepentirás. Y lo que haya que mejorar, cuéntanos por la opción Feedback dentro de la app; estaremos atentos a todas sus voces.",
        cta: "Descargar en Google Play",
        iosNote: "¿Tienes iPhone? La versión para iOS está en camino — sigues en la lista y te avisaremos cuando llegue.",
        signoff: "Nos vemos explorando,",
        team: "Leandro y Matias · JidouNavi",
        privacy: "Privacidad",
        privacyUrl: `${SITE_URL}/es/privacy`,
        terms: "Términos",
        termsUrl: `${SITE_URL}/es/terms`,
        contact: "Contacto",
        unsubscribe: "Cancelar suscripción",
        questions: "¿Preguntas? Escríbenos a",
      }
    : {
        subject: "JidouNavi is live on Android! 🎉",
        heading: "It's launch day!",
        body1: "A while back you left us your email and joined our waitlist — thank you for trusting us. Today the JidouNavi team is proud to announce that we're officially on Google Play. Almost 6 months of continuous development, countless afternoons in cafés across Japan: two friends set on building a tool that tracks down every rare vending machine in the country and makes you feel like you're in a game.",
        body2: "Yes, it's small. You'll find bugs, and there will be things to improve over time — but every machine already on the map was collected by hand, and now we need you out there hunting. If you're in Japan or planning a visit, give it a chance: you won't regret it. And whatever needs improving, tell us through the Feedback option in the app; we'll be listening to every voice.",
        cta: "Get it on Google Play",
        iosNote: "On iPhone? The iOS version is on the way — you're still on the list and we'll email you when it lands.",
        signoff: "See you out there,",
        team: "Leandro & Matias · JidouNavi",
        privacy: "Privacy",
        privacyUrl: `${SITE_URL}/privacy`,
        terms: "Terms",
        termsUrl: `${SITE_URL}/terms`,
        contact: "Contact",
        unsubscribe: "Unsubscribe",
        questions: "Questions? Reach us at",
      };

  const html = `
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
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #2B2B2B;">${t.heading}</h2>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                ${t.body1}
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                ${t.body2}
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #FF6B6B;">
                    <a href="${playStoreUrl}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 17px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      ${t.cta}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #8A8A8A;">
                ${t.iosNote}
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                ${t.signoff}<br>
                <strong style="color: #2B2B2B;">${t.team}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer-bg" style="padding: 20px 40px; background-color: #f9f5f0 !important; border-top: 1px solid #E8DDD0;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #8A8A8A; text-align: center;">
                <a href="${t.privacyUrl}" style="color: #8A8A8A; text-decoration: none;">${t.privacy}</a>
                <span style="margin: 0 6px;">·</span>
                <a href="${t.termsUrl}" style="color: #8A8A8A; text-decoration: none;">${t.terms}</a>
                <span style="margin: 0 6px;">·</span>
                <a href="mailto:jidou.navi@gmail.com" style="color: #8A8A8A; text-decoration: none;">${t.contact}</a>
                <span style="margin: 0 6px;">·</span>
                <a href="${unsubscribeUrl}" style="color: #8A8A8A; text-decoration: none;">${t.unsubscribe}</a>
              </p>
              <p style="margin: 0 0 6px; font-size: 11px; color: #A0A0A0; text-align: center;">
                ${t.questions} <a href="mailto:jidou.navi@gmail.com" style="color: #A0A0A0;">jidou.navi@gmail.com</a>
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
</html>`.trim();

  const text = `
${t.heading}

${t.body1}

${t.body2}

${t.cta}: ${playStoreUrl}

${t.iosNote}

${t.signoff}
${t.team}

---
${t.privacy}: ${t.privacyUrl}
${t.terms}: ${t.termsUrl}
${t.contact}: jidou.navi@gmail.com
${t.unsubscribe}: ${unsubscribeUrl}

© 2026 JidouNavi`.trim();

  return { subject: t.subject, html, text };
}

function unsubscribeUrlFor(lang: string, token: string) {
  return lang === "es"
    ? `${SITE_URL}/es/unsubscribe.html?token=${token}`
    : `${SITE_URL}/unsubscribe.html?token=${token}`;
}

async function sendViaResend(to: string, lang: string, playStoreUrl: string, unsubscribeUrl: string) {
  const content = getEmailContent(lang, playStoreUrl, unsubscribeUrl);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "JidouNavi <noreply@jidou-navi.app>",
      reply_to: "jidou.navi@gmail.com",
      to: [to],
      subject: content.subject,
      html: content.html,
      text: content.text,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!ADMIN_SECRET || req.headers.get("x-admin-secret") !== ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { play_store_url, test_email } = await req.json();

    if (!play_store_url || !/^https:\/\/play\.google\.com\//.test(play_store_url)) {
      return new Response(
        JSON.stringify({ error: "play_store_url must be a https://play.google.com/ URL" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Test mode: both language variants to one address, no DB writes
    if (test_email) {
      const fakeUnsub = `${SITE_URL}/unsubscribe.html?token=test-token`;
      await sendViaResend(test_email, "en", play_store_url, fakeUnsub);
      await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
      await sendViaResend(test_email, "es", play_store_url, fakeUnsub);
      return new Response(
        JSON.stringify({ success: true, mode: "test", sent_to: test_email, variants: ["en", "es"] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: recipients, error: dbError } = await supabase
      .from("waitlist")
      .select("email, unsubscribe_token, lang")
      .eq("subscribed", true)
      .is("launch_email_sent_at", null);

    if (dbError) {
      return new Response(
        JSON.stringify({ error: "DB query failed (did you run the launch_email_sent_at migration?)", details: dbError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    let sent = 0;
    const failures: { email: string; error: string }[] = [];

    for (const r of recipients ?? []) {
      try {
        const lang = r.lang === "es" ? "es" : "en";
        await sendViaResend(r.email, lang, play_store_url, unsubscribeUrlFor(lang, r.unsubscribe_token));
        await supabase
          .from("waitlist")
          .update({ launch_email_sent_at: new Date().toISOString() })
          .eq("email", r.email);
        sent++;
      } catch (err) {
        console.error(`Failed for ${r.email}:`, err);
        failures.push({ email: r.email, error: String(err) });
      }
      await new Promise((res) => setTimeout(res, SEND_DELAY_MS));
    }

    return new Response(
      JSON.stringify({ success: failures.length === 0, sent, failed: failures.length, failures }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
