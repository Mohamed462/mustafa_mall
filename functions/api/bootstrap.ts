interface Env {
  DB?: D1Database;
}

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers, status: 204 });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Cloudflare D1 is not bound yet. Using local store state.' 
    }), { headers, status: 200 });
  }

  try {
    // 1. Fetch Store Settings
    const settingsRes = await env.DB.prepare('SELECT * FROM store_settings WHERE id = ?').bind('global').first();

    // 2. Fetch Governorate Shipping Rates
    const shippingRatesRes = await env.DB.prepare('SELECT * FROM governorate_shipping_rates ORDER BY sort_order ASC, name_ar ASC').all();

    // 3. Fetch Categories
    const categoriesRes = await env.DB.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();

    // 4. Fetch Brands
    const brandsRes = await env.DB.prepare('SELECT * FROM brands').all();

    // 5. Fetch Products
    const productsRes = await env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();

    // 6. Fetch Print Services
    const printServicesRes = await env.DB.prepare('SELECT * FROM print_services ORDER BY sort_order ASC').all();

    // Format products JSON fields
    const formattedProducts = (productsRes.results || []).map((p: any) => ({
      ...p,
      is_active: Boolean(p.is_active),
      is_featured: Boolean(p.is_featured),
      images: typeof p.images_json === 'string' ? JSON.parse(p.images_json || '[]') : (p.images || []),
      variants: typeof p.variants_json === 'string' ? JSON.parse(p.variants_json || '[]') : (p.variants || []),
    }));

    // Format categories: root categories with nested children
    const rawCategories: any[] = categoriesRes.results || [];
    const rootCategories = rawCategories.filter(c => !c.parent_id);
    const formattedCategories = rootCategories.map(root => ({
      ...root,
      is_active: Boolean(root.is_active),
      is_featured: Boolean(root.is_featured),
      children: rawCategories
        .filter(c => c.parent_id === root.id)
        .map(sub => ({
          ...sub,
          is_active: Boolean(sub.is_active),
          is_featured: Boolean(sub.is_featured),
        }))
    }));

    // Format shipping rates
    const formattedShippingRates = (shippingRatesRes.results || []).map((r: any) => ({
      ...r,
      is_active: Boolean(r.is_active),
    }));

    // 7. Fetch Site Content (banners, sections, etc.) if table exists
    let contentMap: Record<string, any> = {};
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS site_content (
          key TEXT PRIMARY KEY,
          value_json TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `).run();
      const contentRes = await env.DB.prepare('SELECT * FROM site_content').all();
      for (const row of (contentRes.results || []) as any[]) {
        try {
          contentMap[row.key] = JSON.parse(row.value_json);
        } catch {}
      }
    } catch (e) {
      console.warn('site_content query warning:', e);
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        settings: settingsRes ? {
          ...settingsRes,
          is_cod_enabled: Boolean((settingsRes as any).is_cod_enabled),
          is_announcement_enabled: Boolean((settingsRes as any).is_announcement_enabled),
          governorate_shipping_rates: formattedShippingRates,
        } : null,
        shipping_rates: formattedShippingRates,
        categories: formattedCategories,
        brands: brandsRes.results || [],
        products: formattedProducts,
        print_services: printServicesRes.results || [],
        banners: contentMap['banners'] || null,
        homepage_sections: contentMap['homepage_sections'] || null,
        cms_pages: contentMap['cms_pages'] || null,
        nav_items: contentMap['nav_items'] || null,
      }
    }), { headers, status: 200 });
  } catch (err: any) {
    console.error('D1 Bootstrap Error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err?.message || 'Database query failed'
    }), { headers, status: 500 });
  }
};
