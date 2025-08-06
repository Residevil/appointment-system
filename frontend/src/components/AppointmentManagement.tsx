import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { format, addDays, parse } from 'date-fns';
import {
  getAppointmentByBookingId,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots
} from '../services/appointmentService';
import {
  Appointment,
  AppointmentUpdateRequest,
  AppointmentCancelRequest
} from '../types/appointment';

const tomorrow = addDays(new Date(), 1);

// Helper function to format date string properly
const formatAppointmentDate = (dateString: string): string => {
  const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
  return format(parsedDate, 'PPP');
};

const AppointmentManagement: React.FC = () => {
  const [bookingId, setBookingId] = useState('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update dialog state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState<AppointmentUpdateRequest>({});
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const searchAppointment = async () => {
    if (!bookingId.trim()) {
      setError('Please enter a booking ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const foundAppointment = await getAppointmentByBookingId(bookingId.trim());
      setAppointment(foundAppointment);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Appointment not found');
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateDialog = () => {
    if (!appointment) return;
    
    setUpdateForm({
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      duration: appointment.duration,
      notes: appointment.notes || ''
    });
    setUpdateDialogOpen(true);
  };

  const closeUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setUpdateForm({});
    setAvailableSlots([]);
  };

  const fetchSlotsForUpdate = async (date: string) => {
    if (!date) return;
    
    setLoadingSlots(true);
    try {
      const res = await getAvailableSlots(date);
      // Include the current appointment time as available
      const slots = [...res.availableSlots];
      if (appointment && appointment.appointmentTime && !slots.includes(appointment.appointmentTime)) {
        slots.push(appointment.appointmentTime);
        slots.sort();
      }
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Failed to fetch available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleUpdateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
    
    // Fetch available slots when date changes
    if (name === 'appointmentDate') {
      fetchSlotsForUpdate(value);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!appointment) return;
    
    setUpdating(true);
    setError('');
    
    try {
      const response = await updateAppointment(appointment.bookingId, updateForm);
      setAppointment(response.appointment);
      setSuccess('Appointment updated successfully');
      closeUpdateDialog();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update appointment');
    } finally {
      setUpdating(false);
    }
  };

  const openCancelDialog = () => {
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancelReason('');
  };

  const handleCancelSubmit = async () => {
    if (!appointment) return;
    
    setCancelling(true);
    setError('');
    
    try {
      const cancelData: AppointmentCancelRequest = cancelReason ? { reason: cancelReason } : {};
      const response = await cancelAppointment(appointment.bookingId, cancelData);
      setAppointment(response.appointment);
      setSuccess('Appointment cancelled successfully');
      closeCancelDialog();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  React.useEffect(() => {
    if (updateForm.appointmentDate && updateDialogOpen) {
      fetchSlotsForUpdate(updateForm.appointmentDate);
    }
  }, [updateForm.appointmentDate, updateDialogOpen]);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Your Appointment
      </Typography>
      
      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Find Your Appointment
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="e.g., BK1234567890ABCDE"
            fullWidth
            onKeyPress={(e) => e.key === 'Enter' && searchAppointment()}
          />
          <Button
            variant="contained"
            onClick={searchAppointment}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      </Paper>

      {/* Appointment Details Section */}
      {appointment && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Appointment Details
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography><strong>Booking ID:</strong> {appointment.bookingId}</Typography>
            <Typography><strong>Name:</strong> {appointment.customerName}</Typography>
            <Typography><strong>Email:</strong> {appointment.customerEmail}</Typography>
            <Typography><strong>Date:</strong> {formatAppointmentDate(appointment.appointmentDate)}</Typography>
            <Typography><strong>Time:</strong> {appointment.appointmentTime}</Typography>
            <Typography><strong>Duration:</strong> {appointment.duration} minutes</Typography>
            <Typography><strong>Status:</strong> 
              <span style={{ 
                color: appointment.status === 'confirmed' ? 'green' : 
                       appointment.status === 'cancelled' ? 'red' : 'orange',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {appointment.status}
              </span>
            </Typography>
            {appointment.notes && (
              <Typography><strong>Notes:</strong> {appointment.notes}</Typography>
            )}
          </Box>

          {appointment.status !== 'cancelled' && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={openUpdateDialog}
              >
                Update Appointment
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={openCancelDialog}
              >
                Cancel Appointment
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onClose={closeUpdateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Name"
              name="customerName"
              value={updateForm.customerName || ''}
              onChange={handleUpdateFormChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              name="customerEmail"
              value={updateForm.customerEmail || ''}
              onChange={handleUpdateFormChange}
              type="email"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Date"
              name="appointmentDate"
              type="date"
              value={updateForm.appointmentDate || ''}
              onChange={handleUpdateFormChange}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ 
                min: format(tomorrow, 'yyyy-MM-dd'), 
                max: format(addDays(new Date(), 30), 'yyyy-MM-dd') 
              }}
            />
            
            {/* Available Time Slots */}
            {updateForm.appointmentDate && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Time Slots
                </Typography>
                {loadingSlots ? (
                  <CircularProgress size={24} />
                ) : (
                  <Grid container spacing={1}>
                    {availableSlots.map(slot => (
                      <Grid item key={slot}>
                        <Button
                          variant={updateForm.appointmentTime === slot ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => setUpdateForm(prev => ({ ...prev, appointmentTime: slot }))}
                        >
                          {slot}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            <TextField
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={updateForm.duration || ''}
              onChange={handleUpdateFormChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Notes"
              name="notes"
              value={updateForm.notes || ''}
              onChange={handleUpdateFormChange}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUpdateDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateSubmit} 
            variant="contained"
            disabled={updating}
          >
            {updating ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={closeCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel this appointment?
          </Typography>
          <TextField
            label="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancelDialog}>Keep Appointment</Button>
          <Button 
            onClick={handleCancelSubmit} 
            color="error"
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? <CircularProgress size={24} /> : 'Cancel Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentManagement;