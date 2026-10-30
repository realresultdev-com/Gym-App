import { useState } from 'react';
import type { MemberFeeProfile, FeePaymentRecord, PaymentMethod } from '../types/gym';
import {
  IconCreditCard,
  IconReceipt,
  IconClose,
  IconChevronRight,
} from './Icons';

interface MemberFeesViewProps {
  profile: MemberFeeProfile;
  history: FeePaymentRecord[];
  onPayFee: (amount: number, planName: MemberFeeProfile['planName'], method: PaymentMethod, tenureMonths: number) => void;
  onViewReceipt: (record: FeePaymentRecord) => void;
}

const RENEWAL_PLANS = [
  {
    planName: 'Monthly All-Access' as const,
    months: 1,
    price: 89,
    tag: 'Flexible',
    desc: 'Billed monthly with anytime cancellation',
  },
  {
    planName: 'Quarterly Pro Athlete' as const,
    months: 3,
    price: 240,
    tag: 'Most Popular',
    desc: 'Save 10% on quarterly training cycle',
  },
  {
    planName: 'VIP Elite Annual' as const,
    months: 12,
    price: 799,
    tag: 'Best Value',
    desc: 'Full locker access, guest passes & save 25%',
  },
];

export function MemberFeesView({ profile, history, onPayFee, onViewReceipt }: MemberFeesViewProps) {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(1); // Default to Quarterly
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI / QR');
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  const activePlan = RENEWAL_PLANS[selectedPlanIndex];

  const handleConfirmPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      onPayFee(activePlan.price, activePlan.planName, selectedMethod, activePlan.months);
      setProcessing(false);
      setPayModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 antialiased">
      
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fees & Membership Billing</h2>
          <p className="text-xs text-slate-500 mt-0.5">Active plan validity, payment records, and renewal schedule</p>
        </div>
        <button
          onClick={() => setPayModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-sm flex items-center justify-center space-x-2"
        >
          <IconCreditCard className="w-4 h-4 text-amber-400" />
          <span>Pay Fees / Renew</span>
        </button>
      </div>

      {/* Plan Status Highlight Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
              Active Tier
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {profile.billingFrequency} Billing Cycle
            </span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-white">{profile.planName}</h3>
          <p className="text-xs text-slate-300">
            {profile.daysRemaining > 0 ? (
              <span>Your membership is active with <strong className="text-white font-number font-bold tracking-tight">{profile.daysRemaining} days remaining</strong> until renewal.</span>
            ) : (
              <span className="text-rose-300 font-semibold">Your renewal is due. Please pay your fee to avoid access turnstile restriction.</span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-semibold text-slate-300">Next Fee Due</p>
            <p className="font-ios-stat text-2xl text-white mt-0.5 tracking-tight">${profile.nextDueAmount}</p>
            <p className="font-number text-[11px] font-semibold text-amber-300">{profile.nextDueDate}</p>
          </div>
          <button
            onClick={() => setPayModalOpen(true)}
            className="px-5 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
          >
            Renew Now
          </button>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-amber-400/10 to-transparent pointer-events-none" />
      </div>

      {/* Core Financial Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Last Payment Details */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Last Payment</h4>
              <p className="text-[11px] text-slate-500">Verified transaction record</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
              Paid
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Amount Paid</p>
              <p className="font-ios-stat text-2xl text-slate-900 mt-0.5 tracking-tight">${profile.lastPaymentAmount.toFixed(2)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Payment Date</p>
              <p className="font-number text-xs font-bold text-slate-900 mt-1">{profile.lastPaymentDate}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Method</p>
              <p className="text-xs font-semibold text-slate-900 mt-1">{profile.lastPaymentMethod}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Invoice Number</p>
              <p className="font-number text-xs font-bold text-slate-900 tracking-tight mt-1">{profile.lastInvoiceNumber}</p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => onViewReceipt(history[0])}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <IconReceipt className="w-3.5 h-3.5 text-slate-500" />
              <span>View Official Tax Receipt</span>
            </button>
          )}
        </div>

        {/* Card 2: Next Fee Due Schedule */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Next Fee Due</h4>
              <p className="text-[11px] text-slate-500">Upcoming renewal breakdown</p>
            </div>
            <span className={`text-xs font-bold tracking-wide uppercase ${
              profile.status === 'OVERDUE'
                ? 'text-rose-600'
                : profile.status === 'DUE_SOON'
                ? 'text-amber-600'
                : 'text-slate-600'
            }`}>
              {profile.status === 'OVERDUE' ? 'Overdue' : profile.status === 'DUE_SOON' ? 'Due Soon' : 'Current'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Due Amount</p>
              <p className="font-ios-stat text-2xl text-slate-900 mt-0.5 tracking-tight">${profile.nextDueAmount.toFixed(2)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Due Date</p>
              <p className="font-number text-xs font-bold text-slate-900 mt-1">{profile.nextDueDate}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Auto-Renewal</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Enabled (Card On File)</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Grace Window</p>
              <p className="font-number text-xs font-semibold text-slate-700 mt-1">3 Days Post Due</p>
            </div>
          </div>

          <button
            onClick={() => setPayModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Pay Fee Online</span>
            <IconChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Payment History & Receipts Table */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payment & Invoice History</h3>
            <p className="text-xs text-slate-500">Verified studio receipts and transaction logs</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {history.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50/70">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date Paid</th>
                <th className="py-3 px-4">Plan / Tenure</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-number font-bold text-slate-900 tracking-tight">
                    {record.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-number text-slate-700 font-medium">
                    {record.paidDate}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {record.planName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                      {record.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-number font-bold text-slate-900 tracking-tight text-sm">
                    ${record.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-bold text-emerald-700 tracking-wide uppercase">
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onViewReceipt(record)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          PAY FEES & RENEW MODAL
      ========================================================== */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 antialiased">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pay Membership Fees</h3>
                <p className="text-xs text-slate-500">Select renewal duration and preferred payment method</p>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Select Plan Duration */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Select Renewal Duration
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {RENEWAL_PLANS.map((plan, idx) => {
                  const isSelected = selectedPlanIndex === idx;
                  return (
                    <div
                      key={plan.planName}
                      onClick={() => setSelectedPlanIndex(idx)}
                      className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {plan.tag}
                        </span>
                        <p className="text-sm font-extrabold mt-2">${plan.price}</p>
                        <p className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-900'}`}>
                          {plan.planName}
                        </p>
                      </div>
                      <p className={`text-[10px] mt-2 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        {plan.months} month{plan.months > 1 ? 's' : ''} access
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Payment Method */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI / QR', 'Credit Card', 'Cash Desk'] as PaymentMethod[]).map((method) => {
                  const isSelected = selectedMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Interactive Payment Screen by Method */}
            {selectedMethod === 'UPI / QR' && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-center space-y-3">
                <p className="text-xs font-bold text-slate-900">Scan QR with Any UPI App</p>
                <div className="w-36 h-36 bg-white p-2 rounded-2xl border border-amber-200 shadow-sm mx-auto flex flex-col items-center justify-center">
                  {/* Clean SVG QR Representation */}
                  <svg className="w-28 h-28 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="7" height="7" rx="1" />
                    <rect x="15" y="2" width="7" height="7" rx="1" />
                    <rect x="2" y="15" width="7" height="7" rx="1" />
                    <rect x="4" y="4" width="3" height="3" fill="white" />
                    <rect x="17" y="4" width="3" height="3" fill="white" />
                    <rect x="4" y="17" width="3" height="3" fill="white" />
                    <rect x="11" y="4" width="2" height="2" />
                    <rect x="11" y="9" width="2" height="6" />
                    <rect x="15" y="15" width="3" height="3" />
                    <rect x="19" y="19" width="3" height="3" />
                    <rect x="15" y="19" width="2" height="2" />
                  </svg>
                </div>
                <div className="text-[11px] text-slate-600">
                  <p>UPI ID: <span className="font-number font-bold text-slate-900">fitpulse.studio@icici</span></p>
                  <p className="text-slate-400 mt-0.5">Supports Google Pay, PhonePe, Paytm, CRED</p>
                </div>
              </div>
            )}

            {selectedMethod === 'Credit Card' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-number font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-number font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVC</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-number font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'Cash Desk' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-900">Pay at Front Desk</p>
                <p>Visit the studio reception counter with receipt reference. The desk manager will accept cash or terminal swipe and verify your access card.</p>
              </div>
            )}

            {/* Total and Submit */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Payable</p>
                <p className="font-ios-stat text-2xl text-slate-900">${activePlan.price}.00</p>
              </div>
              <button
                type="button"
                disabled={processing}
                onClick={handleConfirmPayment}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-md disabled:opacity-50 flex items-center space-x-2"
              >
                {processing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <span>Confirm & Pay ${activePlan.price}</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
