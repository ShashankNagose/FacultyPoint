import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, default: 'General', trim: true },
    description: { type: String, required: true, trim: true },
    due_date: { type: String, default: null },
    attachment: {
      filename: String,
      content_type: String,
      size: Number,
      data: Buffer
    },
    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

assignmentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret.attachment) {
      ret.attachment = {
        filename: ret.attachment.filename,
        content_type: ret.attachment.content_type,
        size: ret.attachment.size,
        url: `/api/assignments/${ret.id}/file`
      };
    }
    delete ret._id;
    return ret;
  }
});

export default mongoose.model('Assignment', assignmentSchema);
