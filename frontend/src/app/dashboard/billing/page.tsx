"use client";

import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Zap, Shield, Star, XCircle, ArrowRight, Loader2, Download, History } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    desc: 'Perfect for solo developers and small projects.',
    features: ['3 projects', '500 bug reports / mo', 'Screenshot capture', 'Email notifications'],
    color: 'blue',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    desc: 'For growing teams who need full collaboration.',
    features: ['15 projects', 'Unlimited bug reports', 'Annotations & drawing', 'Team comments', 'Slack integration'],
    color: 'indigo',
    highlight: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$99',
    desc: 'For agencies managing many client projects.',
    features: ['Unlimited projects', 'Unlimited bug reports', 'All integrations', 'Custom branding', 'API access'],
    color: 'purple',
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'plan' | 'history'>('plan');
  const [processing, setProcessing] = useState<string | null>(null);

  const { user, setUser } = useAuthStore();

  useEffect(() => {
    fetchSubscription();
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchSubscription = async () => {
    try {
      const [{ data: subData }, { data: payData }] = await Promise.all([
        api.get('/razorpay/subscription'),
        api.get('/razorpay/payments')
      ]);
      setSubscription(subData.subscription);
      setCurrentPlan(subData.plan || 'free');
      setPayments(payData.payments || []);
    } catch (err) {
      console.error('Failed to fetch billing data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setProcessing(planId);
    try {
      const { data } = await api.post('/razorpay/create-subscription', { plan: planId });
      
      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'Bugly',
        description: `${planId.toUpperCase()} Plan Subscription`,
        image: 'https://bugly.dev/logo.png', // Replace with actual logo
        handler: async function (response: any) {
          try {
            await api.post('/razorpay/verify-payment', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId
            });
            fetchSubscription();
            // Update global user state
            if (user) {
                setUser({ ...user, plan: planId }, useAuthStore.getState().token);
            }
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const rzp = (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Failed to initiate subscription. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDownloadReceipt = (payment: any) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${payment.razorpayPaymentId}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #1F2937; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #E5E7EB; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563EB; }
          .title { font-size: 24px; font-weight: bold; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .label { color: #6B7280; font-size: 14px; margin-bottom: 4px; }
          .value { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { text-align: left; padding: 12px; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; color: #4B5563; font-size: 12px; text-transform: uppercase; }
          td { padding: 12px; border-bottom: 1px solid #F3F4F6; }
          .footer { text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 60px; }
          .total { font-size: 18px; font-weight: bold; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Bugly</div>
          <div class="title">INVOICE</div>
        </div>
        <div class="details">
          <div>
            <div class="label">Billed To</div>
            <div class="value">${user?.name || 'Customer'}</div>
            <div class="value">${user?.email || ''}</div>
          </div>
          <div style="text-align: right;">
            <div class="label">Payment ID</div>
            <div class="value">${payment.razorpayPaymentId}</div>
            <div class="label" style="margin-top: 10px;">Date</div>
            <div class="value">${new Date(payment.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Bugly subscription - ${currentPlan.toUpperCase()} Plan</td>
              <td style="text-align: right;">${payment.currency} ${payment.amount / 100}</td>
            </tr>
          </tbody>
        </table>
        <div class="total">
          Total Paid: ${payment.currency} ${payment.amount / 100}
        </div>
        <div class="footer">
          Thank you for using Bugly! Should you have any questions, contact support@bugly.dev
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bugly_Receipt_${payment.razorpayPaymentId}.html`;
    a.click();
  };

  const handleCancel = async () => {
    if (!subscription || !window.confirm('Are you sure you want to cancel your subscription?')) return;
    
    setProcessing('cancelling');
    try {
      await api.post('/razorpay/cancel-subscription', { subscriptionId: subscription.razorpaySubscriptionId });
      fetchSubscription();
      // Update global user state
      if (user) {
          setUser({ ...user, plan: 'free' }, useAuthStore.getState().token);
      }
    } catch (err) {
      alert('Failed to cancel subscription.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your plan and billing history.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-100 dark:border-gray-800/60">
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'plan'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Manage Plan
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Billing History
        </button>
      </div>

      {activeTab === 'plan' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Current Plan Status */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800/60 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center dark:bg-gray-800 ${
                  currentPlan === 'free' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white capitalize">{currentPlan} Plan</span>
                    {subscription?.status === 'active' && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Active</span>
                    )}
                    {(subscription?.status === 'cancelled' || subscription?.status === 'terminated') && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">Cancelled</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {currentPlan === 'free' 
                      ? 'Limited features for personal use.' 
                      : subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd).getFullYear() > 1970
                        ? `Next billing date: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        : 'Subscription active (Renewal info pending)'
                    }
                  </p>
                </div>
              </div>
              {currentPlan !== 'free' && subscription?.status === 'active' && (
                <button
                  onClick={handleCancel}
                  disabled={!!processing}
                  className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {processing === 'cancelling' ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>

          {/* Plans Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 flex flex-col  ${
                    plan.highlight
                      ? 'ring-2 ring-blue-600 bg-white dark:bg-gray-900 shadow-lg'
                      : 'border border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-xs text-gray-500">/mo</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    {plan.desc}
                  </p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || !!processing || plan.id === 'free'}
                    className={`w-full rounded-lg py-2.5 text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : plan.id === 'free'
                        ? 'hidden'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : processing === plan.id ? 'Starting...' : 'Upgrade Now'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800/60">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
                        <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Secure Payments</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                    We use Razorpay to process payments. Your credit card information never touches our servers.
                </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800/60">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
                        <Star className="h-5 w-5 text-amber-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Cancel Anytime</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Not happy with Bugly? Cancel your subscription anytime with a single click from your dashboard.
                </p>
            </div>
          </div>
        </div>
      ) : (
        /* Billing History */
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800/60 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/60 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/50">
              <History className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/20 border-y border-gray-100 dark:border-gray-800/60">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Payment ID</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">
                        No payment history found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                          {p.razorpayPaymentId}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                          {p.currency === 'INR' ? '₹' : '$'}{p.amount / 100}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDownloadReceipt(p)}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
