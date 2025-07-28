import mongoose, {Schema} from 'mongoose';

const listingSchema = new Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
        type: String, //cloudinary
        default: []
    }],
    guest: {
        type: Number,
        required: [true, 'Number of guests is required'],
        min: 1
    }
},{
    timestamps: true
});

const Listing = mongoose.model("Listing", listingSchema)
export default Listing;