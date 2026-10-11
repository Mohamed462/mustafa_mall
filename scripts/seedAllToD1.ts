import { INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_PRINT_SERVICES } from '../src/services/mockData';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '71a4f881ccd77bccb2f3d3994b35d234';
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || 'ec4b2f76-1045-4305-b3ab-883dce1eb9d2';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

async function executeQuery(sql: string, params: any[] = []) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params })
  });
  const json: any = await res.json();
  if (!json.success) {
    console.error('SQL Execution failed:', sql, params, json.errors);
    throw new Error(json.errors?.[0]?.message || 'Query failed');
  }
  return json;
}

async function main() {
  console.log('🚀 Seeding Categories, Brands, and Products to Cloudflare D1...');

  // 1. Categories
  console.log(`Inserting ${INITIAL_CATEGORIES.length} top categories and subcategories...`);
  for (const cat of INITIAL_CATEGORIES) {
    await executeQuery(`
      INSERT OR REPLACE INTO categories (
        id, parent_id, name_ar, name_en, slug, department_key, description_ar,
        image_url, icon_name, sort_order, is_active, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cat.id,
      cat.parent_id || null,
      cat.name_ar,
      cat.name_en || null,
      cat.slug,
      cat.department_key || null,
      cat.description_ar || null,
      cat.image_url || null,
      cat.icon_name || null,
      cat.sort_order ?? 0,
      cat.is_active ? 1 : 0,
      cat.is_featured ? 1 : 0
    ]);

    if (cat.children && cat.children.length > 0) {
      for (const sub of cat.children) {
        await executeQuery(`
          INSERT OR REPLACE INTO categories (
            id, parent_id, name_ar, name_en, slug, department_key, description_ar,
            image_url, icon_name, sort_order, is_active, is_featured
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          sub.id,
          cat.id,
          sub.name_ar,
          sub.name_en || null,
          sub.slug,
          sub.department_key || null,
          sub.description_ar || null,
          sub.image_url || null,
          sub.icon_name || null,
          sub.sort_order ?? 0,
          sub.is_active ? 1 : 0,
          sub.is_featured ? 1 : 0
        ]);
      }
    }
  }

  // 2. Brands
  console.log(`Inserting ${INITIAL_BRANDS.length} brands...`);
  for (const b of INITIAL_BRANDS) {
    await executeQuery(`
      INSERT OR REPLACE INTO brands (
        id, name_ar, name_en, slug, logo_url, is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      b.id,
      b.name_ar,
      b.name_en || null,
      b.slug,
      b.logo_url || null,
      b.is_featured ? 1 : 0,
      b.is_active ? 1 : 0
    ]);
  }

  // 3. Products
  console.log(`Inserting ${INITIAL_PRODUCTS.length} products...`);
  for (const p of INITIAL_PRODUCTS) {
    await executeQuery(`
      INSERT OR REPLACE INTO products (
        id, category_id, brand_id, name_ar, name_en, slug, sku, barcode,
        description_ar, price_egp, compare_at_price_egp, cost_price_egp,
        stock_quantity, low_stock_threshold, max_order_quantity,
        is_featured, is_active, images_json, variants_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      p.id,
      p.category_id,
      p.brand_id || null,
      p.name_ar,
      p.name_en || null,
      p.slug,
      p.sku,
      p.barcode || null,
      p.description_ar || p.name_ar,
      Number(p.price_egp),
      p.original_price_egp ? Number(p.original_price_egp) : null,
      p.cost_price_egp ? Number(p.cost_price_egp) : null,
      Number(p.stock_quantity ?? 0),
      Number(p.low_stock_threshold ?? 5),
      5,
      p.is_featured ? 1 : 0,
      p.is_active ? 1 : 0,
      JSON.stringify(p.images || []),
      JSON.stringify(p.variants || [])
    ]);
  }

  console.log('✅ All Categories, Brands, and Products successfully synced into Cloudflare D1!');
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
