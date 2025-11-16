// Quick script to check database contents
// Run: node check_db.js

const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',//enter ypur password
  database: 'inventory_db'
});

console.log('🔍 Checking database...\n');

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('\n💡 Make sure:');
    console.log('   1. MySQL server is running');
    console.log('   2. Database "inventory_db" exists');
    console.log('   3. Password is correct');
    process.exit(1);
  }
  
  console.log('✅ Connected to database\n');
  
  // Get all items
  db.query('SELECT * FROM items ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('❌ Error:', err.message);
      db.end();
      return;
    }
    
    console.log('📊 Database Contents:');
    console.log('═'.repeat(70));
    
    if (results.length === 0) {
      console.log('⚠️  Database is EMPTY - No items found');
      console.log('   Add items from the frontend to see them here');
    } else {
      console.log(`✅ Total Items: ${results.length}\n`);
      
      // Display in table format
      results.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}`);
        console.log(`   Name: ${item.name}`);
        console.log(`   Quantity: ${item.quantity}`);
        console.log(`   Price: ₹${item.price}`);
        console.log('');
      });
    }
    
    console.log('═'.repeat(70));
    db.end();
    console.log('\n✅ Check complete!');
  });
});

