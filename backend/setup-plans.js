require('dotenv').config();
const Razorpay = require('razorpay');
const fs = require('fs');
const path = require('path');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPlans() {
  console.log('--- Creating Razorpay Plans ---');

  const plans = [
    {
      name: 'Bugly Starter',
      amount: 159900, // ₹1,599 in paise
      description: 'Starter plan for solo developers',
      plan_key: 'RAZORPAY_PLAN_STARTER'
    },
    {
      name: 'Bugly Pro',
      amount: 419900, // ₹4,199 in paise
      description: 'Pro plan for growing teams',
      plan_key: 'RAZORPAY_PLAN_PRO'
    },
    {
      name: 'Bugly Agency',
      amount: 839900, // ₹8,399 in paise
      description: 'Agency plan for managing many clients',
      plan_key: 'RAZORPAY_PLAN_AGENCY'
    }
  ];

  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');

  for (const plan of plans) {
    try {
      console.log(`Creating ${plan.name}...`);
      const response = await razorpay.plans.create({
        period: 'monthly',
        interval: 1,
        item: {
          name: plan.name,
          amount: plan.amount,
          currency: 'INR',
          description: plan.description
        }
      });
      
      console.log(`✅ Success: ${response.id}`);
      
      // Replace the placeholder ID in .env
      const regex = new RegExp(`${plan.plan_key}=".*"`, 'g');
      envContent = envContent.replace(regex, `${plan.plan_key}="${response.id}"`);
      
    } catch (error) {
      console.error(`❌ Failed to create ${plan.name}:`, error.error ? error.error.description : error.message);
    }
  }

  fs.writeFileSync(envPath, envContent);
  console.log('--- Done! .env file updated ---');
}

createPlans();
