import fs from 'fs';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '71a4f881ccd77bccb2f3d3994b35d234';
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || 'ec4b2f76-1045-4305-b3ab-883dce1eb9d2';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

const seedSql = fs.readFileSync('d1/seed.sql', 'utf8');

// Split queries by semicolon
const queries = seedSql
  .split(';')
  .map(q => q.trim())
  .filter(q => q.length > 10);

async function runSeed() {
  console.log(`Executing ${queries.length} seed statements on Cloudflare D1...`);
  
  for (let i = 0; i < queries.length; i++) {
    const sql = queries[i];
    console.log(`Executing query ${i + 1}/${queries.length}...`);
    
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql })
    });
    
    const json = await res.json();
    if (!json.success) {
      console.error(`Query ${i + 1} failed:`, json.errors);
      process.exit(1);
    } else {
      console.log(`Query ${i + 1} succeeded! Changes:`, json.result?.[0]?.meta?.changes ?? 0);
    }
  }

  // Also seed initial products if products table is empty
  const countRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: 'SELECT COUNT(*) as count FROM products' })
  });
  const countJson = await countRes.json();
  console.log('Current products count in D1:', countJson.result?.[0]?.results?.[0]?.count ?? 0);

  console.log('🎉 D1 Database seed completed successfully!');
}

runSeed().catch(err => {
  console.error('Fatal error seeding D1:', err);
  process.exit(1);
});
