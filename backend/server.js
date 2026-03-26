require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const bugRoutes = require('./routes/bugs');
const razorpayRoutes = require('./routes/razorpay');

const app = express();
const PORT = process.env.PORT || 5000;

const dashboardCors = cors({
    origin: process.env.FRONTEND_URL || 'https://bugly-frontend.vercel.app',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

const widgetCors = cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
});

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes(dashboardCors));
app.use('/api/projects', projectRoutes(dashboardCors));
app.use('/api/bugs', bugRoutes(dashboardCors, widgetCors));
app.use('/api/razorpay', razorpayRoutes(dashboardCors));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
