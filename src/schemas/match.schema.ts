import { Schema } from 'mongoose';

const scoreSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  result: {
    type: Number,
    required: true
  }
})

export const matchSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  group: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  has_played: {
    type: Boolean,
    required: true,
  },
  local_team: {
    type: scoreSchema,
    required: true
  },
  visiting_team: {
    type: scoreSchema,
    required: true
  }
}, {
  collection: 'matches',
  versionKey: false
})