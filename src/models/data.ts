import mongoose from 'mongoose';

const {Schema} = mongoose;

interface IData {
    doc: string;
    docId: string;
    date: string;
}

const dataSchema = new Schema<IData>({
  doc: {
    type: String,
    required: true,
  },
  docId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true
  }
});

export default mongoose.model<IData>('Data', dataSchema);