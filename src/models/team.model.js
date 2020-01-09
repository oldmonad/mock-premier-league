import mongoose from 'mongoose';
const { Schema } = mongoose;

const TeamSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  stadium: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.Mixed,
    ref: 'users',
  },
});

export default mongoose.model('Team', TeamSchema);
