import mongoose from 'mongoose';

const menteeProfileSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, unique: true, index: true },
    father_contact: { type: String, default: '' },
    mother_contact: { type: String, default: '' },
    aadhaar_number: { type: String, default: '' },
    address: { type: String, default: '' },
    scholarship_details: { type: String, default: 'Yes' },
    updated_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

menteeProfileSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export default mongoose.model('MenteeProfile', menteeProfileSchema);
