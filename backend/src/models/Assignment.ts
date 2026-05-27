import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  dueDate: Date;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: string;
  additionalInstructions: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaper: any;
  errorMessage?: string;
  createdAt: Date;
}

const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  questionTypes: [{ type: String }],
  numberOfQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  difficulty: { type: String, default: 'medium' },
  additionalInstructions: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  generatedPaper: { type: Schema.Types.Mixed, default: null },
  errorMessage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);