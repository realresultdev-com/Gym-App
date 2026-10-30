import type { FeePaymentRecord, MemberFeeProfile } from '../types/gym';
import { IconClose, IconDownload } from './Icons';

interface ReceiptModalProps {
  record: FeePaymentRecord | null;
  profile?: MemberFeeProfile | null;
  onClose: () => void;
}

export function ReceiptModal({ record, profile, onClose }: ReceiptModalProps) {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Receipt Header & Close */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center">
              <img src="/fitpulse-logo.png" alt="FITPULSE" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">FITPULSE STUDIO</h2>
              <p className="text-[11px] text-slate-500">Official Membership Fee Receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
          <div>
            <p className="text-slate-400 font-medium">Invoice Number</p>
            <p className="font-number font-bold text-slate-900 tracking-tight mt-0.5">{record.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Date Paid</p>
            <p className="font-number font-bold text-slate-900 mt-0.5">{record.paidDate}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Billed To</p>
            <p className="font-semibold text-slate-900 mt-0.5">{record.memberName}</p>
            <p className="text-[10px] text-slate-500">{profile?.memberEmail || 'Verified Member'}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Payment Method</p>
            <p className="font-semibold text-slate-900 mt-0.5">{record.method}</p>
          </div>
        </div>

        {/* Itemized Breakdown Table */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Valid Through</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900">{record.planName}</p>
                  <p className="text-[10px] text-slate-400">Full facility & equipment access</p>
                </td>
                <td className="py-3 px-4 text-slate-600 font-medium">
                  {record.nextDueDate}
                </td>
                <td className="py-3 px-4 text-right font-number font-bold text-slate-900 tracking-tight">
                  ${record.amount.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-slate-50/50">
                <td colSpan={2} className="py-2 px-4 text-slate-500 font-medium">
                  Facility Maintenance & Taxes
                </td>
                <td className="py-2 px-4 text-right font-number text-slate-600 font-medium">$0.00</td>
              </tr>
              <tr className="bg-slate-50 font-bold border-t border-slate-200">
                <td colSpan={2} className="py-3 px-4 text-slate-900 text-sm">
                  Total Paid
                </td>
                <td className="py-3 px-4 text-right font-ios-stat text-lg text-emerald-600">
                  ${record.amount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Status Stamp & Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-900 font-bold tracking-wide">STATUS: COMPLETED & VERIFIED</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">{record.recordedBy || 'System Verified'}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
          >
            <IconDownload className="w-4 h-4" />
            <span>Print / Save Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

