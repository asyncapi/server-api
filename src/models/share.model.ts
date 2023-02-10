import { Schema } from 'mongoose';

export interface ShareDocument {
  id: string;
  document: string;
  expireAt?: Date;
}

export const ShareDocumentSchema = new Schema<ShareDocument>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  document: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    /* Defaults 7 days from now */
    default: new Date(new Date().valueOf() + 604800000),
    /* Remove doc 5 seconds after specified date */
    expires: 5,
  },
});
