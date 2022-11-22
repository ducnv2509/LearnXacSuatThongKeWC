import { Connection, connections, Error, Model } from 'mongoose';

import config from '../config';
import { IMatch } from '../types';
import { matchSchema } from '../schemas';

export class MatchService {
  private static dbName: string = config.dbNameApp;
  private static db: (Connection | undefined) = connections.find((conn) => {
    return conn.name === this.dbName;
  })
  private static model: (Model<IMatch> | null) = this.db === undefined ? null : this.db.model<IMatch>('match', matchSchema);

  constructor() { }

  static findAll() {
    this.createModel();
    if (this.model) {
      return this.model.find();
    }
    return;
  }

  static findById(id: string) {
    this.createModel();
    if (this.model) {
      return this.model.findById(id);
    }
    return;
  }

  static updateResult(id: string, localScore: number, visitingScore: number) {
    if (this.model) {
      let update = {
        $set: {
          'has_played': true,
          'local_team.result': localScore,
          'visiting_team.result': visitingScore,
        }
      }
      return this.model.findOneAndUpdate(
        { _id: id }, update
      );
    }
    return;
  }

  private static createModel() {
    this.validateConnection();
    if (!this.model) {
      this.model = this.db === undefined ? null : this.db.model<IMatch>('match', matchSchema);
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