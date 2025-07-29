import React, { useState } from 'react';
import { TextField, Button, Typography, Box, CircularProgress, Alert, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { getAvailableSlots, createAppointment } from '../services/appointmentService';
import { AppointmentCreateRequest, AppointmentCreateResponse } from '../types/appointment';
import { format, addDays, parse } from 'date-fns';

const today = new Date();
const tomorrow = addDays(today, 1);

// Helper function to format date string properly
const formatAppointmentDate = (dateString: string): string => {
  // Parse the date string (YYYY-MM-DD) and format it
  const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
  return format(parsedDate, 'PPP');
};

const AppointmentBooking: React.FC = () => {
  const [date, setDate] = useState(format(tomorrow, 'yyyy-MM-dd'));
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState<AppointmentCreateRequest>({
    customerName: '',
    customerEmail: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });
  const [booking, setBooking] = useState<AppointmentCreateResponse | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSlots = async (selectedDate: string) => {
    setLoadingSlots(true);
    setError('');
    setSlots([]);
    setSelectedSlot('');
    try {
      const res = await getAvailableSlots(selectedDate);
      setSlots(res.availableSlots);
    } catch (e: any) {
      setError('Failed to fetch slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  React.useEffect(() => {
    fetchSlots(date);
  }, [date]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setForm({ ...form, appointmentTime: slot, appointmentDate: date });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await createAppointment(form);
      setBooking(res);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (booking) {
    return (
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Appointment Confirmed!</Typography>
        <Typography>Booking ID: {booking.appointment.bookingId}</Typography>
        <Typography>Date: {formatAppointmentDate(booking.appointment.appointmentDate)}</Typography>
        <Typography>Time: {booking.appointment.appointmentTime}</Typography>
        <Typography>Status: {booking.appointment.status}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>Book Another</Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Book an Appointment</Typography>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        All times are shown in Pacific Time (PST/PDT)
      </Typography>
      <TextField
        label="Select Date"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
        sx={{ mb: 2 }}
        inputProps={{ min: format(tomorrow, 'yyyy-MM-dd'), max: format(addDays(today, 30), 'yyyy-MM-dd') }}
      />
      {loadingSlots ? <CircularProgress /> : (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Available Time Slots</Typography>
          <Grid container spacing={1}>
            {slots.length === 0 && (
              <Grid>
                <Alert severity="info">No slots available for this date.</Alert>
              </Grid>
            )}
            {slots.map(slot => (
              <Grid key={slot}>
                <Button
                  variant={selectedSlot === slot ? 'contained' : 'outlined'}
                  onClick={() => handleSlotSelect(slot)}
                  sx={{ minWidth: 90 }}
                >
                  {slot}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="customerName"
          value={form.customerName}
          onChange={handleFormChange}
          required
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          name="customerEmail"
          value={form.customerEmail}
          onChange={handleFormChange}
          required
          type="email"
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Notes (optional)"
          name="notes"
          value={form.notes}
          onChange={handleFormChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!selectedSlot || !form.customerName || !form.customerEmail || submitting}
          fullWidth
        >
          {submitting ? <CircularProgress size={24} /> : 'Book Appointment'}
        </Button>
      </form>
    </Box>
  );
};

export default AppointmentBooking; 