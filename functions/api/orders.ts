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
  const { env, request } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const orderNumber = url.searchParams.get('order_number');

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, message: 'D1 not bound' }), { headers, status: 200 });
  }

  try {
    if (id || orderNumber) {
      let query = 'SELECT * FROM orders WHERE ';
      const params: any[] = [];
      if (id) {
        query += 'id = ?';
        params.push(id);
      } else {
        query += 'order_number = ?';
        params.push(orderNumber);
      }
      query += ' LIMIT 1';

      const order: any = await env.DB.prepare(query).bind(...params).first();
      if (!order) {
        return new Response(JSON.stringify({ success: false, error: 'Order not found' }), { headers, status: 404 });
      }
      return new Response(JSON.stringify({
        success: true,
        data: {
          ...order,
          items: typeof order.items_json === 'string' ? JSON.parse(order.items_json || '[]') : [],
        }
      }), { headers, status: 200 });
    }

    const res = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100').all();
    const formatted = (res.results || []).map((o: any) => ({
      ...o,
      items: typeof o.items_json === 'string' ? JSON.parse(o.items_json || '[]') : [],
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

    // Check if it's an update status request
    if (body.action === 'update_status' && body.id) {
      await env.DB.prepare(`
        UPDATE orders 
        SET order_status = ?, updated_at = datetime('now')
        WHERE id = ?
      `).bind(body.order_status, body.id).run();

      return new Response(JSON.stringify({ success: true, message: 'Order status updated' }), { headers, status: 200 });
    }

    // Otherwise, create / replace order
    const id = body.id || `ord-${Date.now()}`;
    const orderNumber = body.order_number || `MSM-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT OR REPLACE INTO orders (
        id, order_number, customer_id, customer_name, customer_phone, customer_email,
        governorate, city, shipping_address, delivery_notes,
        payment_method, payment_status, order_status,
        subtotal_egp, discount_egp, coupon_code, shipping_fee_egp, total_egp,
        items_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      orderNumber,
      body.customer_id || null,
      body.customer_name || 'عميل المتجر',
      body.customer_phone || '',
      body.customer_email || null,
      body.governorate || '',
      body.city || '',
      body.shipping_address || '',
      body.delivery_notes || null,
      body.payment_method || 'cod',
      body.payment_status || 'pending',
      body.order_status || 'pending_confirmation',
      Number(body.subtotal_egp || 0),
      Number(body.discount_egp || 0),
      body.coupon_code || null,
      Number(body.shipping_fee_egp || 0),
      Number(body.total_egp || 0),
      JSON.stringify(body.items || []),
      body.created_at || now,
      now
    ).run();

    // Optional: Deduct inventory in products table
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        if (item.product_id && item.quantity) {
          try {
            await env.DB.prepare(`
              UPDATE products 
              SET stock_quantity = MAX(0, stock_quantity - ?), updated_at = datetime('now')
              WHERE id = ?
            `).bind(Number(item.quantity), item.product_id).run();
          } catch (e) {
            console.error('Failed to deduct stock for product:', item.product_id, e);
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        ...body, 
        id, 
        order_number: orderNumber 
      } 
    }), { headers, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { headers, status: 500 });
  }
};
