import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    fullname: {
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
    profile: {
        type: String, //cloudinary
        required: [true, 'Profile image is required']
    },
    role:{
        type: String,
        enum: ['user', 'host'],
        default: 'user',
    },
    listings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
    }],
    bookingList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    }],
    wishList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
    }],
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
    this.password = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
            _id: this._id,
            email: this.email,
            phone: this.phone,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
                _id: this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "1d"
            }
        )
}


const User = mongoose.model("User", userSchema)
export default User;