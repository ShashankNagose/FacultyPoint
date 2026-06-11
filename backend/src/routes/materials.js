import express from 'express';
import Material from '../models/Material.js';
import { buildAttachment, sendAttachment, uploadSingleFile } from '../middleware/upload.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const materials = await Material.find().sort({ created_at: 1 });
    res.json(materials);
  } catch (error) {
    next(error);
  }
});

router.post('/', uploadSingleFile, async (req, res, next) => {
  try {
    const { title, subject } = req.body;
    if (!title?.trim() || !req.file) {
      return res.status(400).json({ message: 'Title and a file are required.' });
    }

    const material = await Material.create({
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: title.trim(),
      subject: subject?.trim() || 'General',
      attachment: buildAttachment(req.file)
    });

    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/file', async (req, res, next) => {
  try {
    const material = await Material.findOne({ id: Number(req.params.id) });
    sendAttachment(res, material?.attachment);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Material.deleteOne({ id: Number(req.params.id) });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
