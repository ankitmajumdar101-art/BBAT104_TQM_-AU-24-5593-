import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Shield, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Cashier');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setRole('Cashier');
    setFullName('');
    setEmail('');
    setPhone('');
    setStatus('active');
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword('');
    setRole(user.role);
    setFullName(user.full_name);
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setStatus(user.status);
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';

      const payload = {
        username: username.trim(),
        role,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status
      };
      if (password) payload.password = password;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Action failed.');
      }

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      alert('You cannot delete your own active account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      fetchUsers();
    } catch (err) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      {/* Top Header */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Staff & User Management
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            Control staff accounts, permissions, and roles (Owner, Admin, Cashier)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            padding: '9px 18px',
            borderRadius: '8px',
            background: 'var(--primary)',
            color: '#FFF',
            fontWeight: '700',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(115, 15, 25, 0.3)'
          }}
        >
          <UserPlus size={16} />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Users Table */}
      <div style={{ background: '#FFF', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '700' }}>
              <th style={{ padding: '14px 18px' }}>Staff Name</th>
              <th style={{ padding: '14px 18px' }}>Username</th>
              <th style={{ padding: '14px 18px' }}>Role</th>
              <th style={{ padding: '14px 18px' }}>Contact</th>
              <th style={{ padding: '14px 18px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '14px 18px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr
                key={u.id}
                style={{ borderBottom: '1px solid #F1F5F9' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFF'}
              >
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: '700', color: '#0F172A' }}>{u.full_name}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Created: {new Date(u.created_at).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                  @{u.username}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '800',
                    background: u.role === 'Owner' ? '#FEF3C7' : u.role === 'Admin' ? '#EFF6FF' : '#ECFDF5',
                    color: u.role === 'Owner' ? '#92400E' : u.role === 'Admin' ? '#1E40AF' : '#065F46'
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', color: '#475569' }}>
                  <div>{u.phone || '—'}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{u.email || ''}</div>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: u.status === 'active' ? '#ECFDF5' : '#F1F5F9',
                    color: u.status === 'active' ? '#065F46' : '#64748B'
                  }}>
                    {u.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenEdit(u)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#1E40AF',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: '#FEE2E2',
                          color: '#991B1B',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
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
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              {editingUser ? `Edit Staff Member (@${editingUser.username})` : 'Create New Staff Member'}
            </h3>

            {errorMsg && (
              <div style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    USERNAME *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    placeholder="e.g. ramesh"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: editingUser ? '#F1F5F9' : '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    ROLE *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#FFF' }}
                  >
                    <option value="Cashier">Cashier</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  {editingUser ? 'RESET PASSWORD (leave blank to keep unchanged)' : 'PASSWORD *'}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? '••••••••' : 'Minimum 4 characters'}
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    PHONE
                  </label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    STATUS
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#FFF' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary)', color: '#FFF', fontWeight: '700' }}
                >
                  {editingUser ? 'Save Staff Details' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
