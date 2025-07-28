import mongoose, { Schema } from 'mongoose';

const bookingSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'User is required']
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
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

const Booking = mongoose.model("Booking", bookingSchema)
export default Booking;