import { Types } from 'mongoose';
export interface IUser {
  _id: string,
  password: string,
  names: string,
  surnames: string,
  score: number,
  origin_score: number,
  last_logined: Date,
  selected_teams: {
    champion: string,
    runner_up: string,
    third_place: string
  }
}

interface IScoreBet {
  localBet: number,
  visitorBet: number,
  betAmount: number
}

interface IWinBet {
  value: string,
  betAmount: number,
}

interface IBet {
  scoreBet?: IScoreBet,
  winBet?: IWinBet
}

export interface IMatchResult {
  _id: Types.ObjectId,
  user_id: string,
  match_id: string,
  bets: IBet
}