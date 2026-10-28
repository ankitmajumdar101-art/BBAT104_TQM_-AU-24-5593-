import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UtensilsCrossed, 
  Receipt, 
  DollarSign, 
  ShieldCheck, 
  Database, 
  AlertTriangle, 
  Settings, 
  RefreshCw, 
  ArrowUpRight,
  UserPlus,
  PlusCircle,
  FileText,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function AdminOverview({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.overview);
      }
    } catch (err) {
      console.error('Failed to fetch admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const overview = data || {
    activeStaffCount: 0,
    activeMenuItemsCount: 0,
    todayBillsCount: 0,
    todaySalesAmount: 0,
    todayAvgBill: 0,
    recentMenuUpdates: [],
    recentStaffChanges: [],
    recentBackups: [],
    recentErrors: []
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
              Section A • System Operations Surveillance
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              • Operational Administrative Control
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            System Operational Overview
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Live status of active personnel, menu offerings, daily throughput, recent backups, and security events.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            background: 'var(--primary)',
            color: '#FFF',
            border: 'none',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(180, 83, 9, 0.25)'
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Quick Navigation Links (Section 3.2.A Requirement) */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '16px',
        padding: '16px 20px',
        color: '#FFF',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: '700', fontSize: '13px', color: '#60A5FA' }}>
            ⚡ Operational Quick Links:
          </span>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>
            Direct administrative jump points
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('users')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.12)',
              color: '#FFF',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={13} color="#93C5FD" /> User Management
          </button>
          <button
            onClick={() => onNavigate('menu')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.12)',
              color: '#FFF',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <UtensilsCrossed size={13} color="#93C5FD" /> Menu Management
          </button>
          <button
            onClick={() => onNavigate('backup')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.12)',
              color: '#FFF',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Database size={13} color="#93C5FD" /> Backup & Restore
          </button>
          <button
            onClick={() => onNavigate('audit')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.12)',
              color: '#FFF',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={13} color="#93C5FD" /> Audit Logs
          </button>
          <button
            onClick={() => onNavigate('billing')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.12)',
              color: '#FFF',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Settings size={13} color="#93C5FD" /> Tax & Billing Rules
          </button>
        </div>
      </div>

      {/* Top 4 Operational KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Active Staff Accounts */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Active Staff Accounts</span>
            <div style={{ background: '#EFF6FF', color: '#2563EB', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>
            {overview.activeStaffCount}
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#059669', fontWeight: '600' }}>
            Owner, Admins, Cashiers & Kitchen Staff
          </p>
        </div>

        {/* Active Menu Items */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Active Menu Offerings</span>
            <div style={{ background: '#FEF3C7', color: '#D97706', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UtensilsCrossed size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>
            {overview.activeMenuItemsCount}
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748B' }}>
            Available for immediate POS cashier ordering
          </p>
        </div>

        {/* Today Bills Settled */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Bills Settled Today</span>
            <div style={{ background: '#ECFDF5', color: '#059669', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>
            {overview.todayBillsCount}
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748B' }}>
            Avg Bill: ₹{overview.todayAvgBill.toFixed(2)}
          </p>
        </div>

        {/* Today Operational Sales */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Operational Sales Today</span>
            <div style={{ background: '#F5F3FF', color: '#7C3AED', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#059669' }}>
            ₹{overview.todaySalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748B' }}>
            Operational figures (Read-only surveillance)
          </p>
        </div>
      </div>

      {/* Grid of 4 Operational Activity Streams (Section 3.2.A Requirement) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Recent Menu Updates */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UtensilsCrossed size={16} color="var(--primary)" /> Recent Menu Updates
            </h3>
            <button
              onClick={() => onNavigate('menu')}
              style={{ fontSize: '12px', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              Manage Menu <ArrowUpRight size={13} />
            </button>
          </div>

          {overview.recentMenuUpdates.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', margin: 0 }}>No recent menu modifications logged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {overview.recentMenuUpdates.map(u => (
                <div key={u.id} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: '#B45309' }}>{u.action}</span>
                    <span>{new Date(u.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', fontWeight: '600' }}>{u.details}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>By: @{u.username}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Staff Account Changes */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#2563EB" /> Recent Staff Account Changes
            </h3>
            <button
              onClick={() => onNavigate('users')}
              style={{ fontSize: '12px', color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              Manage Users <ArrowUpRight size={13} />
            </button>
          </div>

          {overview.recentStaffChanges.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', margin: 0 }}>No recent user account modifications logged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {overview.recentStaffChanges.map(s => (
                <div key={s.id} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: '#1E40AF' }}>{s.action}</span>
                    <span>{new Date(s.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', fontWeight: '600' }}>{s.details}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>By: @{s.username}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Backup Activity */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} color="#059669" /> Recent Database Backups
            </h3>
            <button
              onClick={() => onNavigate('backup')}
              style={{ fontSize: '12px', color: '#059669', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              Backup Center <ArrowUpRight size={13} />
            </button>
          </div>

          {overview.recentBackups.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', margin: 0 }}>No database backups created yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {overview.recentBackups.map(b => (
                <div key={b.id} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>{b.backup_file}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      Size: {b.file_size_kb} KB • By: @{b.created_by || 'Admin'} • {new Date(b.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: b.status === 'Success' ? '#ECFDF5' : '#FEF2F2',
                    color: b.status === 'Success' ? '#059669' : '#DC2626'
                  }}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent System Errors */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#DC2626" /> Recent Diagnostic Logs
            </h3>
            <button
              onClick={() => onNavigate('audit')}
              style={{ fontSize: '12px', color: '#DC2626', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              Error Logs <ArrowUpRight size={13} />
            </button>
          </div>

          {overview.recentErrors.length === 0 ? (
            <div style={{ padding: '16px', background: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '12px', fontWeight: '600' }}>
              ✅ System healthy: Zero uncaught runtime errors recorded in error_logs.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {overview.recentErrors.map(e => (
                <div key={e.id} style={{ padding: '10px 12px', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#991B1B', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '700' }}>{e.error_type} [{e.module}]</span>
                    <span>{new Date(e.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#7F1D1D', fontWeight: '600' }}>{e.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
