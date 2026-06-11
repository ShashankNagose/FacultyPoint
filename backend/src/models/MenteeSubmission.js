import mongoose from 'mongoose';

const menteeSubmissionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    student_id: { type: String, required: true, index: true },
    student_name: { type: String, required: true },
    issue_type: { type: String, enum: ['suggestion', 'complaint', 'requirement'], required: true },
    issue_detail: { type: String, required: true },
    submitted_date: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

menteeSubmissionSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  }
});

export default mongoose.model('MenteeSubmission', menteeSubmissionSchema);
