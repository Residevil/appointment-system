import express from 'express';
import {
  getAvailableSlots,
  createAppointment,
  getAppointmentByBookingId,
  getAllAppointments,
  updateAppointment,
  cancelAppointment
} from '../controllers/appointmentController';

const router = express.Router();

// Get available time slots for a specific date
router.get('/available-slots/:date', getAvailableSlots);

// Create a new appointment
router.post('/create', createAppointment);

// Get appointment by booking ID
router.get('/booking/:bookingId', getAppointmentByBookingId);

// Get all appointments (for admin purposes)
router.get('/all', getAllAppointments);

// Update an existing appointment
router.put('/update/:bookingId', updateAppointment);

// Cancel an existing appointment
router.put('/cancel/:bookingId', cancelAppointment);

export default router; 