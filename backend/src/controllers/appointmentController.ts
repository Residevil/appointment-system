import { Request, Response } from 'express';
import { Appointment, IAppointment } from '../models/Appointment';
import { sendConfirmationEmail } from '../utils/emailService';

// Helper function to create a date in local timezone
const createLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

// Helper function to format date for response
const formatDateForResponse = (date: Date): string => {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

// Helper function to get tomorrow's date
const getTomorrow = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
};

// Get available time slots for a specific date
export const getAvailableSlots = async (req: Request, res: Response) => {
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
    const bookedAppointments = await Appointment.find({
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

  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
};

// Create a new appointment
export const createAppointment = async (req: Request, res: Response) => {
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
    const existingAppointment = await Appointment.findOne({
      appointmentDate: localAppointmentDate,
      appointmentTime,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    // Create new appointment
    const appointment = new Appointment({
      customerName,
      customerEmail,
      appointmentDate: localAppointmentDate,
      appointmentTime,
      duration: duration || 30,
      notes
    });

    await appointment.save();

    // Send confirmation email
    try {
      await sendConfirmationEmail(appointment);
    } catch (emailError) {
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

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

// Get appointment by booking ID
export const getAppointmentByBookingId = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const appointment = await Appointment.findOne({ bookingId });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ 
      appointment: {
        ...appointment.toObject(),
        appointmentDate: formatDateForResponse(appointment.appointmentDate)
      }
    });

  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({ error: 'Failed to get appointment' });
  }
};

// Get all appointments (for admin purposes)
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Appointment.countDocuments(query);

    // Format dates for response
    const formattedAppointments = appointments.map(appointment => ({
      ...appointment.toObject(),
      appointmentDate: formatDateForResponse(appointment.appointmentDate)
    }));

    res.json({
      appointments: formattedAppointments,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });

  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
}; 