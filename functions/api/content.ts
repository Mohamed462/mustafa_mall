interface Env {
  DB?: D1Database;
}

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers, status: 204 });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, message: 'D1 not bound' }), { headers, status: 200 });
  }

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `).run();

    if (key) {
      const row: any = await env.DB.prepare('SELECT * FROM site_content WHERE key = ?').bind(key).first();
      return new Response(JSON.stringify({
        success: true,
        data: row ? JSON.parse(row.value_json) : null
      }), { headers, status: 200 });
    }

    const all = await env.DB.prepare('SELECT * FROM site_content').all();
    const result: Record<string, any> = {};
    for (const r of (all.results || []) as any[]) {
      try {
        result[r.key] = JSON.parse(r.value_json);
      } catch {}
    }

    return new Response(JSON.stringify({ success: true, data: result }), { headers, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { headers, status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, message: 'D1 not bound' }), { headers, status: 200 });
  }

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `).run();

    const body: any = await request.json();
    const { key, data } = body;

    if (!key) {
      return new Response(JSON.stringify({ success: false, error: 'Missing key' }), { headers, status: 400 });
    }

    await env.DB.prepare(`
      INSERT OR REPLACE INTO site_content (key, value_json, updated_at)
      VALUES (?, ?, datetime('now'))
    `).bind(key, JSON.stringify(data)).run();

    return new Response(JSON.stringify({ success: true, message: `Saved ${key} to D1` }), { headers, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { headers, status: 500 });
  }
};
