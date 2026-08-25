// Cloudflare Pages Function: POST /api/subscribe
//
// Server-side proxy to the Kit API, so the Kit API key never reaches the
// browser. Requires two Cloudflare Pages environment variables, set in the
// dashboard (Settings -> Environment variables), never committed here:
//   KIT_API_KEY  — Kit's API key (Settings -> Advanced -> API in Kit)
//   KIT_FORM_ID  — the numeric ID of the Kit Form to use as the automation
//                  entry point (the "Joins a form" trigger) — visible in the
//                  URL when editing that form in the Kit dashboard.
//
// Flow: create/update the subscriber (sets their name), then add them to
// the form (which is what actually fires a "Joins a form" automation).
const KIT_API_BASE = 'https://api.kit.com/v4';

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

  if (!email) {
    return jsonResponse({ error: 'email is required' }, 400);
  }

  const apiKey = env.KIT_API_KEY;
  const formId = env.KIT_FORM_ID;

  if (!apiKey || !formId) {
    console.error('subscribe: KIT_API_KEY or KIT_FORM_ID is not configured in this environment');
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
