// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  service: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  passengers: { type: Number, required: true },
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  date: { type: Date, required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
