const Razorpay = require('razorpay');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getPlanIds = () => ({
  starter: process.env.RAZORPAY_PLAN_STARTER,
  pro: process.env.RAZORPAY_PLAN_PRO,
  agency: process.env.RAZORPAY_PLAN_AGENCY,
});

exports.createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.userId;
    const PLAN_IDS = getPlanIds();

    console.log(`[Razorpay] createSubscription request for plan: "${plan}"`);
    console.log(`[Razorpay] Current PLAN_IDS mapping:`, PLAN_IDS);

    if (!PLAN_IDS[plan]) {
      console.error(`[Razorpay] Invalid plan name: "${plan}". Map keys: ${Object.keys(PLAN_IDS).join(', ')}`);
      return res.status(400).json({ error: `Invalid plan selected: ${plan}` });
    }

    const planId = PLAN_IDS[plan];
    console.log(`[Razorpay] Initiating subscription for planId: ${planId}`);

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12,
    });

    res.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay Subscription Error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      plan
    } = req.body;
    const userId = req.user.userId;

    // Verify signature
    const text = razorpay_payment_id + '|' + razorpay_subscription_id;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Get subscription details from Razorpay
    const rzpSubscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);

    // Update database
    await prisma.$transaction([
      prisma.subscription.upsert({
        where: { razorpaySubscriptionId: razorpay_subscription_id },
        update: {
          status: rzpSubscription.status,
          currentPeriodEnd: rzpSubscription.current_end ? new Date(rzpSubscription.current_end * 1000) : new Date(),
        },
        create: {
          userId: userId,
          razorpaySubscriptionId: razorpay_subscription_id,
          plan: plan,
          status: rzpSubscription.status,
          currentPeriodEnd: rzpSubscription.current_end ? new Date(rzpSubscription.current_end * 1000) : new Date(),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { plan: plan },
      }),
      prisma.payment.create({
        data: {
          userId: userId,
          razorpayPaymentId: razorpay_payment_id,
          amount: rzpSubscription.charge_at ? 0 : 0, // In true subscription, first payment might be different
          status: 'captured',
        }
      })
    ]);

    res.json({ message: 'Subscription verified and activated' });
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true }
    });

    res.json({ subscription, plan: user.plan });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    await razorpay.subscriptions.cancel(subscriptionId);
    
    await prisma.$transaction([
        prisma.subscription.update({
            where: { razorpaySubscriptionId: subscriptionId },
            data: { status: 'cancelled' },
        }),
        prisma.user.update({
            where: { id: userId },
            data: { plan: 'free' }
        })
    ]);

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};
