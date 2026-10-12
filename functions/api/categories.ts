interface Env {
  DB?: D1Database;
}

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers, status: 204 });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, message: 'D1 not bound' }), { headers, status: 200 });
  }

  try {
    const res = await env.DB.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
    return new Response(JSON.stringify({ success: true, data: res.results || [] }), { headers, status: 200 });
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
    const cat: any = await request.json();
    const id = cat.id || `cat-${Date.now()}`;

    await env.DB.prepare(`
      INSERT OR REPLACE INTO categories (
        id, parent_id, name_ar, name_en, slug, department_key,
        description_ar, image_url, icon_name, sort_order, is_active, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      cat.parent_id || null,
      cat.name_ar,
      cat.name_en || null,
      cat.slug,
      cat.department_key || null,
      cat.description_ar || null,
      cat.image_url || null,
      cat.icon_name || 'ShoppingBag',
      Number(cat.sort_order ?? 0),
      cat.is_active !== false ? 1 : 0,
      cat.is_featured ? 1 : 0
    ).run();

    return new Response(JSON.stringify({ success: true, data: { ...cat, id } }), { headers, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { headers, status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, message: 'D1 not bound' }), { headers, status: 200 });
  }

  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing id parameter' }), { headers, status: 400 });
  }

  try {
    // Delete the category and any subcategories that point to it
    await env.DB.prepare('DELETE FROM categories WHERE id = ? OR parent_id = ?').bind(id, id).run();
    return new Response(JSON.stringify({ success: true, message: 'Category deleted' }), { headers, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { headers, status: 500 });
  }
};
