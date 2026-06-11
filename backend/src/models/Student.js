import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    is_mentee: { type: Boolean, default: false }
  },
  { versionKey: false }
);

studentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export default mongoose.model('Student', studentSchema);
