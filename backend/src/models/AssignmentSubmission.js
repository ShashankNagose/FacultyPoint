import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment_id: { type: Number, required: true, index: true },
    student_id: { type: String, required: true, trim: true },
    drive_link: { type: String, default: '', trim: true },
    attachment: {
      filename: String,
      content_type: String,
      size: Number,
      data: Buffer
    },
    submitted_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

assignmentSubmissionSchema.index({ assignment_id: 1, student_id: 1 }, { unique: true });

assignmentSubmissionSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.attachment) {
      ret.attachment = {
        filename: ret.attachment.filename,
        content_type: ret.attachment.content_type,
        size: ret.attachment.size,
        url: `/api/assignments/${ret.assignment_id}/submissions/${ret.student_id}/file`
      };
    }
    delete ret._id;
    return ret;
  }
});

export default mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
