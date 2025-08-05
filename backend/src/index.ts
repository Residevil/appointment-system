import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import appointmentRoutes from './routes/appointmentRoutes';

// Conditionally load environment variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// MongoDB connection configuration
const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_CLUSTER_URL,
    MONGO_DB_NAME,
} = process.env;

// Validate environment variables
const required = ['MONGO_USER', 'MONGO_PASSWORD', 'MONGO_CLUSTER_URL'];
required.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});


// Build MongoDB URI
const mongoUri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER_URL}/${MONGO_DB_NAME}?retryWrites=true&w=majority`;

// MongoDB connection function
async function connectToMongoDB() {
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas successfully!');
        console.log(`📊 Database: ${MONGO_DB_NAME}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Security middleware (only in production)
if (isProduction) {
    app.use(helmet());
}

// Configure CORS based on environment
const corsOptions = {
    origin: isProduction 
        ? 'https://appointment-system-production-9770.up.railway.app'
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic logging middleware (only in development)
if (!isProduction) {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({ 
        status: 'OK', 
        message: 'Appointment System API is running',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        version: '1.0.0',
        environment: NODE_ENV
    });
});

app.use((req, res, next) => {
    console.log('Incoming Origin:', req.headers.origin);
    next();
  });  

// API routes
app.use('/api/appointments', appointmentRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Appointment System API',
        version: '1.0.0',
        environment: NODE_ENV,
        endpoints: {
            health: '/api/health',
            appointments: '/api/appointments'
        }
    });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Server error:', err);
    
    // Don't leak error details in production
    const errorMessage = isProduction 
        ? 'Internal server error' 
        : err.message;
    
    res.status(err.status || 500).json({ 
        error: errorMessage,
        ...(!isProduction && { stack: err.stack })
    });
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Closing server and database connection...`);
    
    try {
        await mongoose.connection.close();
        console.log('✅ Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start server function
async function startServer() {
    try {
        // Connect to MongoDB first
        await connectToMongoDB();
        
        // Start Express server
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📅 Appointments API: http://localhost:${PORT}/api/appointments`);
            console.log(`🌐 Environment: ${NODE_ENV}`);
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('❌ Server error:', error);
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the application
startServer();

export default app; 
