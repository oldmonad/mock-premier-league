import mongoose from 'mongoose';
const { Schema } = mongoose;

const Setup = new Schema({
  test: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Setup', Setup);
