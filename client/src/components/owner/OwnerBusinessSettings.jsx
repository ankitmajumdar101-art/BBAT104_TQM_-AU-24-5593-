import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert,
  RefreshCw,
  Receipt,
  Sparkles,
  Printer
} from 'lucide-react';

export default function OwnerBusinessSettings() {
  const [settings, setSettings] = useState({
    restaurant_name: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    receipt_header: '',
    receipt_footer: '',
    currency_symbol: '₹'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({
          restaurant_name: data.settings.restaurant_name ?? '',
          tagline: data.settings.tagline ?? '',
          address: data.settings.address ?? '',
          phone: data.settings.phone ?? '',
          email: data.settings.email ?? '',
          gstin: data.settings.gstin ?? '',
          receipt_header: data.settings.receipt_header ?? '',
          receipt_footer: data.settings.receipt_footer ?? '',
          currency_symbol: data.settings.currency_symbol || '₹'
        });
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
      setMessage({ type: 'error', text: 'Failed to load business profile settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Basic client validation
    if (!settings.restaurant_name?.trim()) {
      setMessage({ type: 'error', text: 'Restaurant Trade Name is mandatory.' });
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        // 1. Sync to local storage for instant access across tabs
        if (settings.restaurant_name) {
          localStorage.setItem('restaurant_name', settings.restaurant_name.trim());
        }
        if (settings.currency_symbol) {
          localStorage.setItem('currency_symbol', settings.currency_symbol.trim());
        }

        // 2. Dispatch real-time events to Navbar, App & Active Dashboards
        window.dispatchEvent(new CustomEvent('app-settings-changed', {
          detail: {
            restaurant_name: settings.restaurant_name.trim(),
            currency_symbol: settings.currency_symbol.trim()
          }
        }));
        window.dispatchEvent(new CustomEvent('restaurant-profile-changed', {
          detail: settings
        }));

        const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSaved(timeStr);
        setMessage({
          type: 'success',
          text: `Business profile settings saved successfully at ${timeStr}! Updated branding "${settings.restaurant_name}" is active across receipts, POS, orders, and reports.`
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network communication error.' });
    } finally {
      setSaving(false);
    }
  };

  const activeHeader = settings.receipt_header?.trim() || settings.restaurant_name?.trim() || 'ROYAL FEAST RESTAURANT';
  const activeFooter = settings.receipt_footer?.trim() || 'Thank you for dining with us! Please visit again.';

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Top Banner */}
      <div className="business-profile-card" style={{
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
              background: '#FEF3C7',
              color: '#92400E',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Section F • Business Profile & Commercial Configuration
            </span>
            {lastSaved && (
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} /> Synced {lastSaved}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Business Profile & Receipt Customization
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Configure your dining establishment details, customer receipt header/footers, currency symbol, and tax identification.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            background: '#F1F5F9',
            color: '#334155',
            border: '1px solid #CBD5E1',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Refreshing...' : 'Reload Settings'}</span>
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '600',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#065F46' : '#991B1B',
          border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Left Column: Business & Contact Information */}
        <div className="business-profile-card" style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#D97706" /> Establishment Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Restaurant Trade Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={settings.restaurant_name}
                onChange={(e) => setSettings({ ...settings, restaurant_name: e.target.value })}
                placeholder="e.g. Royal Feast Restaurant"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="e.g. Fine Dining & Exquisite Multi-Cuisine"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Physical Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                rows="2"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Street address, City, State, PIN"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="contact@royalfeast.com"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  GSTIN / Tax ID
                </label>
                <input
                  type="text"
                  value={settings.gstin}
                  onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                  placeholder="27AABCR1234F1Z8"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    textTransform: 'uppercase'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  placeholder="₹"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Receipt Layout & System Restrictions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Receipt Header & Footer */}
          <div className="business-profile-card" style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#D97706" /> Thermal Receipt Customization
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Receipt Header Note
                </label>
                <input
                  type="text"
                  value={settings.receipt_header}
                  onChange={(e) => setSettings({ ...settings, receipt_header: e.target.value })}
                  placeholder="e.g. Welcome to Royal Feast!"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Receipt Footer Thank-You Message
                </label>
                <textarea
                  rows="2"
                  value={settings.receipt_footer}
                  onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
                  placeholder="e.g. Thank you for dining with us! Please visit again."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(180, 83, 9, 0.25)',
                  marginTop: '6px'
                }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>

          {/* Live Thermal Receipt Preview Box */}
          <div className="receipt-live-preview" style={{
            background: '#F8FAFC',
            borderRadius: '16px',
            padding: '20px',
            border: '1px dashed #CBD5E1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Receipt size={14} color="#D97706" />
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#D97706' }}>
                  Live Receipt Slip Preview
                </span>
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                80mm Thermal
              </span>
            </div>

            <div style={{
              background: '#FFFFFF',
              color: '#000000',
              padding: '14px 16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '11px',
              lineHeight: '1.4',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #94A3B8', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontWeight: '800', fontSize: '13px' }}>{activeHeader}</div>
                {settings.tagline && <div style={{ fontSize: '10px', color: '#475569' }}>{settings.tagline}</div>}
                {settings.address && <div style={{ fontSize: '10px' }}>{settings.address}</div>}
                {settings.phone && <div style={{ fontSize: '10px' }}>Phone: {settings.phone}</div>}
                {settings.gstin && <div style={{ fontSize: '10px', fontWeight: '700' }}>GSTIN: {settings.gstin}</div>}
                <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: '700', background: '#F1F5F9', padding: '1px 6px', display: 'inline-block', borderRadius: '3px' }}>
                  TAX INVOICE
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px', color: '#475569' }}>
                <span>Bill: #BILL-DEMO-01</span>
                <span>Table: #1 (Chair 1-4)</span>
              </div>

              <div style={{ borderBottom: '1px dashed #94A3B8', paddingBottom: '6px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>1x Paneer Tikka</span>
                  <span>{settings.currency_symbol || '₹'}250.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>2x Butter Naan</span>
                  <span>{settings.currency_symbol || '₹'}90.00</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '12px' }}>
                <span>TOTAL:</span>
                <span>{settings.currency_symbol || '₹'}357.00</span>
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px', borderTop: '1px dashed #94A3B8', paddingTop: '6px', fontSize: '10px', color: '#475569', fontStyle: 'italic' }}>
                {activeFooter}
              </div>
            </div>
          </div>

          {/* RBAC Restrictions Notice Card */}
          <div className="owner-notice-card" style={{
            background: 'rgba(217, 119, 6, 0.05)',
            borderRadius: '16px',
            padding: '18px',
            border: '1px solid rgba(217, 119, 6, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldAlert size={18} color="#D97706" />
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Owner Permission Restrictions Notice
              </h4>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
              Per stakeholder policy 2.3, the Restaurant Owner manages business branding, receipt headers, and contact information. Technical administrative actions—including staff account creation, system backup paths, database dumps, and audit log deletions—are reserved for System Admin to safeguard internal controls.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
