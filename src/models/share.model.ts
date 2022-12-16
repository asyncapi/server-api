import mongoose from 'mongoose';

const {Schema} = mongoose;

interface IShareDocument {
    doc: string;
    id: string;
    date: string;
}

const shareDocumentSchema = new Schema<IShareDocument>({
  doc: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IShareDocument>('ShareDocument', shareDocumentSchema);