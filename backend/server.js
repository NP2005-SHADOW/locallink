const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/locallink')
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('Database connection error:', err));

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));


// Define the path pointing up one level from 'backend' to 'frontend/dist'
const frontendDistPath = path.join(__dirname, '../frontend/dist');

// Serve the static frontend files
app.use(express.static(frontendDistPath));

// Catch-all route using a Regex (/.*/) instead of '*' to support Express 5
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));