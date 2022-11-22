import { Connection, connections, Error, Model } from 'mongoose';

import config from '../config';
import { userMatchesSchema } from '../schemas';
import { IMatchResult } from '../types/IUser';

export interface WinBet {
  value: string | null,
  betAmount: number | null
}


export interface ScoreBet {
  localBet: number | null,
  visitorBet: number | null,
  betAmount: number | null
}


export interface BetData {
  user_id: string,
  match_id: string
  bets: {
    winBet: WinBet,
    scoreBet: ScoreBet
  }
}

export class UserMatchesService {
  private static dbName: string = config.dbNameApp;
  private static db: (Connection | undefined) = connections.find((conn) => {
    return conn.name === this.dbName;
  })
  private static model: (Model<IMatchResult> | null) = this.db === undefined ? null : this.db.model<IMatchResult>('user_matches', userMatchesSchema);

  constructor() { }

  static findAllByUser(user_id: string, projection = {}) {
    this.createModel();
    if (this.model) {
      return this.model.find({ user_id: user_id }, projection);
    }
    return;
  }
  static findAllByMatch(match_id: string, projection = {}) {
    this.createModel();
    if (this.model) {
      return this.model.find({ match_id: match_id }, projection);
    }
    return;
  }

  static create(matchData: BetData) {
    this.createModel();
    if (this.model) {
      return this.model.create(matchData);
    }
    return;
  }

  static async createAll(matches: BetData[]) {

    for (let match of matches) {
      if (!(await this.exists(match.user_id, match.match_id))) {
        await this.create(match)
      }
    }
  }

  static async exists(user_id: string, match_id: string) {
    this.createModel()
    if (this.model) {
      let user = await this.model.findOne({ user_id: user_id, match_id: match_id }).lean();
      return user ? true : false;
    }
    return;
  }

  static async betWinner(
    user_id: string, match_id: string,
    value: string, amount: number
  ) {
    if (this.model) {
      const bet: WinBet = {
        betAmount: amount,
        value: value
      }
      let update = { $set: { 'bets.winBet': bet } }
      if (await this.exists(user_id, match_id)) {
        return this.model.findOneAndUpdate(
          {
            user_id: user_id,
            match_id: match_id
          }, update
        );
      } else {
        return this.model.create({
          user_id: user_id,
          match_id: match_id,
          bets: { winBet: bet }
        })
      }
    }
    return;
  }

  static async betScore(
    user_id: string, match_id: string,
    local: number, visitor: number, amount: number
  ) {
    if (this.model) {
      const bet: ScoreBet = {
        betAmount: amount,
        localBet: local,
        visitorBet: visitor
      }
      let update = { $set: { 'bets.scoreBet': bet } }
      if (await this.exists(user_id, match_id)) {
        return this.model.findOneAndUpdate(
          {
            user_id: user_id,
            match_id: match_id
          }, update
        );
      } else {
        return this.model.create({
          user_id: user_id,
          match_id: match_id,
          bets: { scoreBet: bet }
        })
      }
    }
    return;
  }

  private static createModel() {
    this.validateConnection();
    if (!this.model) {
      this.model = this.db === undefined ? null : this.db.model<IMatchResult>('user_matches', userMatchesSchema);
    }
    if (!this.model) {
      throw new Error('Database not connected');
    }
  }

  private static validateConnection() {
    if (!this.db) {
      this.db = connections.find((conn) => {
        return conn.name === this.dbName;
      })
    }
  }
}