import express from 'express';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import StudentUpload from '../models/StudentUpload.js';
import { buildAttachment, sendAttachment, uploadSingleFile } from '../middleware/upload.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const assignments = await Assignment.find().sort({ created_at: 1 });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
});

router.post('/', uploadSingleFile, async (req, res, next) => {
  try {
    const { title, subject, description, due_date } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Assignment title and description are required.' });
    }

    const assignment = await Assignment.create({
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: title.trim(),
      subject: subject?.trim() || 'General',
      description: description.trim(),
      due_date: due_date || null,
      attachment: buildAttachment(req.file)
    });

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/file', async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ id: Number(req.params.id) });
    sendAttachment(res, assignment?.attachment);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const assignmentId = Number(req.params.id);
    await Assignment.deleteOne({ id: assignmentId });
    await AssignmentSubmission.deleteMany({ assignment_id: assignmentId });
    await StudentUpload.deleteMany({ assignment_id: assignmentId });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get('/:id/submissions', async (req, res, next) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment_id: Number(req.params.id) }).sort({ submitted_at: 1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/submissions', uploadSingleFile, async (req, res, next) => {
  try {
    const assignmentId = Number(req.params.id);
    const { student_id } = req.body;

    if (!student_id || !req.file) {
      return res.status(400).json({ message: 'Student ID and a submission file are required.' });
    }

    const assignment = await Assignment.findOne({ id: assignmentId });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignment_id: assignmentId, student_id },
      {
        assignment_id: assignmentId,
        student_id,
        drive_link: '',
        attachment: buildAttachment(req.file),
        submitted_at: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await StudentUpload.findOneAndUpdate(
      { assignment_id: assignmentId, student_id },
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        assignment_id: assignmentId,
        student_id,
        title: `Submission: ${assignment.title}`,
        drive_link: '',
        attachment: buildAttachment(req.file),
        created_at: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/submissions/:studentId/file', async (req, res, next) => {
  try {
    const submission = await AssignmentSubmission.findOne({
      assignment_id: Number(req.params.id),
      student_id: req.params.studentId
    });
    sendAttachment(res, submission?.attachment);
  } catch (error) {
    next(error);
  }
});

export default router;
