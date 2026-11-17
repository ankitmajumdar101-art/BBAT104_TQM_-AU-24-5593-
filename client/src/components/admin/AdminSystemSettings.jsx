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
  Moon,
  Database,
  Eye,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function AdminSystemSettings({ appTitle: initialAppTitle, themePreference: initialTheme }) {
  const [settings, setSettings] = useState({
    application_title: initialAppTitle || 'Royal Feast Restaurant Billing & POS',
    theme_preference: initialTheme || 'light',
    auto_backup_enabled: '1',
    backup_frequency: 'daily',
    backup_retention_days: '30'
  });

  const [backupStats, setBackupStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingBackup, setTestingBackup] = useState(false);
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
        if (data.backupStats) {
          setBackupStats(data.backupStats);
        }

        // Ensure active theme matches fetched preference
        applyTheme(data.settings.theme_preference || 'light');
      }
    } catch (err) {
      console.error('Error fetching system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const handleThemeChange = (newTheme) => {
    setSettings(prev => ({ ...prev, theme_preference: newTheme }));
    // Immediate live preview so admin visually experiences the change instantly
    applyTheme(newTheme);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
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
        // 1. Update document title
        document.title = settings.application_title || 'Restaurant Billing & POS System';

        // 2. Persist in local storage
        localStorage.setItem('application_title', settings.application_title);
        localStorage.setItem('theme_preference', settings.theme_preference);

        // 3. Apply theme globally
        applyTheme(settings.theme_preference);

        // 4. Dispatch custom event so App and Navbar react in real time without reload
        window.dispatchEvent(new CustomEvent('app-settings-changed', {
          detail: {
            application_title: settings.application_title,
            theme_preference: settings.theme_preference
          }
        }));

        if (data.backupStats) {
          setBackupStats(data.backupStats);
        }

        setMessage({ 
          type: 'success', 
          text: `Settings saved successfully! Active title set to "${settings.application_title}" and theme switched to ${settings.theme_preference === 'dark' ? 'Dark Mode (Night Shift)' : 'Light Mode (Commercial POS)'}.` 
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update system settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network communication error.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestBackup = async () => {
    setTestingBackup(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/system-settings/test-backup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (data.backupStats) {
          setBackupStats(data.backupStats);
        }
        setMessage({
          type: 'success',
          text: data.message || 'Test database backup executed and verified successfully!'
        });
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to run test backup.'
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error executing test backup.' });
    } finally {
      setTestingBackup(false);
    }
  };

  const isDarkMode = settings.theme_preference === 'dark';

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
            <span style={{
              background: isDarkMode ? '#1E293B' : '#FEF3C7',
              color: isDarkMode ? '#93C5FD' : '#92400E',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: `1px solid ${isDarkMode ? '#334155' : '#FDE68A'}`
            }}>
              {isDarkMode ? <Moon size={12} /> : <Sun size={12} />}
              {isDarkMode ? 'Night Shift Dark Mode Active' : 'Light Commercial POS Active'}
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            System Operational Settings
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Configure application display title, appearance theme modes, automated database backup schedules, and retention policies.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchSettings}
            title="Reload settings from database"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
          fontWeight: '600',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#065F46' : '#991B1B',
          border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span style={{ flex: 1 }}>{message.text}</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Application Display Title */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                  Application Display Title
                </label>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  {settings.application_title.length}/60 chars
                </span>
              </div>
              <input
                type="text"
                maxLength={60}
                value={settings.application_title}
                onChange={(e) => setSettings({ ...settings, application_title: e.target.value })}
                required
                placeholder="e.g. Royal Feast Restaurant Billing & POS"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  borderRadius: '10px', 
                  border: '1px solid #CBD5E1', 
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
              <p style={{ fontSize: '11px', color: '#64748B', margin: '6px 0 0 0' }}>
                Updates the browser window tab title, main navigation branding, and global system header across all roles.
              </p>
            </div>

            {/* Live Branding Preview Pill */}
            <div style={{
              background: isDarkMode ? '#0F172A' : '#F8FAFC',
              borderRadius: '12px',
              padding: '12px 16px',
              border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={12} /> Live Header & Tab Preview:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    background: '#730F19',
                    color: '#FFF',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800'
                  }}>
                    🍴 {settings.application_title || 'Royal Feast'}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: isDarkMode ? '#94A3B8' : '#475569', fontStyle: 'italic' }}>
                  Browser Title: "{settings.application_title || 'Restaurant Billing & POS System'}"
                </div>
              </div>
            </div>

            {/* 2. Display Theme Mode */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Display Theme Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Light Option Card */}
                <div
                  onClick={() => handleThemeChange('light')}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: settings.theme_preference === 'light' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    background: settings.theme_preference === 'light' ? '#EFF6FF' : '#FFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Sun size={18} color="#D97706" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                      Light Theme
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                    Default commercial POS layout. High contrast for bright daytime service desks.
                  </p>
                </div>

                {/* Dark Option Card */}
                <div
                  onClick={() => handleThemeChange('dark')}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: settings.theme_preference === 'dark' ? '2px solid #3B82F6' : '1px solid #CBD5E1',
                    background: settings.theme_preference === 'dark' ? '#1E293B' : '#FFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Moon size={18} color="#60A5FA" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: settings.theme_preference === 'dark' ? '#F8FAFC' : '#0F172A' }}>
                      Dark Theme
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: settings.theme_preference === 'dark' ? '#94A3B8' : '#64748B', margin: 0, lineHeight: '1.4' }}>
                    Low-light lounge & night shift. Reduces eye fatigue in dim dining environments.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Automatic Backup Schedule Policy */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Database size={16} color="#059669" /> Automatic Backup Schedule Policy
                </h4>
                {backupStats?.autoBackupEnabled ? (
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: '#D1FAE5', color: '#065F46' }}>
                    🟢 Scheduler Running
                  </span>
                ) : (
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: '#F1F5F9', color: '#64748B' }}>
                    ⚪ Manual Backups Only
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  id="auto_backup_en"
                  checked={settings.auto_backup_enabled === '1'}
                  onChange={(e) => setSettings({ ...settings, auto_backup_enabled: e.target.checked ? '1' : '0' })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="auto_backup_en" style={{ fontSize: '13px', color: '#334155', fontWeight: '600', cursor: 'pointer' }}>
                  Enable automated background MySQL database backups
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
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
                    <option value="weekly">Weekly (Sundays at 2:00 AM)</option>
                    <option value="monthly">Monthly (1st of Month at 2:00 AM)</option>
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
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Auto-purges dump files older than {settings.backup_retention_days} days.
                  </span>
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: '#2563EB',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving System Preferences...' : 'Save System Settings'}</span>
              </button>

              <button
                type="button"
                onClick={fetchSettings}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={15} />
                <span>Discard Changes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Status & Security Isolation Notice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Backup Engine Diagnostic Card */}
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HardDrive size={16} color="#2563EB" /> Backup Engine Status
              </h4>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                {backupStats?.totalBackups || 0} backups on disk
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Total Storage Consumed:</span>
                <span style={{ fontWeight: '700', color: '#0F172A' }}>{backupStats?.totalSizeKb || '0.00'} KB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Latest Backup Created:</span>
                <span style={{ fontWeight: '700', color: '#0F172A' }}>
                  {backupStats?.latestBackup ? new Date(backupStats.latestBackup.created_at).toLocaleString() : 'No backups yet'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Retention Policy:</span>
                <span style={{ fontWeight: '700', color: '#059669' }}>
                  Keep recent {settings.backup_retention_days} days
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestBackup}
              disabled={testingBackup}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#059669',
                color: '#FFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              <Play size={14} className={testingBackup ? 'spin' : ''} />
              <span>{testingBackup ? 'Executing Backup...' : '⚡ Run Immediate Backup & Test Retention'}</span>
            </button>
          </div>

          {/* Security Restrictions Notice */}
          <div style={{
            background: '#F8FAFC',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ShieldAlert size={20} color="#D97706" />
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Administrative Security Isolation Notice
              </h4>
            </div>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              Per Section 3.2.J, sensitive database credentials, encryption secrets, environment variables (`.env`), and backend server network listeners are strictly protected at the system level. These credentials are intentionally excluded from dashboard web forms to prevent accidental disclosure or tampering.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
