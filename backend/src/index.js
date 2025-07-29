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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const helmet_1 = __importDefault(require("helmet"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
// MongoDB connection configuration
const { MONGO_USER, MONGO_PASSWORD, MONGO_CLUSTER_URL, MONGO_DB_NAME, } = process.env;
// Validate environment variables
if (!MONGO_USER || !MONGO_PASSWORD || !MONGO_CLUSTER_URL) {
    console.error('❌ Missing required MongoDB environment variables');
    console.error('Please check your .env file for MONGO_USER, MONGO_PASSWORD, and MONGO_CLUSTER_URL');
    process.exit(1);
}
// Build MongoDB URI
const mongoUri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER_URL}/${MONGO_DB_NAME}?retryWrites=true&w=majority`;
// MongoDB connection function
function connectToMongoDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(mongoUri);
            console.log('✅ Connected to MongoDB Atlas successfully!');
            console.log(`📊 Database: ${MONGO_DB_NAME}`);
        }
        catch (error) {
            console.error('❌ MongoDB connection error:', error);
            process.exit(1);
        }
    });
}
// Security middleware (only in production)
if (isProduction) {
    app.use((0, helmet_1.default)());
}
// Configure CORS based on environment
const corsOptions = {
    origin: isProduction
        ? process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'https://your-frontend-domain.com'
        : process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Basic logging middleware (only in development)
if (!isProduction) {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}
// Health check endpoint
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({
        status: 'OK',
        message: 'Appointment System API is running',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        version: '1.0.0',
        environment: NODE_ENV
    });
});
// API routes
app.use('/api/appointments', appointmentRoutes_1.default);
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
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    // Don't leak error details in production
    const errorMessage = isProduction
        ? 'Internal server error'
        : err.message;
    res.status(err.status || 500).json(Object.assign({ error: errorMessage }, (!isProduction && { stack: err.stack })));
});
// Graceful shutdown handling
const gracefulShutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`\n🛑 Received ${signal}. Closing server and database connection...`);
    try {
        yield mongoose_1.default.connection.close();
        console.log('✅ Database connection closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});
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
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB first
            yield connectToMongoDB();
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
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    });
}
// Start the application
startServer();
exports.default = app;
