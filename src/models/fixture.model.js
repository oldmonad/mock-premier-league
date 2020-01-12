import mongoose from 'mongoose';
const { Schema } = mongoose;

const FixtureSchema = new Schema({
  time: {
    type: Date,
    required: true,
  },
  homeTeam: {
    type: Schema.Types.Mixed,
    ref: 'teams',
  },
  awayTeam: {
    type: Schema.Types.Mixed,
    ref: 'teams',
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'completed'],
  },
  slug: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.Mixed,
    ref: 'users',
  },
});

export default mongoose.model('Fixture', FixtureSchema);
