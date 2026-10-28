import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Printer, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  User, 
  Receipt, 
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';

export default function OwnerBillHistory() {
  const [bills, setBills] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [billStatus, setBillStatus] = useState('All');
  const [cashierId, setCashierId] = useState('All');
  const [date, setDate] = useState('');

  // Selected Bill Details Modal (Read-Only)
  const [selectedBill, setSelectedBill] = useState(null);
  const [billModalLoading, setBillModalLoading] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchBills();
  }, [paymentMethod, billStatus, cashierId, date]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/owner/bills?limit=100&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (paymentMethod && paymentMethod !== 'All') url += `paymentMethod=${encodeURIComponent(paymentMethod)}&`;
      if (billStatus && billStatus !== 'All') url += `billStatus=${encodeURIComponent(billStatus)}&`;
      if (cashierId && cashierId !== 'All') url += `cashierId=${cashierId}&`;
      if (date) url += `date=${date}&`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBills(data.bills || []);
        if (data.cashiers) setCashiers(data.cashiers);
      }
    } catch (err) {
      console.error('Fetch bills error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBills();
  };

  const openBillModal = async (billId) => {
    setBillModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/owner/bills/${billId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBill(data.bill);
        setSettings(data.settings || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBillModalLoading(false);
    }
  };

  const handlePrintModal = () => {
    document.body.classList.add('printing-receipt');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-receipt');
    }, 1000);
  };

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Top Banner */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#F1F5F9',
              color: '#334155',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Section E • Read-Only Bill Surveillance
            </span>
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700'
            }}>
              🔒 Zero-Tamper Mode (No Edit / Delete)
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Finalized Bill History
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Inspect full receipts, line items, timestamps, tax breakdowns, and cashier associations.
          </p>
        </div>

        <button
          onClick={fetchBills}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            borderRadius: '10px',
            background: '#F1F5F9',
            color: '#0F172A',
            border: '1px solid #CBD5E1',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        marginBottom: '24px'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search text */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search Bill #, Customer Name, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
          >
            <option value="All">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="UPI / QR">UPI / QR</option>
            <option value="Card">Card</option>
          </select>

          {/* Bill Status Filter */}
          <select
            value={billStatus}
            onChange={(e) => setBillStatus(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Voided">Voided</option>
          </select>

          {/* Cashier Filter */}
          <select
            value={cashierId}
            onChange={(e) => setCashierId(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
          >
            <option value="All">All Cashiers</option>
            {cashiers.map(c => (
              <option key={c.id} value={c.id}>{c.full_name || c.username}</option>
            ))}
          </select>

          {/* Specific Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
          />

          <button
            type="submit"
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#FFF',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>

          {(search || date || paymentMethod !== 'All' || billStatus !== 'All' || cashierId !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setDate('');
                setPaymentMethod('All');
                setBillStatus('All');
                setCashierId('All');
              }}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                background: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Bill Table */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
            Transaction Records ({bills.length} bills)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Audited finalized orders from MySQL orders table
          </span>
        </div>

        {bills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontSize: '14px' }}>
            No finalized bills found matching your criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '10px' }}>Bill #</th>
                  <th style={{ padding: '10px' }}>Finalized Date & Time</th>
                  <th style={{ padding: '10px' }}>Table & Customer</th>
                  <th style={{ padding: '10px' }}>Cashier</th>
                  <th style={{ padding: '10px' }}>Method</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Audit Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '700', color: '#0F172A' }}>
                      {b.bill_number}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#475569' }}>
                      {new Date(b.created_at).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#334155' }}>
                      <span style={{ fontWeight: '600' }}>Table {b.table_number}</span> • {b.customer_name}
                      {b.customer_phone ? ` (${b.customer_phone})` : ''}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#0F172A' }}>
                      {b.cashier_full_name || b.cashier_username || 'Staff'}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: '#F1F5F9',
                        color: '#475569'
                      }}>
                        {b.payment_method}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                      ₹{parseFloat(b.total).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: b.order_status === 'Completed' ? '#ECFDF5' : '#FEF2F2',
                        color: b.order_status === 'Completed' ? '#059669' : '#DC2626'
                      }}>
                        {b.order_status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <button
                        onClick={() => openBillModal(b.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={13} /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Read-Only Bill Receipt Modal */}
      {selectedBill && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              className="no-print"
              onClick={() => setSelectedBill(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={18} />
            </button>

            {/* Receipt Content Printable */}
            <div id="printable-receipt">
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #CBD5E1', paddingBottom: '14px', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 2px 0' }}>
                  {settings.restaurant_name || 'Royal Feast Restaurant'}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0' }}>
                  {settings.address || 'Civil Lines, Prayagraj, UP'}
                </p>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0' }}>
                  Phone: {settings.phone || '+91 98765 43210'} | GSTIN: {settings.gstin || '09AAAAA0000A1Z5'}
                </p>
                <div style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  background: '#FEF3C7',
                  color: '#92400E',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  DUPLICATE AUDIT COPY (READ-ONLY)
                </div>
              </div>

              {/* Bill Details */}
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <div><strong>Bill No:</strong> {selectedBill.bill_number}</div>
                <div><strong>Table:</strong> Table {selectedBill.table_number}</div>
                <div><strong>Customer:</strong> {selectedBill.customer_name}</div>
                <div><strong>Phone:</strong> {selectedBill.customer_phone || 'N/A'}</div>
                <div><strong>Cashier:</strong> {selectedBill.cashier_full_name || selectedBill.cashier_username}</div>
                <div><strong>Date:</strong> {new Date(selectedBill.created_at).toLocaleDateString('en-IN')}</div>
                <div><strong>Time:</strong> {new Date(selectedBill.created_at).toLocaleTimeString('en-IN')}</div>
                <div><strong>Status:</strong> <span style={{ fontWeight: '700', color: selectedBill.order_status === 'Completed' ? '#059669' : '#DC2626' }}>{selectedBill.order_status}</span></div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '14px' }}>
                <thead>
                  <tr style={{ borderTop: '1px dashed #CBD5E1', borderBottom: '1px dashed #CBD5E1', textAlign: 'left' }}>
                    <th style={{ padding: '6px 0' }}>Item</th>
                    <th style={{ padding: '6px 0', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '6px 0', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '6px 0', textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedBill.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 0', fontWeight: '600' }}>{it.item_name}</td>
                      <td style={{ padding: '6px 0', textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right' }}>₹{parseFloat(it.price).toFixed(2)}</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '700' }}>₹{parseFloat(it.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Breakdown */}
              <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '10px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Subtotal:</span>
                  <span style={{ fontWeight: '600' }}>₹{parseFloat(selectedBill.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(selectedBill.discount_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                    <span>Discount ({selectedBill.discount_type}):</span>
                    <span>- ₹{parseFloat(selectedBill.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563EB' }}>
                  <span>Taxes (5.00% GST):</span>
                  <span>+ ₹{parseFloat(selectedBill.tax_amount).toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  fontWeight: '800',
                  color: '#0F172A',
                  borderTop: '1px solid #E2E8F0',
                  paddingTop: '6px',
                  marginTop: '4px'
                }}>
                  <span>Grand Total:</span>
                  <span style={{ color: '#059669' }}>₹{parseFloat(selectedBill.total).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span>Payment Method:</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>{selectedBill.payment_method} ({selectedBill.payment_status})</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div style={{ textAlign: 'center', borderTop: '1px dashed #CBD5E1', paddingTop: '12px', marginTop: '14px', fontSize: '11px', color: '#94A3B8' }}>
                <p style={{ margin: '2px 0' }}>{settings.receipt_footer || 'Thank you for dining with us! Please visit again.'}</p>
                <p style={{ margin: '2px 0', fontStyle: 'italic' }}>Authorized Owner Audit View • No Direct Edits Permitted</p>
              </div>
            </div>

            {/* Print Action */}
            <div className="no-print" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setSelectedBill(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={handlePrintModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: 'var(--primary)',
                  color: '#FFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Printer size={15} /> Print Receipt Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
