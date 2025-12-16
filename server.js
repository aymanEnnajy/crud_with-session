const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // fichiers front (HTML, JS, CSS)

// Connexion à la DB
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs_proj'
};

async function getConnection() {
  const connection = await mysql.createConnection(dbConfig);
  return connection;
}

// --------------------------------------
// API pour gérer les chats
// --------------------------------------

// GET all cats
app.get('/api/cats', async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT * FROM cats');
    await conn.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST new cat
app.post('/api/cats', async (req, res) => {
  const { name_cats, tag, description, images } = req.body;
  try {
    const conn = await getConnection();
    const [result] = await conn.execute(
      'INSERT INTO cats (name_cats, tag, description, images, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [name_cats, tag, description, images]
    );
    const [rows] = await conn.execute('SELECT * FROM cats WHERE id = ?', [result.insertId]);
    await conn.end();
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT update cat
app.put('/api/cats/:id', async (req, res) => {
  const { id } = req.params;
  const { name_cats, tag, description, images } = req.body;
  try {
    const conn = await getConnection();
    await conn.execute(
      'UPDATE cats SET name_cats=?, tag=?, description=?, images=?, updated_at=NOW() WHERE id=?',
      [name_cats, tag, description, images, id]
    );
    const [rows] = await conn.execute('SELECT * FROM cats WHERE id=?', [id]);
    await conn.end();
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE cat
app.delete('/api/cats/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await getConnection();
    await conn.execute('DELETE FROM cats WHERE id=?', [id]);
    await conn.end();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

