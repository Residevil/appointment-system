"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appointmentController_1 = require("../controllers/appointmentController");
const router = express_1.default.Router();
// Get available time slots for a specific date
router.get('/available-slots/:date', appointmentController_1.getAvailableSlots);
// Create a new appointment
router.post('/create', appointmentController_1.createAppointment);
// Get appointment by booking ID
router.get('/booking/:bookingId', appointmentController_1.getAppointmentByBookingId);
// Get all appointments (for admin purposes)
router.get('/all', appointmentController_1.getAllAppointments);
exports.default = router;
