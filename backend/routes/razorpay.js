const express = require('express');
const router = express.Router();
const razorpayController = require('../controllers/razorpay');
const authMiddleware = require('../middleware/authMiddleware');

module.exports = (dashboardCors) => {
    router.use(dashboardCors);
    router.use(authMiddleware);

    router.post('/create-subscription', razorpayController.createSubscription);
    router.post('/verify-payment', razorpayController.verifyPayment);
    router.get('/subscription', razorpayController.getSubscription);
    router.post('/cancel-subscription', razorpayController.cancelSubscription);
    router.get('/payments', razorpayController.getPaymentHistory);

    return router;
};
