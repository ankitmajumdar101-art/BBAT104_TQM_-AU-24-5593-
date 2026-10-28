import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, AlertTriangle, Download, RefreshCw, CheckCircle, Search } from 'lucide-react';

export default function AuditLogs() {
  const [activeSubTab, setActiveSubTab] = useState('audit'); // 'audit', 'backup', 'errors'
  const [auditLogs, setAuditLogs] = useState([]);
  const [backupLogs, setBackupLogs] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backupStatus, setBackupStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeSubTab === 'audit') fetchAuditLogs();
    if (activeSubTab === 'backup') fetchBackupLogs();
    if (activeSubTab === 'errors') fetchErrorLogs();
  }, [activeSubTab]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/audit', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAuditLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBackupLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/backup', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBackupLogs(data.backups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchErrorLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/audit/errors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setErrorLogs(data.errors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setBackupStatus('Creating backup...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBackupStatus(`Success: ${data.message}`);
        fetchBackupLogs();
      } else {
        setBackupStatus(`Failed: ${data.message}`);
      }
    } catch (err) {
      setBackupStatus(`Error: ${err.message}`);
    }
  };

  const filteredAuditLogs = auditLogs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
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
            Reliability & System Security (TQM Q01)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            Audit logs, database backup protection, and centralized error recovery
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveSubTab('audit')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              background: activeSubTab === 'audit' ? '#FFF' : 'transparent',
              color: activeSubTab === 'audit' ? 'var(--primary)' : '#64748B',
              boxShadow: activeSubTab === 'audit' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={16} />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('backup')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              background: activeSubTab === 'backup' ? '#FFF' : 'transparent',
              color: activeSubTab === 'backup' ? 'var(--primary)' : '#64748B',
              boxShadow: activeSubTab === 'backup' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Database size={16} />
            <span>Database Backups</span>
          </button>

          <button
            onClick={() => setActiveSubTab('errors')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              background: activeSubTab === 'errors' ? '#FFF' : 'transparent',
              color: activeSubTab === 'errors' ? 'var(--primary)' : '#64748B',
              boxShadow: activeSubTab === 'errors' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={16} />
            <span>Error Recovery Logs</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div style={{ background: '#FFF', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search audit actions, users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <button
              onClick={fetchAuditLogs}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: '#F1F5F9', color: '#334155', fontSize: '13px', fontWeight: '600' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '700' }}>
                <th style={{ padding: '14px 18px' }}>Action</th>
                <th style={{ padding: '14px 18px' }}>User & Role</th>
                <th style={{ padding: '14px 18px' }}>Details</th>
                <th style={{ padding: '14px 18px' }}>IP</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuditLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: log.action.includes('CREATE_BILL') ? '#ECFDF5' : log.action.includes('LOGIN') ? '#EFF6FF' : '#FEF3C7',
                      color: log.action.includes('CREATE_BILL') ? '#065F46' : log.action.includes('LOGIN') ? '#1E40AF' : '#92400E'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <strong>{log.username}</strong> <span style={{ color: '#64748B', fontSize: '11px' }}>({log.role})</span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#334155' }}>
                    {log.details}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748B', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    {log.ip_address}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', color: '#64748B', fontSize: '12px' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 2: DATABASE BACKUPS */}
      {activeSubTab === 'backup' && (
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Automatic Database Backup
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                Protects against accidental data loss by exporting complete MySQL SQL snapshots
              </p>
            </div>
            <button
              onClick={handleCreateBackup}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#FFF',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(115, 15, 25, 0.3)'
              }}
            >
              <Database size={16} />
              <span>Create Fresh Backup Now</span>
            </button>
          </div>

          {backupStatus && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              background: backupStatus.includes('Success') ? '#ECFDF5' : '#FEF3C7',
              color: backupStatus.includes('Success') ? '#065F46' : '#92400E',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {backupStatus}
            </div>
          )}

          <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Backup History</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '700' }}>
                <th style={{ padding: '12px 16px' }}>Backup File</th>
                <th style={{ padding: '12px 16px' }}>Size</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Initiated By</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {backupLogs.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: '#0F172A' }}>
                    {b.backup_file}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {b.file_size_kb} KB
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: b.status === 'Success' ? '#ECFDF5' : '#FEE2E2',
                      color: b.status === 'Success' ? '#065F46' : '#991B1B'
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748B' }}>
                    {b.created_by_username || 'System'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748B' }}>
                    {new Date(b.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 3: ERROR LOGS */}
      {activeSubTab === 'errors' && (
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Centralized Error Recovery Logs
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
              Tracks all runtime exceptions caught by Express error middleware to assist developers
            </p>
          </div>

          {errorLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#10B981' }}>
              <CheckCircle size={36} style={{ margin: '0 auto 10px' }} />
              <p style={{ fontWeight: '700', fontSize: '14px' }}>System operating with zero recorded errors!</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '700' }}>
                  <th style={{ padding: '12px 16px' }}>Error Type</th>
                  <th style={{ padding: '12px 16px' }}>Module</th>
                  <th style={{ padding: '12px 16px' }}>Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {errorLogs.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#EF4444' }}>
                      {e.error_type}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#334155' }}>
                      {e.module}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {e.description}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748B', fontSize: '11px' }}>
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
