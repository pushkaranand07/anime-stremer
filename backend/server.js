require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./database');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const streamingRoutes = require('./routes/streaming');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/streaming', streamingRoutes);

// Protected Favorites Routes
// GET all favorites for the logged-in user
app.get('/api/favorites', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  db.all('SELECT * FROM favorites WHERE user_id = ? ORDER BY added_at DESC', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST add a favorite for the logged-in user
app.post('/api/favorites', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  const { anime_id, title, image_url, score, episodes } = req.body;
  
  if (!anime_id || !title) {
    return res.status(400).json({ error: 'anime_id and title are required' });
  }

  db.run(
    `INSERT INTO favorites (user_id, anime_id, title, image_url, score, episodes) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, anime_id, title, image_url, score, episodes],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Already in favorites' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, anime_id, title });
    }
  );
});

// DELETE remove a favorite for the logged-in user
app.delete('/api/favorites/:anime_id', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  const { anime_id } = req.params;

  db.run('DELETE FROM favorites WHERE user_id = ? AND anime_id = ?', [userId, anime_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found or unauthorized' });
    res.json({ deleted: true });
  });
});

// Health check
app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`Production-ready Backend running on http://localhost:${PORT}`);
});
