import express from 'express';
import MenteeProfile from '../models/MenteeProfile.js';
import MenteeSubmission from '../models/MenteeSubmission.js';

const router = express.Router();

router.get('/submissions', async (_req, res, next) => {
  try {
    const submissions = await MenteeSubmission.find().sort({ created_at: 1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

router.post('/submissions', async (req, res, next) => {
  try {
    const { student_id, student_name, issue_type, issue_detail, submitted_date } = req.body;
    if (!student_id || !issue_type || !issue_detail?.trim() || !submitted_date) {
      return res.status(400).json({ message: 'Student, type, details, and date are required.' });
    }

    const submission = await MenteeSubmission.create({
      id: Date.now() + Math.floor(Math.random() * 1000),
      student_id,
      student_name: student_name || student_id,
      issue_type,
      issue_detail: issue_detail.trim(),
      submitted_date
    });

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
});

router.get('/:studentId/profile', async (req, res, next) => {
  try {
    const profile = await MenteeProfile.findOne({ student_id: req.params.studentId });
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.put('/:studentId/profile', async (req, res, next) => {
  try {
    const profile = await MenteeProfile.findOneAndUpdate(
      { student_id: req.params.studentId },
      {
        ...req.body,
        student_id: req.params.studentId,
        updated_at: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;
