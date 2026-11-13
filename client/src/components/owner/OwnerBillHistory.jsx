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
import { QRCodeSVG } from 'qrcode.react';
import { printReceiptElement } from '../../utils/printReceipt';

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
    printReceiptElement('printable-receipt', `Receipt_${selectedBill?.bill_number || 'Bill'}`);
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
      {selectedBill && (() => {
        const subtotalNum = parseFloat(selectedBill.subtotal || 0).toFixed(2);
        const cgstRate = settings.tax_rate_cgst || 2.5;
        const sgstRate = settings.tax_rate_sgst || 2.5;
        const cgstAmount = ((parseFloat(subtotalNum) * cgstRate) / 100).toFixed(2);
        const sgstAmount = ((parseFloat(subtotalNum) * sgstRate) / 100).toFixed(2);
        const discountAmount = parseFloat(selectedBill.discount_amount || 0).toFixed(2);
        const grandTotalNum = parseFloat(selectedBill.total || 0).toFixed(2);
        const upiString = `upi://pay?pa=royalfeast@upi&pn=RoyalFeastRestaurant&am=${grandTotalNum}&cu=INR&tn=${selectedBill.bill_number}`;

        return (
          <div className="receipt-modal-backdrop" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}>
            <div className="receipt-modal-card" style={{
              background: '#FFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '460px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              position: 'relative'
            }}>
              {/* Modal Header */}
              <div className="no-print" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid #E2E8F0',
                background: '#FEF3C7'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#B45309" />
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#92400E' }}>
                    Owner Bill Surveillance • Read-Only
                  </span>
                </div>
                <button
                  className="no-print"
                  onClick={() => setSelectedBill(null)}
                  style={{
                    background: '#FDE68A',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#92400E'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Printable Receipt Body */}
              <div style={{ padding: '20px', overflowY: 'auto', flex: 1, background: '#F8FAFC' }}>
                <div id="printable-receipt" style={{
                  background: '#FFF',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '10px',
                  padding: '20px 18px',
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: '12px',
                  color: '#1E293B',
                  lineHeight: 1.4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                  {/* Duplicate Audit Copy Watermark */}
                  <div style={{
                    border: '2px dashed #DC2626',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    textAlign: 'center',
                    padding: '4px',
                    fontWeight: '900',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    borderRadius: '4px'
                  }}>
                    *** DUPLICATE AUDIT COPY (READ-ONLY) ***
                  </div>

                  {/* Store Header */}
                  <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '1px dashed #CBD5E1', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>
                      {settings.receipt_header || settings.restaurant_name || 'ROYAL FEAST RESTAURANT'}
                    </h2>
                    <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#475569' }}>
                      {settings.address || 'Civil Lines, Prayagraj, UP'}
                    </p>
                    <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#475569' }}>
                      Phone: {settings.phone || '+91 98765 43210'}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#0F172A' }}>
                      GSTIN: {settings.gstin || '09AAAAA0000A1Z5'}
                    </p>
                    <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '700', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                      TAX INVOICE
                    </div>
                  </div>

                  {/* Bill Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span><strong>Bill #:</strong> {selectedBill.bill_number}</span>
                    <span><strong>Table:</strong> #{selectedBill.table_number}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span><strong>Date:</strong> {new Date(selectedBill.created_at).toLocaleDateString('en-IN')}</span>
                    <span><strong>Time:</strong> {new Date(selectedBill.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span><strong>Cashier:</strong> {selectedBill.cashier_full_name || selectedBill.cashier_username || 'Front Desk'}</span>
                    <span><strong>Guest:</strong> {selectedBill.customer_name || 'Walk-in'}</span>
                  </div>
                  {selectedBill.customer_phone && (
                    <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                      <span><strong>Phone:</strong> {selectedBill.customer_phone}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span><strong>Order Status:</strong> {selectedBill.order_status}</span>
                    <span><strong>Payment:</strong> {selectedBill.payment_status}</span>
                  </div>

                  {/* Separator */}
                  <div style={{ borderTop: '1px dashed #CBD5E1', margin: '10px 0' }}></div>

                  {/* Items Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px dashed #CBD5E1', textAlign: 'left', color: '#475569' }}>
                        <th style={{ paddingBottom: '6px', width: '50%' }}>ITEM</th>
                        <th style={{ paddingBottom: '6px', textAlign: 'center', width: '15%' }}>QTY</th>
                        <th style={{ paddingBottom: '6px', textAlign: 'right', width: '15%' }}>RATE</th>
                        <th style={{ paddingBottom: '6px', textAlign: 'right', width: '20%' }}>AMT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedBill.items || []).map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px dotted #F1F5F9' }}>
                          <td style={{ padding: '6px 0', fontWeight: '600' }}>
                            {item.item_name}
                          </td>
                          <td style={{ padding: '6px 0', textAlign: 'center' }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: '6px 0', textAlign: 'right' }}>
                            ₹{parseFloat(item.price).toFixed(2)}
                          </td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '600' }}>
                            ₹{parseFloat(item.subtotal).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Separator */}
                  <div style={{ borderTop: '1px dashed #CBD5E1', margin: '10px 0' }}></div>

                  {/* Financial Summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal:</span>
                      <span>₹{subtotalNum}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                      <span>CGST ({cgstRate}%):</span>
                      <span>₹{cgstAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                      <span>SGST ({sgstRate}%):</span>
                      <span>₹{sgstAmount}</span>
                    </div>
                    {parseFloat(discountAmount) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626' }}>
                        <span>Discount ({selectedBill.discount_type}):</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                    )}
                    
                    <div style={{ borderTop: '1px dashed #CBD5E1', margin: '6px 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>
                      <span>GRAND TOTAL:</span>
                      <span>₹{grandTotalNum}</span>
                    </div>

                    <div style={{ borderTop: '1px dashed #CBD5E1', margin: '6px 0' }}></div>

                    {/* Payment Details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span>Payment Mode:</span>
                      <span style={{ fontWeight: '700' }}>{selectedBill.payment_method} ({selectedBill.payment_status})</span>
                    </div>
                  </div>

                  {/* UPI QR Code Section */}
                  {selectedBill.payment_method === 'UPI' && (
                    <div style={{ textAlign: 'center', margin: '14px 0 8px 0', borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
                      <QRCodeSVG value={upiString} size={90} level="M" />
                      <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#64748B' }}>
                        UPI Payment Verified • royalfeast@upi
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ textAlign: 'center', marginTop: '16px', borderTop: '1px dashed #CBD5E1', paddingTop: '10px', color: '#64748B', fontSize: '10px' }}>
                    <p style={{ margin: '0 0 2px 0', fontWeight: '700', color: '#0F172A' }}>
                      {settings.receipt_footer || 'Thank you for dining with us! Please visit again.'}
                    </p>
                    <p style={{ margin: '0 0 2px 0' }}>FSSAI Lic No: 10020021004567</p>
                    <p style={{ margin: 0, fontStyle: 'italic' }}>Authorized Owner Audit View • Tamper-Evident Record</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="no-print" style={{
                padding: '16px 20px',
                borderTop: '1px solid #E2E8F0',
                background: '#FFF',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <button
                  onClick={() => setSelectedBill(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFF',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: '700',
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
                    gap: '8px',
                    padding: '9px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#FFF',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(115, 15, 25, 0.25)'
                  }}
                >
                  <Printer size={16} />
                  <span>Print Receipt Copy</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
