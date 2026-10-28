import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  HardDrive, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert, 
  RefreshCw,
  Sun,
  Database
} from 'lucide-react';

export default function AdminSystemSettings() {
  const [settings, setSettings] = useState({
    application_title: 'Royal Feast Restaurant Billing & POS',
    theme_preference: 'light',
    auto_backup_enabled: '1',
    backup_frequency: 'daily',
    backup_retention_days: '30'
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
      const res = await fetch('/api/admin/system-settings', {
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
      const res = await fetch('/api/admin/system-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'System operational settings updated and audited successfully.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update system settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network communication error.' });
    } finally {
      setSaving(false);
    }
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
              background: '#EFF6FF',
              color: '#1E40AF',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Section J • Operational Preferences
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            System Operational Settings
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Configure application runtime title, display themes, auto-backup intervals, and backup archival retention policies.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: '#F1F5F9',
            color: '#334155',
            border: '1px solid #CBD5E1',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
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
        {/* Left Column: Display and Auto-Backup Options */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} color="#2563EB" /> Application Environment Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Application Display Title
              </label>
              <input
                type="text"
                value={settings.application_title}
                onChange={(e) => setSettings({ ...settings, application_title: e.target.value })}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Display Theme Mode
              </label>
              <select
                value={settings.theme_preference}
                onChange={(e) => setSettings({ ...settings, theme_preference: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
              >
                <option value="light">Light Theme (Default Commercial POS)</option>
                <option value="dark">Dark Theme (Low-light Lounge / Night Shift)</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '6px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={16} color="#059669" /> Automatic Backup Schedule Policy
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  id="auto_backup_en"
                  checked={settings.auto_backup_enabled === '1'}
                  onChange={(e) => setSettings({ ...settings, auto_backup_enabled: e.target.checked ? '1' : '0' })}
                />
                <label htmlFor="auto_backup_en" style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                  Enable automated background MySQL database backups
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backup_frequency}
                    onChange={(e) => setSettings({ ...settings, backup_frequency: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
                  >
                    <option value="daily">Daily (Nightly at 2:00 AM)</option>
                    <option value="weekly">Weekly (Sundays)</option>
                    <option value="monthly">Monthly (1st of Month)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Retention Period (Days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={settings.backup_retention_days}
                    onChange={(e) => setSettings({ ...settings, backup_retention_days: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>
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
                background: '#2563EB',
                color: '#FFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Updating System...' : 'Save System Settings'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Security Restrictions Notice */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          height: 'fit-content'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <ShieldAlert size={20} color="#D97706" />
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Administrative Security Isolation Notice
            </h4>
          </div>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            Per section 3.2.J, sensitive database credentials, encryption secrets, environment variables (`.env`), and backend server network listeners are strictly protected at the system level. These credentials are intentionally excluded from dashboard web forms to prevent accidental disclosure.
          </p>
        </div>
      </form>
    </div>
  );
}
