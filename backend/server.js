const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Saurav@5556', 
  database: 'inventory_db'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Get all items
app.get('/items', (req, res) => {
  db.query('SELECT * FROM items ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('❌ Database SELECT error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`📋 Fetched ${results.length} items from database`);
    res.json(results);
  });
});

// Add item
app.post('/items', (req, res) => {
  const { name, quantity, price } = req.body;

  // Validate input
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Item name is required' });
  }
  if (quantity === undefined || quantity === null || quantity < 0) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }
  if (price === undefined || price === null || price < 0) {
    return res.status(400).json({ error: 'Valid price is required' });
  }

  db.query(
    'INSERT INTO items (name, quantity, price) VALUES (?, ?, ?)',
    [name.trim(), parseInt(quantity), parseFloat(price)],
    (err, results) => {
      if (err) {
        console.error('❌ Database INSERT error:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log('✅ Item saved to database:', {
        id: results.insertId,
        name: name.trim(),
        quantity: parseInt(quantity),
        price: parseFloat(price)
      });
      res.status(201).json({ 
        id: results.insertId, 
        name: name.trim(), 
        quantity: parseInt(quantity), 
        price: parseFloat(price) 
      });
    }
  );
});

// Delete item
app.delete('/items/:id', (req, res) => {
  db.query(
    'DELETE FROM items WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure MySQL database is running and inventory_db database exists');
});
