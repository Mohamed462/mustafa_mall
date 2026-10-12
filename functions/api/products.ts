interface Env {
  DB?: D1Database;
}

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers, status: 204 });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const categoryId = url.searchParams.get('category');
  const slug = url.searchParams.get('slug');

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, message: 'D1 not bound' }), { headers, status: 200 });
  }

  try {
    let query = 'SELECT * FROM products WHERE is_active = 1';
    const params: any[] = [];

    if (slug) {
      query += ' AND slug = ? LIMIT 1';
      params.push(slug);
      const product: any = await env.DB.prepare(query).bind(...params).first();
      if (!product) {
        return new Response(JSON.stringify({ success: false, error: 'Product not found' }), { headers, status: 404 });
      }
      return new Response(JSON.stringify({
        success: true,
        data: {
          ...product,
          images: JSON.parse(product.images_json || '[]'),
          variants: JSON.parse(product.variants_json || '[]'),
        }
      }), { headers, status: 200 });
    }

    if (categoryId) {
      query += ' AND category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY created_at DESC';
    const res = await env.DB.prepare(query).bind(...params).all();

    const formatted = (res.results || []).map((p: any) => ({
      ...p,
      images: JSON.parse(p.images_json || '[]'),
      variants: JSON.parse(p.variants_json || '[]'),
    }));

    return new Response(JSON.stringify({ success: true, data: formatted }), { headers, status: 200 });
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
    const body: any = await request.json();
    const id = body.id || `prod-${Date.now()}`;
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT OR REPLACE INTO products (
        id, category_id, brand_id, name_ar, name_en, slug, sku, barcode,
        description_ar, price_egp, compare_at_price_egp, cost_price_egp,
        stock_quantity, low_stock_threshold, max_order_quantity,
        is_featured, is_active, images_json, variants_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.category_id || '',
      body.brand_id || null,
      body.name_ar,
      body.name_en || null,
      body.slug,
      body.sku,
      body.barcode || null,
      body.description_ar || '',
      Number(body.price_egp),
      body.compare_at_price_egp ? Number(body.compare_at_price_egp) : null,
      body.cost_price_egp ? Number(body.cost_price_egp) : null,
      Number(body.stock_quantity ?? 0),
      Number(body.low_stock_threshold ?? 5),
      Number(body.max_order_quantity ?? 5),
      body.is_featured ? 1 : 0,
      body.is_active ? 1 : 0,
      JSON.stringify(body.images || []),
      JSON.stringify(body.variants || []),
      now
    ).run();

    return new Response(JSON.stringify({ success: true, data: { id, ...body } }), { headers, status: 200 });
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
    return new Response(JSON.stringify({ success: false, error: 'Missing product id' }), { headers, status: 400 });
  }

  try {
    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Product deleted from D1' }), { headers, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { headers, status: 500 });
  }
};
