import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  KeyRound,
  Calendar
} from 'lucide-react';

export default function CashierProfile({ currentUser, onLogout }) {
  const [profile, setProfile] = useState({
    username: currentUser?.username || '',
    role: currentUser?.role || 'Cashier',
    full_name: currentUser?.full_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || ''
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    // Fetch latest profile info
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setProfile({
            username: data.user.username,
            role: data.user.role,
            full_name: data.user.full_name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            created_at: data.user.created_at
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone
        })
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg({ type: 'success', text: 'Personal contact profile updated successfully!' });
        // Update localStorage
        const saved = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...saved, full_name: profile.full_name, email: profile.email, phone: profile.phone }));
      } else {
        setProfileMsg({ type: 'error', text: data.message || 'Could not update profile.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Network error updating profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setChangingPass(true);
    setPassMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setPassMsg({ type: 'success', text: 'Password successfully changed and updated in database!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassMsg({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPassMsg({ type: 'error', text: 'Network error changing password.' });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      
      {/* LEFT: Profile & Contact Information */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#ECFDF5',
            color: '#059669',
            padding: '12px',
            borderRadius: '12px'
          }}>
            <User size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Cashier Profile
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Front Desk Account: <strong>{profile.username}</strong>
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{
            background: '#ECFDF5',
            color: '#065F46',
            border: '1px solid #A7F3D0',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            Role: Cashier
          </span>
          <span style={{
            background: '#EFF6FF',
            color: '#1D4ED8',
            border: '1px solid #BFDBFE',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            POS Terminal Active
          </span>
        </div>

        {profileMsg.text && (
          <div style={{
            background: profileMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: profileMsg.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FCA5A5',
            color: profileMsg.type === 'success' ? '#166534' : '#991B1B',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{profileMsg.text}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              FULL NAME
            </label>
            <input
              type="text"
              required
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              PHONE NUMBER
            </label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            style={{
              padding: '11px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563EB',
              color: '#FFF',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '6px'
            }}
          >
            {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>

        {/* Logout Section */}
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '10px' }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #FCA5A5',
              background: '#FFF',
              color: '#DC2626',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            <span>Secure Shift Logout</span>
          </button>
        </div>
      </div>

      {/* RIGHT: Password Change & Security */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#EFF6FF',
            color: '#2563EB',
            padding: '12px',
            borderRadius: '12px'
          }}>
            <KeyRound size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Change Password
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Update your credentials with BCrypt encryption safeguard
            </p>
          </div>
        </div>

        {passMsg.text && (
          <div style={{
            background: passMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: passMsg.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FCA5A5',
            color: passMsg.type === 'success' ? '#166534' : '#991B1B',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {passMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{passMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              CURRENT PASSWORD *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              NEW PASSWORD * (Minimum 6 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new strong password"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
              CONFIRM NEW PASSWORD *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            style={{
              padding: '11px',
              borderRadius: '8px',
              border: 'none',
              background: '#0F172A',
              color: '#FFF',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '6px'
            }}
          >
            {changingPass ? 'Updating Password...' : 'Update Password Credentials'}
          </button>
        </form>

        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '12px',
          fontSize: '11px',
          color: '#64748B',
          lineHeight: 1.4
        }}>
          🛡️ <strong>Security Notice:</strong> All password updates are hashed via BCrypt (salt factor 10) and permanently recorded in the immutable audit log for compliance.
        </div>
      </div>

    </div>
  );
}