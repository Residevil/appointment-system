# Appointment System

A Calendly-like appointment booking system built with React (TypeScript) frontend and Node.js (Express) backend.

## Features

- 📅 **Calendar Interface**: View and select available time slots
- 🕒 **Time Slot Management**: 30-minute intervals from 9 AM to 5 PM
- 📧 **Email Confirmations**: Automatic confirmation emails with booking details
- 🆔 **Unique Booking IDs**: Each appointment gets a unique identifier
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔒 **Conflict Prevention**: Prevents double-booking of time slots

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI (for UI components)
- Axios (for API calls)

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- Nodemailer (for email sending)
- CORS enabled

## Project Structure

```
appointment-system/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── types/          # TypeScript interfaces
│   └── package.json
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Server entry point
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install missing TypeScript types:**
   ```bash
   npm install --save-dev @types/cors @types/nodemailer
   ```

4. **Create environment file:**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/appointment-system
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   NODE_ENV=development
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install additional dependencies:**
   ```bash
   npm install @mui/material @emotion/react @emotion/styled @mui/icons-material axios date-fns
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Appointments
- `GET /api/appointments/available-slots/:date` - Get available time slots for a date
- `POST /api/appointments/create` - Create a new appointment
- `GET /api/appointments/booking/:bookingId` - Get appointment by booking ID
- `GET /api/appointments/all` - Get all appointments (admin)

### Example API Usage

```bash
# Get available slots for today
curl http://localhost:5000/api/appointments/available-slots/2024-01-15

# Create an appointment
curl -X POST http://localhost:5000/api/appointments/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "appointmentDate": "2024-01-15",
    "appointmentTime": "10:00",
    "duration": 30,
    "notes": "First consultation"
  }'
```

## Email Configuration

To enable email confirmations:

1. **Gmail Setup:**
   - Enable 2-factor authentication
   - Generate an app-specific password
   - Use the app password in your `.env` file

2. **Other Email Providers:**
   - Update the `emailService.ts` file with your provider's SMTP settings

## Development

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Future Improvements

- [ ] User authentication and authorization
- [ ] Admin dashboard for managing appointments
- [ ] Calendar integration (Google, Outlook)
- [ ] SMS reminders
- [ ] Appointment rescheduling/cancellation
- [ ] Multiple time zones support
- [ ] Analytics and reporting
- [ ] Payment integration
- [ ] Video conferencing integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 