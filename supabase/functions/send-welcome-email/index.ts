import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://jidou-navi.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, unsubscribe_token, platform } = await req.json();

    if (!email || !unsubscribe_token) {
      return new Response(
        JSON.stringify({ error: "Missing email or unsubscribe_token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const unsubscribeUrl = `${SITE_URL}/unsubscribe.html?token=${unsubscribe_token}`;
    const platformDisplay = platform === "ios" ? "iOS" : "Android";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDF3E7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FDF3E7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
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
            <td style="padding: 20px 40px; background-color: #f9f5f0; border-top: 1px solid #E8DDD0;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #8A8A8A; text-align: center;">
                <a href="${SITE_URL}/privacy.html" style="color: #8A8A8A; text-decoration: none;">Privacy</a>
                <span style="margin: 0 6px;">·</span>
                <a href="${SITE_URL}/terms.html" style="color: #8A8A8A; text-decoration: none;">Terms</a>
                <span style="margin: 0 6px;">·</span>
                <a href="mailto:jidou.navi@gmail.com" style="color: #8A8A8A; text-decoration: none;">Contact</a>
                <span style="margin: 0 6px;">·</span>
                <a href="${unsubscribeUrl}" style="color: #8A8A8A; text-decoration: none;">Unsubscribe</a>
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
</html>
    `.trim();

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
        subject: "Welcome to JidouNavi! You're on the hunt 🎯",
        html: emailHtml,
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
