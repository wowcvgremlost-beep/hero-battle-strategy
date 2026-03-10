import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function verifyTelegramData(initData: string, botToken: string): Record<string, string> | null {
  // Parse the init data
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  // Build data-check-string
  params.delete("hash");
  const entries = Array.from(params.entries());
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  // HMAC-SHA256 verification
  const encoder = new TextEncoder();

  // We need to use Web Crypto API synchronously - but it's async in Deno
  // So we'll do it async and call from handler
  return Object.fromEntries(params.entries());
}

async function verifyTelegramDataAsync(
  initData: string,
  botToken: string
): Promise<{ valid: boolean; data: Record<string, string> }> {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { valid: false, data: {} };

  params.delete("hash");
  const entries = Array.from(params.entries());
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const encoder = new TextEncoder();

  // secret_key = HMAC-SHA256("WebAppData", bot_token)
  const secretKeyData = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const secretKey = await crypto.subtle.sign(
    "HMAC",
    secretKeyData,
    encoder.encode(botToken)
  );

  // hash = HMAC-SHA256(secret_key, data_check_string)
  const key = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(dataCheckString)
  );

  const hexHash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    valid: hexHash === hash,
    data: Object.fromEntries(params.entries()),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initData } = await req.json();
    if (!initData) {
      return new Response(
        JSON.stringify({ error: "Missing initData" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      return new Response(
        JSON.stringify({ error: "Bot token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { valid, data } = await verifyTelegramDataAsync(initData, botToken);

    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Invalid Telegram data" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract user info
    const userData = JSON.parse(data.user || "{}");
    const telegramId = userData.id?.toString();
    const firstName = userData.first_name || "Player";
    const lastName = userData.last_name || "";
    const username = userData.username || "";

    if (!telegramId) {
      return new Response(
        JSON.stringify({ error: "No telegram user id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to create/sign-in user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const email = `tg_${telegramId}@telegram.local`;
    const password = `tg_${telegramId}_${botToken.slice(0, 10)}`;

    // Try to sign in first
    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!
    );

    let signInResult = await anonClient.auth.signInWithPassword({ email, password });

    if (signInResult.error) {
      // User doesn't exist, create one
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          telegram_id: telegramId,
          first_name: firstName,
          last_name: lastName,
          username,
        },
      });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Now sign in
      signInResult = await anonClient.auth.signInWithPassword({ email, password });
      if (signInResult.error) {
        return new Response(
          JSON.stringify({ error: signInResult.error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        session: signInResult.data.session,
        user: signInResult.data.user,
        telegram: { id: telegramId, firstName, lastName, username },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
