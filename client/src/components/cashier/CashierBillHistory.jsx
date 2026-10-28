import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Printer, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  X,
  FileText
} from 'lucide-react';

export default function CashierBillHistory({ onReprintOrder }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Refund Modal State
  const [selectedBillForRefund, setSelectedBillForRefund] = useState(null);
  const [refundType, setRefundType] = useState('Refund'); // 'Refund' or 'Void'
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundFeedback, setRefundFeedback] = useState({ type: '', message: '' });

  const fetchMyBills = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (paymentMethod && paymentMethod !== 'All') params.append('payment_method', paymentMethod);
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);

      const res = await fetch(`/api/orders/my-history?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBills(data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch your bill history.');
      }
    } catch (err) {
      setError('Network error loading history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBills();
  }, [paymentMethod, statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMyBills();
  };

  const handleResetFilters = () => {
    setSearch('');
    setPaymentMethod('All');
    setStatusFilter('All');
    setDateFilter('');
  };

  const handleOpenRefundModal = (bill) => {
    setSelectedBillForRefund(bill);
    setRefundType('Refund');
    setRefundReason('');
    setRefundFeedback({ type: '', message: '' });
  };

  const handleSubmitRefundRequest = async (e) => {
    e.preventDefault();
    if (!refundReason.trim()) {
      setRefundFeedback({ type: 'error', message: 'Please specify the exact reason for the refund / void.' });
      return;
    }

    setSubmittingRefund(true);
    setRefundFeedback({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${selectedBillForRefund.id}/request-refund-void`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          request_type: refundType,
          reason: refundReason.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setRefundFeedback({ type: 'success', message: data.message });
        setTimeout(() => {
          setSelectedBillForRefund(null);
          fetchMyBills();
        }, 1200);
      } else {
        setRefundFeedback({ type: 'error', message: data.message || 'Failed to submit request.' });
      }
    } catch (err) {
      setRefundFeedback({ type: 'error', message: 'Network error submitting request.' });
    } finally {
      setSubmittingRefund(false);
    }
  };

  const totalFilteredValue = bills.reduce((sum, b) => sum + parseFloat(b.total || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Filters Bar */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              My Invoices & Bill History
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Records strictly created by your cashier account with audit security and reprint capability.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
              Total: <strong style={{ color: '#0F172A' }}>{bills.length} bills</strong> (₹{totalFilteredValue.toFixed(2)})
            </span>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Bill #, guest name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Payment Method */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              background: '#FFF'
            }}
          >
            <option value="All">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Net Banking">Net Banking</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              background: '#FFF'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Refund Pending">Refund Requested</option>
            <option value="Refunded">Refunded / Voided</option>
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px'
            }}
          />

          <button
            type="submit"
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563EB',
              color: '#FFF',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Filter
          </button>

          {(search || paymentMethod !== 'All' || statusFilter !== 'All' || dateFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#64748B',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '12px 16px', borderRadius: '10px', color: '#991B1B', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Bills Table */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748B' }}>
            <p>Loading your bill history...</p>
          </div>
        ) : bills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
            <FileText size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>No bills found matching current filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Bill Number</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Table</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Guest</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Payment Mode</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => {
                  const isRefundPending = bill.refund_status === 'Pending';
                  const isRefundApproved = bill.refund_status === 'Approved' || bill.order_status === 'Refunded' || bill.order_status === 'Voided';

                  return (
                    <tr key={bill.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>
                        {bill.bill_number}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '12px' }}>
                        {new Date(bill.created_at).toLocaleDateString('en-IN')}{' '}
                        <span style={{ color: '#94A3B8' }}>
                          {new Date(bill.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>
                          T-{bill.table_number}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#1E293B' }}>{bill.customer_name}</div>
                        {bill.customer_phone && (
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{bill.customer_phone}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0F172A' }}>
                        ₹{parseFloat(bill.total).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: bill.payment_method === 'Cash' ? '#ECFDF5' : '#EFF6FF',
                          color: bill.payment_method === 'Cash' ? '#065F46' : '#1E40AF'
                        }}>
                          {bill.payment_method}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {isRefundPending ? (
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#D97706', background: '#FEF3C7', padding: '3px 8px', borderRadius: '10px' }}>
                            Refund Requested
                          </span>
                        ) : isRefundApproved ? (
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#DC2626', background: '#FEE2E2', padding: '3px 8px', borderRadius: '10px' }}>
                            {bill.order_status}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: '10px' }}>
                            Completed
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => onReprintOrder(bill.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              color: '#334155',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Printer size={13} />
                            <span>Reprint</span>
                          </button>

                          {!isRefundPending && !isRefundApproved && (
                            <button
                              onClick={() => handleOpenRefundModal(bill)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#FFF',
                                border: '1px solid #FCA5A5',
                                color: '#DC2626',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              <RotateCcw size={13} />
                              <span>Request Refund</span>
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
        )}
      </div>

      {/* Refund / Void Request Modal */}
      {selectedBillForRefund && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            border: '1px solid #E2E8F0'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              background: '#FEF2F2',
              borderBottom: '1px solid #FCA5A5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#991B1B' }}>
                  Request Refund or Void
                </h4>
              </div>
              <button
                onClick={() => setSelectedBillForRefund(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitRefundRequest} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', fontSize: '12px' }}>
                <div><strong>Bill Number:</strong> {selectedBillForRefund.bill_number}</div>
                <div><strong>Table:</strong> #{selectedBillForRefund.table_number} | <strong>Guest:</strong> {selectedBillForRefund.customer_name}</div>
                <div><strong>Amount:</strong> ₹{parseFloat(selectedBillForRefund.total).toFixed(2)} ({selectedBillForRefund.payment_method})</div>
              </div>

              {refundFeedback.message && (
                <div style={{
                  background: refundFeedback.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                  border: refundFeedback.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FCA5A5',
                  color: refundFeedback.type === 'success' ? '#166534' : '#991B1B',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {refundFeedback.message}
                </div>
              )}

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  REQUEST TYPE
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setRefundType('Refund')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: refundType === 'Refund' ? '2px solid #DC2626' : '1px solid #CBD5E1',
                      background: refundType === 'Refund' ? '#FEE2E2' : '#FFF',
                      color: refundType === 'Refund' ? '#991B1B' : '#475569',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Customer Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundType('Void')}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: refundType === 'Void' ? '2px solid #DC2626' : '1px solid #CBD5E1',
                      background: refundType === 'Void' ? '#FEE2E2' : '#FFF',
                      color: refundType === 'Void' ? '#991B1B' : '#475569',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Void Accidental Bill
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  MANDATORY REASON & EXPLANATION *
                </label>
                <textarea
                  required
                  rows="3"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Explain why this bill requires refund or void (e.g. Guest returned wrong dish, billed duplicate item)..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                ℹ️ <strong>Policy:</strong> Cashiers cannot cancel finalized bills directly. This request will be audited and routed to the Administrator / Owner for authorization.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedBillForRefund(null)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFF',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#DC2626',
                    color: '#FFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {submittingRefund ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}