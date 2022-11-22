import { Schema, Types } from 'mongoose';

const scoreBetSchema = new Schema({
  localBet: {
    type: Number,
    required: false
  },
  visitorBet: {
    type: Number,
    required: false
  },
  betAmount: {
    type: Number,
    required: false
  }
})

const winBetSchema = new Schema({
  winner: {
    type: String,
    required: false
  },
  betAmount: {
    type: Number,
    required: false
  }
})

export const userMatchesSchema = new Schema({
  _id: {
    type: Types.ObjectId,
    required: true,
    auto: true
  },
  user_id: {
    type: String,
    required: true,
  },
  match_id: {
    type: String,
    required: true,
  },
  bets: {
    scoreBet: {
      type: scoreBetSchema,
      required: false
    },
    winBet: {
      type: winBetSchema,
      required: false
    }
  }
}, {
  collection: 'users_matches',
  versionKey: false
})