import { Connection, connections, Error, Model } from 'mongoose';
import { v4 as uuidv4 } from "uuid"

import config from '../config';
import { addingSchema } from '../schemas';
import { IAdding } from '../types';

export class AddingService {
    private static dbName: string = config.dbNameApp;
    private static db: (Connection | undefined) = connections.find((conn) => {
        return conn.name === this.dbName;
    })
    private static model: (Model<IAdding> | null) = this.db === undefined ? null : this.db.model<IAdding>('adding', addingSchema);

    constructor() { }

    static create(time: Date, user_id: string, amount: number, old_origin_score: number, old_score: number) {
        this.createModel();
        if (this.model) {
            return this.model.create({
                amount: amount, user_id: user_id,
                old_score: old_score, created_time: time,
                old_origin_score, _id: uuidv4()
            });
        }
        return;
    }

    private static createModel() {
        this.validateConnection();
        if (!this.model) {
            this.model = this.db === undefined ? null : this.db.model<IAdding>('adding', addingSchema);
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