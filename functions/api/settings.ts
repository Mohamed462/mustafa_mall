interface Env {
  DB?: D1Database;
}

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
    const settings: any = await env.DB.prepare('SELECT * FROM store_settings WHERE id = ?').bind('global').first();
    const rates = await env.DB.prepare('SELECT * FROM governorate_shipping_rates ORDER BY sort_order ASC, name_ar ASC').all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        settings,
        governorate_shipping_rates: rates.results || [],
      }
    }), { headers, status: 200 });
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

    // 1. Update Settings
    if (body.store_name_ar) {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO store_settings (
          id, store_name_ar, store_name_en, logo_url, phone, whatsapp_number,
          support_email, address_ar, shipping_flat_fee_egp, free_shipping_threshold_egp,
          is_cod_enabled, announcement_text_ar, is_announcement_enabled,
          category_display_style, google_client_id, updated_at
        ) VALUES (
          'global', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')
        )
      `).bind(
        body.store_name_ar,
        body.store_name_en || 'Al Mostafa Mall',
        body.logo_url || '/brand-logo-transparent.webp',
        body.phone || '01017297414',
        body.whatsapp_number || '+201017297414',
        body.support_email || 'contact@almostafamall.com',
        body.address_ar || '',
        Number(body.shipping_flat_fee_egp || 45),
        Number(body.free_shipping_threshold_egp || 750),
        body.is_cod_enabled ? 1 : 0,
        body.announcement_text_ar || '',
        body.is_announcement_enabled ? 1 : 0,
        body.category_display_style || 'images_only',
        body.google_client_id || null
      ).run();
    }

    // 2. Update Governorate Rates if provided
    if (Array.isArray(body.governorate_shipping_rates)) {
      for (const rate of body.governorate_shipping_rates) {
        await env.DB.prepare(`
          INSERT OR REPLACE INTO governorate_shipping_rates (
            id, name_ar, fee_egp, estimated_days, is_active, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          rate.id,
          rate.name_ar,
          Number(rate.fee_egp),
          rate.estimated_days,
          rate.is_active ? 1 : 0,
          rate.sort_order ?? 0
        ).run();
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Settings saved to D1' }), { headers, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { headers, status: 500 });
  }
};
