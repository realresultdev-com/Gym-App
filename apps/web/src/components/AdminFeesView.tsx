import { useState, useMemo } from 'react';
import type { MemberFeeProfile, FeePaymentRecord, PaymentMethod, FeeStatus } from '../types/gym';
import {
  IconDollar,
  IconReceipt,
  IconCalendar,
  IconCheckCircle,
  IconAlertCircle,
  IconClose,
  IconPlus,
  IconBell,
} from './Icons';

interface AdminFeesViewProps {
  feeProfiles: MemberFeeProfile[];
  paymentRecords: FeePaymentRecord[];
  onRecordPayment: (
    memberId: string,
    amount: number,
    planName: MemberFeeProfile['planName'],
    method: PaymentMethod,
    tenureMonths: number,
    notes?: string
  ) => void;
  onSendReminder: (memberId: string, memberName: string, amount: number, dueDate: string) => void;
  onViewReceipt: (record: FeePaymentRecord) => void;
}

export function AdminFeesView({
  feeProfiles,
  paymentRecords,
  onRecordPayment,
  onSendReminder,
  onViewReceipt,
}: AdminFeesViewProps) {
  const [filterStatus, setFilterStatus] = useState<'ALL' | FeeStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(feeProfiles[0]?.memberId || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(240);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash Desk');
  const [tenureMonths, setTenureMonths] = useState<number>(3);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [feedbackToast, setFeedbackToast] = useState('');

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  // KPI Calculations
  const totalCollectedThisMonth = useMemo(() => {
    return paymentRecords.reduce((acc, curr) => acc + curr.amount, 0);
  }, [paymentRecords]);

  const overdueDuesTotal = useMemo(() => {
    return feeProfiles
      .filter((p) => p.status === 'OVERDUE')
      .reduce((acc, curr) => acc + curr.nextDueAmount, 0);
  }, [feeProfiles]);

  const dueSoonCount = useMemo(() => {
    return feeProfiles.filter((p) => p.status === 'DUE_SOON' || (p.daysRemaining >= 0 && p.daysRemaining <= 7)).length;
  }, [feeProfiles]);

  const overdueCount = useMemo(() => {
    return feeProfiles.filter((p) => p.status === 'OVERDUE').length;
  }, [feeProfiles]);

  // Filtered Roster
  const filteredProfiles = useMemo(() => {
    return feeProfiles.filter((p) => {
      const matchFilter = filterStatus === 'ALL' ? true : p.status === filterStatus;
      const matchSearch =
        p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.memberEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lastInvoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [feeProfiles, filterStatus, searchQuery]);

  const handleOpenCollectForMember = (profile: MemberFeeProfile) => {
    setSelectedMemberId(profile.memberId);
    setPaymentAmount(profile.nextDueAmount);
    setCollectModalOpen(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = feeProfiles.find((p) => p.memberId === selectedMemberId);
    if (!targetMember) return;

    onRecordPayment(
      selectedMemberId,
      paymentAmount,
      targetMember.planName,
      paymentMethod,
      tenureMonths,
      paymentNotes || `Manual fee collection at front desk`
    );

    triggerToast(`Payment of $${paymentAmount} logged for ${targetMember.memberName}!`);
    setCollectModalOpen(false);
    setPaymentNotes('');
  };

  const handleSendReminderClick = (profile: MemberFeeProfile) => {
    onSendReminder(profile.memberId, profile.memberName, profile.nextDueAmount, profile.nextDueDate);
    triggerToast(`Fee reminder notification dispatched to ${profile.memberName}!`);
  };

  return (
    <div className="space-y-6 antialiased">
      
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-3">
          <IconCheckCircle className="w-4 h-4 text-amber-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header & Global Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fee Collections & Billing Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">Studio revenue control, membership dues, and receipt auditing</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (feeProfiles.length > 0) {
                setSelectedMemberId(feeProfiles[0].memberId);
                setPaymentAmount(feeProfiles[0].nextDueAmount);
              }
              setCollectModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-sm flex items-center space-x-1.5"
          >
            <IconPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Record Fee Payment</span>
          </button>
        </div>
      </div>

      {/* Financial Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Total Collected</p>
            <IconDollar className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">${totalCollectedThisMonth.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Verified studio ledger</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Overdue Dues</p>
            <IconAlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-1">${overdueDuesTotal}</p>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">{overdueCount} member{overdueCount !== 1 ? 's' : ''} past due</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Renewals Due &lt; 7 Days</p>
            <IconCalendar className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{dueSoonCount}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Upcoming cycle renewals</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Active Membership Roster</p>
            <IconCheckCircle className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{feeProfiles.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Enrolled fitness athletes</p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        
        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {(['ALL', 'PAID', 'DUE_SOON', 'OVERDUE'] as const).map((status) => {
            const isSelected = filterStatus === status;
            const label = status === 'ALL' ? 'All Members' : status === 'PAID' ? 'Paid / Active' : status === 'DUE_SOON' ? 'Due Soon' : 'Overdue';
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="sm:w-64">
          <input
            type="text"
            placeholder="Search member, email, invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>

      </div>

      {/* Main Members Fee Roster Table */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Member Fees & Billing Ledger</h3>
            <p className="text-xs text-slate-500">Live payment statuses, last recorded transaction & upcoming fee schedule</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filteredProfiles.length} of {feeProfiles.length} members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50/70">
                <th className="py-3 px-4">Member Info</th>
                <th className="py-3 px-4">Plan / Cycle</th>
                <th className="py-3 px-4">Last Payment</th>
                <th className="py-3 px-4">Next Fee Due</th>
                <th className="py-3 px-4">Billing Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((p) => {
                // Find matching recent payment record
                const recentRecord = paymentRecords.find((r) => r.memberId === p.memberId);

                return (
                  <tr key={p.memberId} className="hover:bg-slate-50/70 transition">
                    
                    {/* Member Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                            alt={p.memberName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.memberName}</p>
                          <p className="text-[11px] text-slate-400">{p.memberEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{p.planName}</p>
                      <p className="text-[10px] text-slate-500">{p.billingFrequency} Cycle • ${p.feeAmount}</p>
                    </td>

                    {/* Last Payment */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900">${p.lastPaymentAmount.toFixed(2)}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                            {p.lastPaymentMethod}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{p.lastPaymentDate}</p>
                        <p className="font-mono text-[9px] text-slate-400">{p.lastInvoiceNumber}</p>
                      </div>
                    </td>

                    {/* Next Fee Due */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">${p.nextDueAmount.toFixed(2)}</p>
                        <p className="text-[11px] font-semibold text-slate-700">{p.nextDueDate}</p>
                        <p className={`text-[10px] font-bold ${
                          p.daysRemaining < 0
                            ? 'text-rose-600'
                            : p.daysRemaining <= 3
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}>
                          {p.daysRemaining < 0
                            ? `Overdue by ${Math.abs(p.daysRemaining)} days`
                            : p.daysRemaining === 0
                            ? 'Due Today'
                            : `${p.daysRemaining} days left`}
                        </p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'OVERDUE'
                          ? 'bg-rose-100 text-rose-800'
                          : p.status === 'DUE_SOON'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenCollectForMember(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition cursor-pointer shadow-sm"
                          title="Collect Fee"
                        >
                          Collect
                        </button>
                        <button
                          onClick={() => handleSendReminderClick(p)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition cursor-pointer flex items-center space-x-1"
                          title="Send Fee Reminder Alert"
                        >
                          <IconBell className="w-3 h-3 text-slate-500" />
                          <span>Remind</span>
                        </button>
                        {recentRecord && (
                          <button
                            onClick={() => onViewReceipt(recentRecord)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="View Last Receipt"
                          >
                            <IconReceipt className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          ADMIN MANUAL COLLECT FEE MODAL
      ========================================================== */}
      {collectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 antialiased">
          <form
            onSubmit={handleSubmitPayment}
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Fee Collection</h3>
                <p className="text-xs text-slate-500">Log reception desk cash, terminal card or bank payment</p>
              </div>
              <button
                type="button"
                onClick={() => setCollectModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            {/* Select Member */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Member</label>
              <select
                value={selectedMemberId}
                onChange={(e) => {
                  setSelectedMemberId(e.target.value);
                  const mem = feeProfiles.find((m) => m.memberId === e.target.value);
                  if (mem) setPaymentAmount(mem.nextDueAmount);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {feeProfiles.map((mem) => (
                  <option key={mem.memberId} value={mem.memberId}>
                    {mem.memberName} ({mem.planName} - Due: ${mem.nextDueAmount})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount and Cycle Extension */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Extend Access</label>
                <select
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value={1}>+ 1 Month</option>
                  <option value={3}>+ 3 Months (Quarterly)</option>
                  <option value={6}>+ 6 Months</option>
                  <option value={12}>+ 1 Year (Annual)</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Collection Channel</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Cash Desk', 'UPI / QR', 'Credit Card', 'Bank Transfer'] as PaymentMethod[]).map((m) => {
                  const isSelected = paymentMethod === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Transaction Reference</label>
              <input
                type="text"
                placeholder="e.g. Front desk POS slip #4891 or Cash bill"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCollectModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-sm"
              >
                Record Payment & Issue Receipt
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
