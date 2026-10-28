import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  KeyRound, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  LogOut,
  Shield,
  Calendar
} from 'lucide-react';

export default function OwnerProfile({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setProfileForm({
          full_name: data.profile.full_name || '',
          email: data.profile.email || '',
          phone: data.profile.phone || ''
        });
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg({ type: 'success', text: 'Personal profile updated successfully.' });
        fetchProfile();
        // Also update stored localStorage user display
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.full_name = profileForm.full_name;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      } else {
        setProfileMsg({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Network communication error.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg(null);

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      setPasswordSaving(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      setPasswordSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: 'success', text: 'Password successfully changed! Your account is secure.' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Network communication error.' });
    } finally {
      setPasswordSaving(false);
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
              color: '#1D4ED8',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Section H • Identity & Credentials
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Owner Profile & Password Management
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Manage your personal profile details and securely update your login credentials.
          </p>
        </div>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          <LogOut size={16} /> Secure Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Card: Personal Profile Information */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary)" /> Personal Profile Fields
          </h3>

          {profileMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: profileMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: profileMsg.type === 'success' ? '#065F46' : '#991B1B'
            }}>
              {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* Read-Only Account Badges */}
          <div style={{
            background: '#F8FAFC',
            padding: '14px 16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>LOGIN USERNAME</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>@{profile?.username}</div>
            </div>
            <div>
              <span style={{
                background: '#FEF3C7',
                color: '#92400E',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '800'
              }}>
                Role: {profile?.role || 'Owner'}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
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

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="owner@royalfeast.com"
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
                Contact Phone
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
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

            <button
              type="submit"
              disabled={profileSaving}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#FFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              <Save size={15} />
              <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right Card: Secure Password Change */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} color="#D97706" /> Change Password
          </h3>

          {passwordMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: passwordMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: passwordMsg.type === 'success' ? '#065F46' : '#991B1B'
            }}>
              {passwordMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>
            To change your password, verify your existing current password first. All passwords are encrypted with industry-standard bcrypt hashing.
          </p>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Current Password (Verification Required)
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
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

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                New Password (Min 6 Characters)
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
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

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
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

            <button
              type="submit"
              disabled={passwordSaving}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '8px',
                background: '#0F172A',
                color: '#FFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              <Lock size={15} />
              <span>{passwordSaving ? 'Verifying & Updating...' : 'Update Password'}</span>
            </button>
          </form>

          {/* Privacy Note */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '8px',
            background: '#F1F5F9',
            fontSize: '11px',
            color: '#64748B',
            lineHeight: '1.4'
          }}>
            🔒 <strong>Strict Privacy Enforcement:</strong> Individual passwords are cryptographically salted and hashed. Neither the Owner nor Admin can inspect plaintext passwords.
          </div>
        </div>
      </div>
    </div>
  );
}
