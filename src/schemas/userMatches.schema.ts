import { Schema, Types } from 'mongoose';

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
  // local_score: {
  //   type: Number,
  // },
  // visitor_score: {
  //   type: Number,
  // },
  bet: [{

    scoreBet: {
      localBet: {
        type: Number,
      },
      visitorBet: {
        type: Number,
      },
      betAmount: {
        type: Number,
      }
    },
    winBet: {
      localBet: {
        type: Boolean,
      },
      visitorBet: {
        type: Boolean,

      },
      tieBet: {
        type: Boolean,
      },
      betAmount: {
        type: Number,
      }
    }

  }]
}, {
  collection: 'users_matches',
  versionKey: false
})