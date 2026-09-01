// Cloudflare Pages Function: POST /api/subscribe
//
// Server-side proxy to the Kit API, so the Kit API key never reaches the
// browser. Requires KIT_API_KEY plus one Kit Form ID per opt-in source, as
// Cloudflare Pages environment variables set in the dashboard (Settings ->
// Environment variables), never committed here:
//   KIT_API_KEY           — Kit's API key (Settings -> Advanced -> API in Kit)
//   KIT_FORM_ID            — form ID for the seasonal-menus lead magnet
//   KIT_NEWSLETTER_FORM_ID — form ID for the homepage weekly-note signup
// Each is the numeric ID of a Kit Form used as an automation entry point
// (the "Joins a form" trigger) — visible in the URL when editing that form
// in the Kit dashboard. Kept as separate forms so the two audiences (a
// one-time lead magnet vs. an ongoing newsletter) can be segmented and
// automated independently in Kit.
//
// The client passes which one it means via `source` in the request body
// ("seasonal-menus" or "newsletter") — this endpoint only ever picks
// between those two known, whitelisted env vars, never a form ID supplied
// directly by the client.
//
// Flow: create/update the subscriber (sets their name), then add them to
// the form (which is what actually fires a "Joins a form" automation).
const KIT_API_BASE = 'https://api.kit.com/v4';

const FORM_ID_BY_SOURCE = {
  'seasonal-menus': 'KIT_FORM_ID',
  newsletter: 'KIT_NEWSLETTER_FORM_ID',
};

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const firstName = typeof payload.first_name === 'string' ? payload.first_name.trim() : '';
  const source = typeof payload.source === 'string' ? payload.source : '';

  if (!email) {
    return jsonResponse({ error: 'email is required' }, 400);
  }

  const formIdEnvKey = FORM_ID_BY_SOURCE[source];
  if (!formIdEnvKey) {
    return jsonResponse({ error: 'unknown or missing source' }, 400);
  }

  const apiKey = env.KIT_API_KEY;
  const formId = env[formIdEnvKey];

  if (!apiKey || !formId) {
    console.error(`subscribe: KIT_API_KEY or ${formIdEnvKey} is not configured in this environment`);
    return jsonResponse({ error: 'Server is not configured' }, 500);
  }

  const kitHeaders = {
    'Content-Type': 'application/json',
    'X-Kit-Api-Key': apiKey,
  };

  try {
    const createBody = { email_address: email };
    if (firstName) createBody.first_name = firstName;

    const createRes = await fetch(`${KIT_API_BASE}/subscribers`, {
      method: 'POST',
      headers: kitHeaders,
      body: JSON.stringify(createBody),
    });

    if (!createRes.ok) {
      console.error('Kit create-subscriber failed:', createRes.status, await createRes.text());
      return jsonResponse({ error: 'Kit rejected the subscriber' }, 502);
    }

    const formRes = await fetch(`${KIT_API_BASE}/forms/${formId}/subscribers`, {
      method: 'POST',
      headers: kitHeaders,
      body: JSON.stringify({ email_address: email }),
    });

    if (!formRes.ok) {
      console.error('Kit add-to-form failed:', formRes.status, await formRes.text());
      return jsonResponse({ error: 'Kit rejected the form subscription' }, 502);
    }

    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    console.error('subscribe: unexpected error', err);
    return jsonResponse({ error: 'Unexpected server error' }, 500);
  }
}
