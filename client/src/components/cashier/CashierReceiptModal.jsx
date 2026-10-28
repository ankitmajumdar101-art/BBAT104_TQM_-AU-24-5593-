import React from 'react';
import { Printer, X, CheckCircle2, QrCode, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { printReceiptElement } from '../../utils/printReceipt';

export default function CashierReceiptModal({ order, onClose, isReprint = false }) {
  if (!order) return null;

  const handlePrint = () => {
    printReceiptElement('printable-receipt', `Receipt_${order.bill_number || 'Bill'}`);
  };

  const totalNum = parseFloat(order.total || 0).toFixed(2);
  const upiString = `upi://pay?pa=royalfeast@upi&pn=RoyalFeastRestaurant&am=${totalNum}&cu=INR&tn=${order.bill_number}`;

  const settings = order.settings || {
    restaurant_name: 'Royal Feast Restaurant',
    address: '101 Commercial Boulevard, City Center',
    phone: '+91 98765 43210',
    gstin: '27AABCR1234F1Z8',
    receipt_header: 'ROYAL FEAST RESTAURANT',
    receipt_footer: 'Thank you for dining with us! Please visit again.',
    tax_rate_cgst: 2.5,
    tax_rate_sgst: 2.5
  };

  const subtotal = parseFloat(order.subtotal || 0).toFixed(2);
  const cgstAmount = ((parseFloat(subtotal) * (settings.tax_rate_cgst || 2.5)) / 100).toFixed(2);
  const sgstAmount = ((parseFloat(subtotal) * (settings.tax_rate_sgst || 2.5)) / 100).toFixed(2);
  const discountAmount = parseFloat(order.discount_amount || 0).toFixed(2);
  const amountReceived = parseFloat(order.amount_received || order.total || 0).toFixed(2);
  const changeDue = parseFloat(order.change_due || 0).toFixed(2);

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
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}>
        {/* Modal Header */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #E2E8F0',
          background: isReprint ? '#FEF2F2' : '#F0FDF4'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isReprint ? (
              <AlertTriangle size={20} color="#DC2626" />
            ) : (
              <CheckCircle2 size={20} color="#16A34A" />
            )}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: isReprint ? '#991B1B' : '#166534', margin: 0 }}>
                {isReprint ? 'Duplicate Receipt Reprint' : 'Bill Generated Successfully'}
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
                {order.bill_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
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
            {/* Watermark for Duplicate */}
            {isReprint && (
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
                *** DUPLICATE COPY / REPRINT ***
              </div>
            )}

            {/* Store Header */}
            <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '1px dashed #CBD5E1', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>
                {settings.receipt_header || settings.restaurant_name}
              </h2>
              <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#475569' }}>
                {settings.address}
              </p>
              <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#475569' }}>
                Phone: {settings.phone}
              </p>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#0F172A' }}>
                GSTIN: {settings.gstin}
              </p>
              <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '700', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                TAX INVOICE
              </div>
            </div>

            {/* Bill Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span><strong>Bill #:</strong> {order.bill_number}</span>
              <span><strong>Table:</strong> #{order.table_number}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span><strong>Date:</strong> {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}</span>
              <span><strong>Time:</strong> {new Date(order.created_at || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span><strong>Cashier:</strong> {order.cashier_username || order.cashier_name || 'Front Desk'}</span>
              <span><strong>Guest:</strong> {order.customer_name || 'Walk-in'}</span>
            </div>
            {order.customer_phone && (
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                <span><strong>Phone:</strong> {order.customer_phone}</span>
              </div>
            )}

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
                {(order.items || []).map((item, idx) => (
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
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>CGST ({settings.tax_rate_cgst || 2.5}%):</span>
                <span>₹{cgstAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>SGST ({settings.tax_rate_sgst || 2.5}%):</span>
                <span>₹{sgstAmount}</span>
              </div>
              {parseFloat(discountAmount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626' }}>
                  <span>Discount ({order.discount_type === 'percentage' ? `${order.discount_value}%` : 'Fixed'}):</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              
              <div style={{ borderTop: '1px dashed #CBD5E1', margin: '6px 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>
                <span>GRAND TOTAL:</span>
                <span>₹{totalNum}</span>
              </div>

              <div style={{ borderTop: '1px dashed #CBD5E1', margin: '6px 0' }}></div>

              {/* Payment Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span>Payment Mode:</span>
                <span style={{ fontWeight: '700' }}>{order.payment_method}</span>
              </div>

              {order.payment_method === 'Cash' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>Amount Received:</span>
                    <span>₹{amountReceived}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#16A34A' }}>
                    <span>Change Due:</span>
                    <span>₹{changeDue}</span>
                  </div>
                </>
              )}

              {order.transaction_reference && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#475569' }}>
                  <span>Txn Ref / UTR:</span>
                  <span style={{ fontFamily: 'monospace' }}>{order.transaction_reference}</span>
                </div>
              )}
            </div>

            {/* UPI QR Code Section */}
            {order.payment_method === 'UPI' && (
              <div style={{ textAlign: 'center', margin: '14px 0 8px 0', borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
                <QRCodeSVG value={upiString} size={90} level="M" />
                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#64748B' }}>
                  Scan to Pay UPI • royalfeast@upi
                </p>
              </div>
            )}

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '16px', borderTop: '1px dashed #CBD5E1', paddingTop: '10px', color: '#64748B', fontSize: '10px' }}>
              <p style={{ margin: '0 0 2px 0', fontWeight: '700', color: '#0F172A' }}>
                {settings.receipt_footer || 'Thank you for dining with us!'}
              </p>
              <p style={{ margin: 0 }}>FSSAI Lic No: 10020021004567</p>
              <p style={{ margin: 0 }}>GST Registered Composite/Regular Taxpayer</p>
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
            onClick={onClose}
            style={{
              padding: '10px 18px',
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
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#2563EB',
              color: '#FFF',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Printer size={16} />
            <span>Print Thermal Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}