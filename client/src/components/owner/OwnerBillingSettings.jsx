import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  Receipt, 
  DollarSign, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  ShieldCheck,
  RefreshCw,
  Coins,
  Scale
} from 'lucide-react';

export default function OwnerBillingSettings() {
  const [settings, setSettings] = useState({
    tax_rate_cgst: '2.50',
    tax_rate_sgst: '2.50',
    tax_calculation_mode: 'exclusive',
    max_discount_percent: '30.00',
    receipt_prefix: 'BILL',
    currency_symbol: '₹',
    currency_code: 'INR',
    billing_rounding: 'exact',
    receipt_header: 'ROYAL FEAST RESTAURANT',
    receipt_footer: 'Thank you for dining with us! Please visit again.'
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/billing-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/billing-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Tax rates, GST structure, and billing configuration updated and saved successfully by Restaurant Owner.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update billing settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network communication error.' });
    } finally {
      setSaving(false);
    }
  };

  const totalTax = (parseFloat(settings.tax_rate_cgst || 0) + parseFloat(settings.tax_rate_sgst || 0)).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '22px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}>
              👑 Executive Owner Privilege
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              • Statutory Tax, GST Rates & Invoicing Controls
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Tax & Invoicing Policy Settings
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Configure legal GST tax rates (CGST + SGST), maximum allowable discount limits, and invoice receipt formatting.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Reload Settings</span>
        </button>
      </div>

      {message && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: message.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          color: message.type === 'success' ? '#15803D' : '#991B1B',
          border: message.type === 'success' ? '1px solid #86EFAC' : '1px solid #FCA5A5'
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* GST & Tax Rates Card */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Percent size={18} color="var(--primary)" /> Indian GST Tax Configuration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                CGST RATE (%) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={settings.tax_rate_cgst}
                onChange={(e) => setSettings({ ...settings, tax_rate_cgst: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '700' }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B' }}>Central Goods and Services Tax (Standard: 2.50%)</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                SGST RATE (%) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={settings.tax_rate_sgst}
                onChange={(e) => setSettings({ ...settings, tax_rate_sgst: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '700' }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B' }}>State Goods and Services Tax (Standard: 2.50%)</p>
            </div>

            {/* Combined Tax Display */}
            <div style={{
              background: '#FEF3C7',
              borderRadius: '10px',
              padding: '12px 16px',
              border: '1px solid #FCD34D',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400E', textTransform: 'uppercase' }}>
                TOTAL EFFECTIVE GST RATE
              </span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#78350F' }}>
                {totalTax}% GST
              </div>
              <span style={{ fontSize: '11px', color: '#B45309' }}>
                Calculated server-side on invoice subtotal
              </span>
            </div>
          </div>
        </div>

        {/* Discount & Invoicing Rules */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={18} color="var(--primary)" /> Discount Ceilings & Rounding Rules
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                MAX ALLOWED DISCOUNT LIMIT (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={settings.max_discount_percent}
                onChange={(e) => setSettings({ ...settings, max_discount_percent: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '700' }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B' }}>Poka-Yoke safeguard: cashiers cannot exceed this discount</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                BILLING ROUNDING MODE
              </label>
              <select
                value={settings.billing_rounding}
                onChange={(e) => setSettings({ ...settings, billing_rounding: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '600', background: '#FFF' }}
              >
                <option value="exact">Exact Decimals (₹123.45)</option>
                <option value="nearest_rupee">Nearest Rupee Rounding (₹123.00)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                INVOICE BILL NUMBER PREFIX
              </label>
              <input
                type="text"
                required
                value={settings.receipt_prefix}
                onChange={(e) => setSettings({ ...settings, receipt_prefix: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '700' }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B' }}>Prefix on customer receipts (e.g. BILL-YYYYMMDD-XXXX)</p>
            </div>
          </div>
        </div>

        {/* Receipt Header & Footer */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={18} color="var(--primary)" /> Printed Receipt Letterhead Notes
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                RECEIPT HEADER TITLE
              </label>
              <input
                type="text"
                value={settings.receipt_header}
                onChange={(e) => setSettings({ ...settings, receipt_header: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                RECEIPT FOOTER COURTESY MESSAGE
              </label>
              <input
                type="text"
                value={settings.receipt_footer}
                onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: '#FFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: '800',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(180, 83, 9, 0.3)'
            }}
          >
            <Save size={18} />
            <span>{saving ? 'Saving Changes...' : 'Save Tax & Billing Policy'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
