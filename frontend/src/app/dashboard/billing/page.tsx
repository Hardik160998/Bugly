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
    <div className="max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Billing & Credits</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage your workspace tier and financial records.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-8 border-b border-gray-100 dark:border-gray-800/60">
        <button
          onClick={() => setActiveTab('plan')}
          className={`pb-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'plan'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Subscription Tier
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Transaction History
        </button>
      </div>

      {activeTab === 'plan' ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Current Plan Status */}
          <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 p-10 shadow-premium">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                  currentPlan === 'free' ? 'bg-gray-50 text-gray-400 border border-gray-100' : 'bg-brand-500 text-white shadow-brand-500/20'
                }`}>
                  <Zap className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{currentPlan} Environment</span>
                    {subscription?.status === 'active' && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">Live</span>
                    )}
                    {(subscription?.status === 'cancelled' || subscription?.status === 'terminated') && (
                      <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-100">Expired</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {currentPlan === 'free' 
                      ? 'Standard development features active' 
                      : subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd).getFullYear() > 1970
                        ? `Renewal scheduled: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        : 'Enterprise-grade monitoring active'
                    }
                  </p>
                </div>
              </div>
              {currentPlan !== 'free' && subscription?.status === 'active' && (
                <button
                  onClick={handleCancel}
                  disabled={!!processing}
                  className="px-6 py-3 rounded-xl border border-rose-100 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 transition-all disabled:opacity-50"
                >
                  {processing === 'cancelling' ? 'Processing...' : 'Terminate Subscription'}
                </button>
              )}
            </div>
          </div>

          {/* Plans Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`group relative rounded-3xl p-10 flex flex-col transition-all hover:translate-y-[-8px] ${
                    plan.highlight
                      ? 'bg-gray-950 dark:bg-brand-950 border-gray-900 dark:border-brand-900 shadow-2xl scale-105 z-10'
                      : 'border border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-950 shadow-premium'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-1.5 text-[9px] font-black text-white uppercase tracking-widest shadow-xl">
                         Recommended Tier
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${plan.highlight ? 'text-brand-400' : 'text-gray-400'}`}>{plan.name} Plan</h3>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black tracking-tighter ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.price}</span>
                      <span className={`text-xs font-bold uppercase tracking-widest ${plan.highlight ? 'text-gray-500' : 'text-gray-400'}`}>/mo</span>
                    </div>
                  </div>

                  <p className={`text-xs font-medium mb-10 leading-relaxed ${plan.highlight ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {plan.desc}
                  </p>

                  <div className={`h-px w-full mb-10 ${plan.highlight ? 'bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`} />

                  <ul className="space-y-4 mb-12 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                            <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <span className={`text-xs font-bold ${plan.highlight ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || !!processing || plan.id === 'free'}
                    className={`w-full rounded-2xl py-5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      isCurrent
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default'
                        : plan.id === 'free'
                        ? 'hidden'
                        : plan.highlight
                        ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-xl shadow-brand-500/20'
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-950 hover:opacity-90'
                    }`}
                  >
                    {isCurrent ? 'Current Active Plan' : processing === plan.id ? 'Initializing...' : 'Upgrade Workspace'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Trust Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50/50 dark:bg-gray-900/50 p-10 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-inner">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-gray-950 flex items-center justify-center shadow-sm">
                        <Shield className="h-6 w-6 text-brand-500" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enterprise Security</h3>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Bank-level Encryption</p>
                    </div>
                </div>
                <p className="text-xs font-medium text-gray-500 leading-loose">
                    All transactions are handled through Razorpay via military-grade SSL encryption. Sensitive financial data never transits our internal systems.
                </p>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-900/50 p-10 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-inner">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-gray-950 flex items-center justify-center shadow-sm">
                        <Star className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fluid Flexibility</h3>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Zero Contract Commitment</p>
                    </div>
                </div>
                <p className="text-xs font-medium text-gray-500 leading-loose">
                    Scale your requirements up or down as your team grows. Terminate your active subscription at any point with instant effect via the dashboard.
                </p>
            </div>
          </div>
        </div>
      ) : (
        /* Billing History */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 overflow-hidden shadow-premium">
            <div className="px-10 py-8 border-b border-gray-50 dark:border-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-gray-400" />
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Audit Logs</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-50 dark:border-gray-900">
                  <tr>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Processing Date</th>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice Artifact</th>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Volume</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Documentation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-10 py-20 text-center">
                        <div className="opacity-30 flex flex-col items-center">
                            <CreditCard className="h-10 w-10 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No transaction records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-all">
                        <td className="px-10 py-6">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="px-10 py-6">
                            <span className="text-[10px] font-black text-gray-400 font-mono tracking-tighter uppercase">{p.razorpayPaymentId}</span>
                        </td>
                        <td className="px-10 py-6">
                            <span className="text-sm font-black text-gray-900 dark:text-white">{p.currency === 'INR' ? '₹' : '$'}{p.amount / 100}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button
                            onClick={() => handleDownloadReceipt(p)}
                            className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-xl text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Receipt
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
