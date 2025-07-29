"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAppointments = exports.getAppointmentByBookingId = exports.createAppointment = exports.getAvailableSlots = void 0;
const Appointment_1 = require("../models/Appointment");
const emailService_1 = require("../utils/emailService");
// Helper function to create a date in local timezone
const createLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
};
// Helper function to format date for response
const formatDateForResponse = (date) => {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};
// Helper function to get tomorrow's date
const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
};
// Get available time slots for a specific date
const getAvailableSlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.params;
        if (!date) {
            return res.status(400).json({ error: 'Date parameter is required' });
        }
        const selectedDate = createLocalDate(date);
        const tomorrow = getTomorrow();
        // Check if the selected date is in the past
        if (selectedDate < tomorrow) {
            return res.status(400).json({
                error: 'Cannot book appointments for today or past dates. Please select a future date.'
            });
        }
        // Get all booked appointments for the selected date
        const bookedAppointments = yield Appointment_1.Appointment.find({
            appointmentDate: {
                $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
            },
            status: { $ne: 'cancelled' }
        });
        // Define business hours (9 AM to 5 PM)
        const businessHours = {
            start: 9,
            end: 17
        };
        // Generate all possible time slots (30-minute intervals)
        const allSlots = [];
        for (let hour = businessHours.start; hour < businessHours.end; hour++) {
            allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        // Filter out booked slots
        const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);
        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
        res.json({
            date,
            availableSlots,
            totalSlots: allSlots.length,
            bookedSlots: bookedTimes.length,
            availableCount: availableSlots.length
        });
    }
    catch (error) {
        console.error('Error getting available slots:', error);
        res.status(500).json({ error: 'Failed to get available slots' });
    }
});
exports.getAvailableSlots = getAvailableSlots;
// Create a new appointment
const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerName, customerEmail, appointmentDate, appointmentTime, duration, notes } = req.body;
        // Validate required fields
        if (!customerName || !customerEmail || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                error: 'Missing required fields: customerName, customerEmail, appointmentDate, appointmentTime'
            });
        }
        // Create date in local timezone to avoid timezone issues
        const localAppointmentDate = createLocalDate(appointmentDate);
        const tomorrow = getTomorrow();
        // Check if the appointment date is in the past
        if (localAppointmentDate < tomorrow) {
            return res.status(400).json({
                error: 'Cannot book appointments for today or past dates. Please select a future date.'
            });
        }
        // Check if the slot is already booked
        const existingAppointment = yield Appointment_1.Appointment.findOne({
            appointmentDate: localAppointmentDate,
            appointmentTime,
            status: { $ne: 'cancelled' }
        });
        if (existingAppointment) {
            return res.status(409).json({ error: 'This time slot is already booked' });
        }
        // Create new appointment
        const appointment = new Appointment_1.Appointment({
            customerName,
            customerEmail,
            appointmentDate: localAppointmentDate,
            appointmentTime,
            duration: duration || 30,
            notes
        });
        yield appointment.save();
        // Send confirmation email
        try {
            yield (0, emailService_1.sendConfirmationEmail)(appointment);
        }
        catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the request if email fails
        }
        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: {
                bookingId: appointment.bookingId,
                customerName: appointment.customerName,
                customerEmail: appointment.customerEmail,
                appointmentDate: formatDateForResponse(appointment.appointmentDate),
                appointmentTime: appointment.appointmentTime,
                duration: appointment.duration,
                status: appointment.status
            }
        });
    }
    catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});
exports.createAppointment = createAppointment;
// Get appointment by booking ID
const getAppointmentByBookingId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const appointment = yield Appointment_1.Appointment.findOne({ bookingId });
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json({
            appointment: Object.assign(Object.assign({}, appointment.toObject()), { appointmentDate: formatDateForResponse(appointment.appointmentDate) })
        });
    }
    catch (error) {
        console.error('Error getting appointment:', error);
        res.status(500).json({ error: 'Failed to get appointment' });
    }
});
exports.getAppointmentByBookingId = getAppointmentByBookingId;
// Get all appointments (for admin purposes)
const getAllAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        const appointments = yield Appointment_1.Appointment.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = yield Appointment_1.Appointment.countDocuments(query);
        // Format dates for response
        const formattedAppointments = appointments.map(appointment => (Object.assign(Object.assign({}, appointment.toObject()), { appointmentDate: formatDateForResponse(appointment.appointmentDate) })));
        res.json({
            appointments: formattedAppointments,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total
        });
    }
    catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).json({ error: 'Failed to get appointments' });
    }
});
exports.getAllAppointments = getAllAppointments;
