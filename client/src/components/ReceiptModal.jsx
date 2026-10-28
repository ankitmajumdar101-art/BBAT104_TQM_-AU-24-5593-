import React from 'react';
import { Printer, X, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const upiString = `upi://pay?pa=royalfeast@upi&pn=RoyalFeastRestaurant&am=${parseFloat(order.total).toFixed(2)}&cu=INR&tn=${order.bill_number}`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="#10B981" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Order Receipt
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#64748B',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div id="printable-receipt" style={{
            background: '#FFF',
            border: '1px dashed #CBD5E1',
            borderRadius: '8px',
            padding: '20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px'
          }}>
            {/* Store Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed #CBD5E1', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                ROYAL FEAST RESTAURANT
              </h2>
              <p style={{ margin: 0, color: '#64748B', fontSize: '11px' }}>
                GSTIN: 27AABCR1234F1Z8
              </p>
              <p style={{ margin: 0, color: '#64748B', fontSize: '11px' }}>
                Main Road, City Center • Phone: +91 98765 43210
              </p>
            </div>

            {/* Bill Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span><strong>Bill #:</strong> {order.bill_number}</span>
              <span><strong>Table:</strong> #{order.table_number}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span><strong>Date:</strong> {new Date(order.created_at || Date.now()).toLocaleString()}</span>
              <span><strong>Cashier:</strong> {order.cashier_name || order.created_by_username || 'Staff'}</span>
            </div>
            <div style={{ fontSize: '11px', marginBottom: '12px', borderBottom: '1px dashed #CBD5E1', paddingBottom: '8px' }}>
              <span><strong>Customer:</strong> {order.customer_name} {order.customer_phone ? `(${order.customer_phone})` : ''}</span>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #CBD5E1', textAlign: 'left' }}>
                  <th style={{ padding: '4px 0' }}>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px dotted #E2E8F0' }}>
                    <td style={{ padding: '6px 0' }}>{it.item_name}</td>
                    <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{parseFloat(it.price).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{parseFloat(it.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '10px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Subtotal:</span>
                <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#64748B' }}>
                <span>CGST (2.5%):</span>
                <span>₹{(parseFloat(order.tax_amount) / 2).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#64748B' }}>
                <span>SGST (2.5%):</span>
                <span>₹{(parseFloat(order.tax_amount) / 2).toFixed(2)}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#16A34A' }}>
                  <span>Discount:</span>
                  <span>-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: '800',
                borderTop: '1px solid #0F172A',
                borderBottom: '1px solid #0F172A',
                padding: '6px 0',
                marginTop: '6px',
                marginBottom: '8px'
              }}>
                <span>GRAND TOTAL:</span>
                <span>₹{parseFloat(order.total).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                <span>Payment Mode:</span>
                <span style={{ fontWeight: '700' }}>{order.payment_method?.toUpperCase()}</span>
              </div>
            </div>

            {/* Dynamic UPI QR Code for contactless payment */}
            {order.payment_method === 'UPI' && (
              <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #CBD5E1' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>
                  SCAN TO PAY VIA GOOGLE PAY / PHONEPE / PAYTM:
                </p>
                <div style={{ display: 'inline-block', padding: '8px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                  <QRCodeSVG value={upiString} size={110} />
                </div>
                <p style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                  Amount: ₹{parseFloat(order.total).toFixed(2)}
                </p>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '10px', color: '#94A3B8' }}>
              Thank You For Dining With Us! Please Visit Again.
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="no-print" style={{
          padding: '16px 20px',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#FFF',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(115, 15, 25, 0.3)'
            }}
          >
            <Printer size={18} />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              background: '#E2E8F0',
              color: '#334155',
              fontWeight: '600'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
