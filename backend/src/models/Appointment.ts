import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Appointment
export interface IAppointment extends Document {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number; // in minutes
  status: 'confirmed' | 'cancelled' | 'pending';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment Schema
const appointmentSchema = new Schema<IAppointment>({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    default: () => `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 30 // 30 minutes default
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'confirmed'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for efficient queries
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ customerEmail: 1 });
appointmentSchema.index({ bookingId: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema); 