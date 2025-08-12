import asyncHandler from "../utils/asyncHandler.js";
import Listing from "../models/listing.model.js";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";


const getBookedDates = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookings = await Booking.find({ listing: id });

  const bookedDates = bookings.map(b => ({
    checkIn: b.checkIn,
    checkOut: b.checkOut
  }));

  res.status(200).json(new apiResponse(200, bookedDates, "Booked dates fetched"));
});

const bookStay = asyncHandler( async(req, res) =>{
    const user = await User.findById(req.user._id);
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;
    if (!checkIn || !checkOut || !guests) {
        throw new apiError(400, "All fields are required");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new apiError(404, "Listing not found");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkInDate >= checkOutDate) {
        throw new apiError(400, "Check-out must be after check-in");
    }

    const overlapping = await Booking.find({
        listing: id,
        $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
        ]
    });
    if (overlapping.length > 0) {
        throw new apiError(409, "Listing already booked for selected dates");
    }

    const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = listing.price * nights;

    const newBooking = await Booking.create({
        user: user.id,
        listing: id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
    });

    return res
    .status(201)
    .json(new apiResponse(200, newBooking, "Stay booked successfully"));

})

const getAllBookings = asyncHandler(async(req, res) =>{
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId }).populate('listing');
    console.log(bookings);
    return res
        .status(200)
        .json(new apiResponse(200, bookings, "User bookings fetched successfully"));
})

export { getBookedDates, bookStay, getAllBookings }