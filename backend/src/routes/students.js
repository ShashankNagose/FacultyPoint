import express from 'express';
import StudentUpload from '../models/StudentUpload.js';
import { buildAttachment, sendAttachment, uploadSingleFile } from '../middleware/upload.js';

const router = express.Router();

router.get('/:studentId/uploads', async (req, res, next) => {
  try {
    const uploads = await StudentUpload.find({ student_id: req.params.studentId }).sort({ created_at: 1 });
    res.json(uploads);
  } catch (error) {
    next(error);
  }
});

router.post('/:studentId/uploads', uploadSingleFile, async (req, res, next) => {
  try {
    const { title, assignment_id } = req.body;
    if (!title?.trim() || !req.file) {
      return res.status(400).json({ message: 'Title and a file are required.' });
    }

    const upload = await StudentUpload.create({
      id: Date.now() + Math.floor(Math.random() * 1000),
      student_id: req.params.studentId,
      title: title.trim(),
      assignment_id: assignment_id ? Number(assignment_id) : null,
      attachment: buildAttachment(req.file)
    });

    res.status(201).json(upload);
  } catch (error) {
    next(error);
  }
});

router.get('/:studentId/uploads/:uploadId/file', async (req, res, next) => {
  try {
    const upload = await StudentUpload.findOne({
      student_id: req.params.studentId,
      id: Number(req.params.uploadId)
    });
    sendAttachment(res, upload?.attachment);
  } catch (error) {
    next(error);
  }
});

export default router;
