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
    const { email, unsubscribe_token } = await req.json();

    if (!email || !unsubscribe_token) {
      return new Response(
        JSON.stringify({ error: "Missing email or unsubscribe_token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const unsubscribeUrl = `${SITE_URL}/unsubscribe.html?token=${unsubscribe_token}`;

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
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center;">
              <img src="${SITE_URL}/assets/icon.png" alt="JidouNavi" width="72" height="72" style="border-radius: 50%;">
              <h1 style="margin: 16px 0 0; font-size: 28px; font-weight: 700; color: #2B2B2B;">JidouNavi</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #2B2B2B;">You're on the list!</h2>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                Thanks for signing up for JidouNavi. We're building something special for vending machine hunters like you.
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                We'll let you know as soon as the app is ready to download. Get ready to discover Japan's weirdest vending machines!
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #5A5A5A;">
                See you soon,<br>
                <strong style="color: #2B2B2B;">The JidouNavi Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f5f0; border-top: 1px solid #E8DDD0;">
              <p style="margin: 0; font-size: 12px; color: #8A8A8A; text-align: center;">
                Don't want these emails? <a href="${unsubscribeUrl}" style="color: #FF4B4B; text-decoration: underline;">Unsubscribe</a>
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
        subject: "Welcome to JidouNavi! You're on the waitlist",
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
