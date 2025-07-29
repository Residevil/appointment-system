export interface Appointment {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  appointmentDate: string; // ISO string
  appointmentTime: string;
  duration: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlotsResponse {
  date: string;
  availableSlots: string[];
  totalSlots: number;
  bookedSlots: number;
  availableCount: number;
}

export interface AppointmentCreateRequest {
  customerName: string;
  customerEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  duration?: number;
  notes?: string;
}

export interface AppointmentCreateResponse {
  message: string;
  appointment: Appointment;
} 

export interface AppointmentCancelRequest {
  customerName: string;
  customerEmail: string;
  appointment: Appointment;
  notes?: string;
}

export interface AppointmentCancelResponse {
  message: string;
  appointment: Appointment;
}