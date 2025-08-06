import axios from 'axios';
// import { client } from '../../../backend/src/config/mongo';
import { 
  Appointment, 
  AvailableSlotsResponse, 
  AppointmentCreateRequest, 
  AppointmentCreateResponse,
  AppointmentUpdateRequest,
  AppointmentUpdateResponse,
  AppointmentCancelRequest,
  AppointmentCancelResponse
} from '../types/appointment';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api/appointments';

// const dbName = 'appointmentServiceDB';
// const collectionName = 'appointments';


export const getAvailableSlots = async (date: string) => {
  const res = await axios.get<AvailableSlotsResponse>(`${API_BASE}/available-slots/${date}`);
  return res.data;
};

export const createAppointment = async (data: AppointmentCreateRequest) => {
  const res = await axios.post<AppointmentCreateResponse>(`${API_BASE}/create`, data);
  return res.data;
};

export const getAppointmentByBookingId = async (bookingId: string) => {
  const res = await axios.get<{ appointment: Appointment }>(`${API_BASE}/booking/${bookingId}`);
  return res.data.appointment;
}; 

export const updateAppointment = async (bookingId: string, data: AppointmentUpdateRequest) => {
  const res = await axios.put<AppointmentUpdateResponse>(`${API_BASE}/update/${bookingId}`, data);
  return res.data;
};

export const cancelAppointment = async (bookingId: string, data: AppointmentCancelRequest = {}) => {
  const res = await axios.put<AppointmentCancelResponse>(`${API_BASE}/cancel/${bookingId}`, data);
  return res.data;
};

// // This function demonstrates basic CRUD on an 'appointments' collection
// export async function runAppointmentTemplate() {
//   // Ensure connection
//   await client.connect();
//   const database = client.db(dbName);
//   const collection = database.collection(collectionName);

//   // 1) Seed some sample appointments
//   const sampleAppointments = [
//     {
//       title: '15-Minute Intro Call',
//       participants: ['alex@example.com', 'host@example.com'],
//       startTime: new Date('2025-08-01T15:00:00Z'),
//       endTime: new Date('2025-08-01T15:15:00Z'),
//       description: 'Quick get-to-know session',
//     },
//     {
//       title: 'Project Deep Dive',
//       participants: ['alex@example.com', 'client@example.com'],
//       startTime: new Date('2025-08-02T18:00:00Z'),
//       endTime: new Date('2025-08-02T19:00:00Z'),
//       description: 'Walk through project requirements',
//     },
//   ];

//   try {
//     const { insertedCount } = await collection.insertMany(sampleAppointments);
//     console.log(`${insertedCount} appointments inserted.\n`);
//   } catch (err) {
//     console.error(`Failed to insert appointments: ${err}\n`);
//   }

//   // 2) Find upcoming appointments (startTime ≥ now), sorted ascending
//   const now = new Date();
//   try {
//     const cursor = collection.find({ startTime: { $gte: now } }).sort({ startTime: 1 });
//     console.log('Upcoming appointments:');
//     await cursor.forEach(appt => {
//       console.log(
//         `• ${appt.title} — ${appt.startTime.toISOString()} to ${appt.endTime.toISOString()}`
//       );
//     });
//     console.log();
//   } catch (err) {
//     console.error(`Error fetching upcoming appointments: ${err}\n`);
//   }

//   // 3) Find one appointment by participant email
//   try {
//     const appt = await collection.findOne({ participants: 'alex@example.com' });
//     if (!appt) {
//       console.log("No appointment found for alex@example.com\n");
//     } else {
//       console.log(`Found appointment:\n${JSON.stringify(appt, null, 2)}\n`);
//     }
//   } catch (err) {
//     console.error(`Error finding one appointment: ${err}\n`);
//   }

//   // 4) Update an appointment’s description
//   try {
//     const result = await collection.findOneAndUpdate(
//       { title: '15-Minute Intro Call' },
//       { $set: { description: 'Intro call with Calendly-style link' } },
//       { returnDocument: 'after' }
//     );
//     const updatedAppt = result?.value;
//     console.log(`Updated appointment:\n${JSON.stringify(updatedAppt, null, 2)}\n`);
//   } catch (err) {
//     console.error(`Error updating appointment: ${err}\n`);
//   }

//   // 5) Delete past appointments (endTime < now)
//   try {
//     const { deletedCount } = await collection.deleteMany({ endTime: { $lt: now } });
//     console.log(`Deleted ${deletedCount} past appointments.\n`);
//   } catch (err) {
//     console.error(`Error deleting past appointments: ${err}\n`);
//   }

//   // Cleanup
//   await client.close();
// }
