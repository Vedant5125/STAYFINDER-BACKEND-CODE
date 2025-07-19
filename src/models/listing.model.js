import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    location: {
        country: {type: String, required: [true, 'Country is required'], trim: true},
        city: {type: String, required: [true, 'City is required'], trim: true},
        address: {type: String, required: [true, 'Address is required'], trim: true}
    },
    type: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'cabin', 'bungalow', 'room'],
        required: [true, 'Type is required']
    },
    thumbnail: {
        type: String, //cloudinary
        required: [true, 'Thumbnail is required']
    },
    supportImage: [{
        type: String //cloudinary
    }],
    guest: {
        type: Number,
        required: [true, 'Number of guests is required'],
        min: 1
    }
},{
    timestamps: true
});

export const listing = mongoose.model("listing", listingSchema)