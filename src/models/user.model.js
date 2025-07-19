import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],

    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    profileImage: {
        type: String, //cloudinary
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    listings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "listing"
    }],
    bookingList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "booking"
    }],
    wishList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "listing"
    },
    refreshToken: {
        type: String
    }
},{
    timestamps: true
});

//dont use arrow function here, it dont give this reference
userSchema.pre('save', async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.passwort = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.refreshAccessToken = function() {
    jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        role: this.role
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User = mongoose.model("user", userSchema)