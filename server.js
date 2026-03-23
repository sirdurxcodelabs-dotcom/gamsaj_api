const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const notificationScheduler = require('./services/notificationScheduler');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Start notification scheduler
notificationScheduler.start();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use(logger);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/navigation', require('./routes/navigationRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/company-info', require('./routes/companyInfoRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
