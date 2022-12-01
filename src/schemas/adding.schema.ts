import { Schema } from 'mongoose';

export const addingSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    old_origin_score: {
        type: Number,
        required: true
    },
    old_score: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    created_time: {
        type: Date,
        required: true
    }
}, {
    collection: 'addings',
    versionKey: false
})