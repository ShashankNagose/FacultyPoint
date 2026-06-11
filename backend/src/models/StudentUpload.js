import mongoose from 'mongoose';

const studentUploadSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    student_id: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    drive_link: { type: String, default: '', trim: true },
    assignment_id: { type: Number, default: null },
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

studentUploadSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret.attachment) {
      ret.attachment = {
        filename: ret.attachment.filename,
        content_type: ret.attachment.content_type,
        size: ret.attachment.size,
        url: `/api/students/${ret.student_id}/uploads/${ret.id}/file`
      };
    }
    delete ret._id;
    return ret;
  }
});

export default mongoose.model('StudentUpload', studentUploadSchema);
