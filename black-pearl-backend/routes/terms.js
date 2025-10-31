// routes/terms.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve terms and conditions PDF
router.get('/terms-and-conditions.pdf', (req, res) => {
  const filePath = path.join(__dirname, '../public/terms-and-conditions.pdf');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Terms PDF not found:', err);
      res.status(404).json({ error: 'Terms and conditions document not found' });
    }
  });
});

export default router;