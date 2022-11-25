import { Connection, connections, Error, Model } from 'mongoose';
import config from '../config';
import { userMatchesSchema } from '../schemas';
import { IMatch } from '../types';
import { IMatchResult, IUser } from '../types/IUser';
import { MyError } from '../utils/error';
import { writeToFile } from '../utils/excel';
import { MatchService } from './match.service';
import { UserService } from './user.service';

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

  static findByUserAndMatch(
    user_id: string, match_id: string
  ) {
    this.createModel();
    if (this.model) {
      return this.model.findOne({
        match_id: match_id,
        user_id: user_id
      });
    }
    return;
  }

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
    this.createModel();
    if (this.model) {
      const [user, match, user_match]: [any, any, any] = await Promise.all([
        UserService.findById(user_id),
        MatchService.findById(match_id),
        this.findByUserAndMatch(user_id, match_id)
      ])

      if (match.date.getTime() < new Date().getTime()) {
        throw new MyError("Bet failed")
      }

      let old = 0
      if (user_match && user_match.bets) {
        if (user_match.bets.winBet) {
          old += user_match.bets.winBet.betAmount;
        }
      }

      const bet: WinBet = {
        betAmount: amount,
        value: value
      }
      user.score += (old - amount);
      if (user.score < 0) {
        throw new MyError("Bet failed")
      }
      let update = { $set: { 'bets.winBet': bet } }
      if (await this.exists(user_id, match_id)) {
        return Promise.all([
          this.model.findOneAndUpdate(
            {
              user_id: user_id,
              match_id: match_id
            }, update
          ),
          user.save()
        ])
      } else {
        return Promise.all([
          this.model.create({
            user_id: user_id,
            match_id: match_id,
            bets: { winBet: bet }
          }),
          user.save()
        ])
      }
    }
    return;
  }

  static async betScore(
    user_id: string, match_id: string,
    local: number, visitor: number, amount: number
  ) {
    this.createModel();
    if (this.model) {
      const [user, match, user_match]: [any, any, any] = await Promise.all([
        UserService.findById(user_id),
        MatchService.findById(match_id),
        this.findByUserAndMatch(user_id, match_id)
      ])

      if (match.date.getTime() < new Date().getTime()) {
        throw new MyError("Bet failed")
      }

      let old = 0
      if (user_match && user_match.bets) {
        if (user_match.bets.scoreBet) {
          old += user_match.bets.scoreBet.betAmount;
        }
      }

      const bet: ScoreBet = {
        betAmount: amount,
        localBet: local,
        visitorBet: visitor
      }
      user.score += (old - amount)
      if (user.score < 0) {
        throw new MyError("Bet failed")
      }
      let update = { $set: { 'bets.scoreBet': bet } }
      if (await this.exists(user_id, match_id)) {
        return Promise.all([
          this.model.findOneAndUpdate(
            {
              user_id: user_id,
              match_id: match_id
            }, update
          ),
          user.save()
        ]);
      } else {
        return Promise.all([
          this.model.create({
            user_id: user_id,
            match_id: match_id,
            bets: { scoreBet: bet }
          }),
          user.save()
        ])
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

  static async calculatePoint() {
    this.createModel()
    const users: any = {}; const matchs: any = {}
    const rateScore = 1; const rateWinner = 0.5;
    if (this.model) {
      const user_matchs = await this.model.find()

      for (let user_match of user_matchs) {
        let diff = 0;
        const user_id = user_match.user_id;
        const match_id = user_match.match_id;

        if (!users[user_id]) {
          users[user_id] = await UserService.findById(user_id);
          users[user_id].score = users[user_id].origin_score
        }
        if (!matchs[match_id]) {
          matchs[match_id] = await MatchService.findById(match_id);
        }
        const user: IUser = users[user_id];
        const match: IMatch = matchs[match_id];

        if (match && user && match.has_played === true) {
          if (user_match.bets && user_match.bets.scoreBet) {
            const isScoreOke =
              match.local_team.result === user_match.bets.scoreBet.localBet &&
              match.visiting_team.result === user_match.bets.scoreBet.visitorBet
            if (isScoreOke) {
              diff = Number(user_match.bets.scoreBet.betAmount) * rateScore;
            } else {
              diff = -Number(user_match.bets.scoreBet.betAmount);
            }
          }
          if (user_match.bets && user_match.bets.winBet) {
            let result = "tie"
            if (Number(match.local_team.result) > Number(match.visiting_team.result)) {
              result = "local"
            }
            if (Number(match.local_team.result) < Number(match.visiting_team.result)) {
              result = "visitor"
            }
            const isScoreOke = user_match.bets.winBet.value === result;
            if (isScoreOke) {
              diff += Number(user_match.bets.winBet.betAmount) * rateWinner;
            } else {
              diff -= Number(user_match.bets.winBet.betAmount);
            }
          }
          user.score += diff
        }
        if (match && user && match.has_played === false) {
          if (user_match.bets && user_match.bets.winBet) {
            if (user_match.bets.winBet.betAmount) {
              user.score -= user_match.bets.winBet.betAmount
            }
          }
          if (user_match.bets && user_match.bets.scoreBet) {
            if (user_match.bets.scoreBet.betAmount) {
              user.score -= user_match.bets.scoreBet.betAmount
            }
          }
        }
      }
      for (const key in users) {
        const element = users[key];
        await element.save()
      }
    }
  }

  static async generateExcel(now: Date) {
    this.createModel()
    if (this.model) {
      const startDate = new Date(
        now.getFullYear(), now.getMonth(),
        now.getDate() - 1, 15
      )
      const endDate = new Date(
        now.getFullYear(), now.getMonth(),
        now.getDate(), 15
      )
      const matches = await MatchService.findAll();

      if (!matches) return;

      const newMatches = matches.filter(match => {
        return match.date.getTime() >= startDate.getTime()
          && match.date.getTime() <= endDate.getTime()
      });
      const matchIds = newMatches?.map(v => v._id);
      const bets = await this.model.find({ match_id: { $in: matchIds } })
      const users = await UserService.findAll()
      if (!users) return;
      const changes = []
      for (const user of users) {
        let changed = 0;
        const newBets = bets.filter(v => v.user_id === user._id)
        for (const bet of newBets) {
          const match = matches.find(v => v._id === bet.match_id);
          if (!match) return;
          const scoreLocal = match.local_team.result;
          const scoreVisitor = match.visiting_team.result;
          let winner = "tie"
          if (scoreLocal > scoreVisitor) winner = "local"
          if (scoreLocal < scoreVisitor) winner = "visitor"
          if (bet.bets && bet.bets.winBet && bet.bets.winBet.betAmount) {
            if (winner === bet.bets.winBet.value) {
              changed += bet.bets.winBet.betAmount * 0.5
            } else {
              changed -= bet.bets.winBet.betAmount
            }
          }
          if (bet.bets && bet.bets.scoreBet && bet.bets.scoreBet.betAmount) {
            if (scoreLocal === bet.bets.scoreBet.localBet && scoreVisitor === bet.bets.scoreBet.visitorBet) {
              changed += bet.bets.scoreBet.betAmount * 1
            } else {
              changed -= bet.bets.scoreBet.betAmount
            }
          }
        }
        const item = {
          names: user.names,
          surnames: user.surnames,
          phone: user._id,
          currentScore: user.score,
          changed: changed
        }
        changes.push(item)
      }
      changes.sort((a, b) => b.changed - a.changed)
      const result = {
        metadata: {
          generatedTime: now.toLocaleString(),
          from: startDate.toLocaleString(),
          to: endDate.toLocaleString()
        },
        data: changes
      }
      await writeToFile(result)
    } else return;
  }

  private static validateConnection() {
    if (!this.db) {
      this.db = connections.find((conn) => {
        return conn.name === this.dbName;
      })
    }
  }
}