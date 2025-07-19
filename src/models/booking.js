import mongoose, { Schema } from 'mongoose';
import { listing } from './listing.model';

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, 'User is required']
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "listing",
        required: [true, 'Listing is required']
    },
    checkIn: {
        type: Date,
        required: [true, 'Check-in date is required']
    },
    checkOut: {
        type: Date,
        required: [true, 'Check-out date is required']
    },
    guests: {
        type: Number,
        required: [true, 'Number of guests is required'],
        min: 1
    },
    totalPrice: {
        type: Number
    },
},{
    timestamps: true
})

export const booking = mongoose.model("booking", bookingSchema)