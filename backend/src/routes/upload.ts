import { Router } from 'express';

const router = Router();

// File upload routes (to be implemented)
router.post('/image', (req, res) => {
  res.json({ message: 'Image upload - to be implemented' });
});

router.post('/csv', (req, res) => {
  res.json({ message: 'CSV upload - to be implemented' });
});

export default router;
