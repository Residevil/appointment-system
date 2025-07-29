import express from 'express';
import {
  getAvailableSlots,
  createAppointment,
  getAppointmentByBookingId,
  getAllAppointments
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

export default router; 