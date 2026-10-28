import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  Terminal, 
  FileText,
  User,
  ShieldAlert
} from 'lucide-react';

export default function AdminAuditLogs() {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' or 'errors'

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditAction, setAuditAction] = useState('All');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditStart, setAuditStart] = useState('');
  const [auditEnd, setAuditEnd] = useState('');

  // Error Logs State
  const [errorLogs, setErrorLogs] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [errorLoading, setErrorLoading] = useState(false);
  const [errorModule, setErrorModule] = useState('All');
  const [errorStatus, setErrorStatus] = useState('All');
  const [errorStart, setErrorStart] = useState('');
  const [errorEnd, setErrorEnd] = useState('');

  // Selected error modal
  const [selectedError, setSelectedError] = useState(null);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else {
      fetchErrorLogs();
    }
  }, [activeTab, auditAction, errorModule, errorStatus]);

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/audit?limit=200&';
      if (auditAction !== 'All') url += `action=${encodeURIComponent(auditAction)}&`;
      if (auditSearch) url += `search=${encodeURIComponent(auditSearch)}&`;
      if (auditStart && auditEnd) url += `startDate=${auditStart}&endDate=${auditEnd}&`;

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs || []);
        if (data.availableActions) setAvailableActions(data.availableActions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchErrorLogs = async () => {
    setErrorLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/audit/errors?limit=100&';
      if (errorModule !== 'All') url += `module=${encodeURIComponent(errorModule)}&`;
      if (errorStatus !== 'All') url += `status=${encodeURIComponent(errorStatus)}&`;
      if (errorStart && errorEnd) url += `startDate=${errorStart}&endDate=${errorEnd}&`;

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setErrorLogs(data.errors || []);
        if (data.availableModules) setAvailableModules(data.availableModules);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setErrorLoading(false);
    }
  };

  const handleUpdateErrorStatus = async (errorId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/audit/errors/${errorId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchErrorLogs();
        if (selectedError && selectedError.id === errorId) {
          setSelectedError({ ...selectedError, status: newStatus });
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
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
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#F1F5F9',
              color: '#334155',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Section H & I • Compliance & Diagnostics
            </span>
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700'
            }}>
              🔒 Read-Only Auditing
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Audit Trail & System Error Diagnostics
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Inspect security events, login attempts, configuration shifts, and application exception logs.
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'audit' ? '#FFF' : 'transparent',
              color: activeTab === 'audit' ? '#0F172A' : '#64748B',
              fontSize: '13px',
              fontWeight: activeTab === 'audit' ? '700' : '600',
              cursor: 'pointer',
              boxShadow: activeTab === 'audit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={15} color={activeTab === 'audit' ? '#2563EB' : '#94A3B8'} />
            Audit Logs ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'errors' ? '#FFF' : 'transparent',
              color: activeTab === 'errors' ? '#0F172A' : '#64748B',
              fontSize: '13px',
              fontWeight: activeTab === 'errors' ? '700' : '600',
              cursor: 'pointer',
              boxShadow: activeTab === 'errors' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={15} color={activeTab === 'errors' ? '#DC2626' : '#94A3B8'} />
            Error Logs ({errorLogs.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: AUDIT LOGS (Section 3.2.H) */}
      {activeTab === 'audit' && (
        <>
          {/* Audit Filters Bar */}
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '18px 24px',
            border: '1px solid #E2E8F0',
            marginBottom: '20px'
          }}>
            <form onSubmit={(e) => { e.preventDefault(); fetchAuditLogs(); }} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 220px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search details, action, username..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <select
                value={auditAction}
                onChange={(e) => setAuditAction(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
              >
                <option value="All">All Audit Actions</option>
                {availableActions.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>

              <input
                type="date"
                value={auditStart}
                onChange={(e) => setAuditStart(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
              />
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>to</span>
              <input
                type="date"
                value={auditEnd}
                onChange={(e) => setAuditEnd(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
              />

              <button
                type="submit"
                style={{ padding: '9px 16px', borderRadius: '8px', background: '#0F172A', color: '#FFF', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Filter
              </button>
            </form>
          </div>

          {/* Audit Logs Table */}
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Timestamp</th>
                    <th style={{ padding: '10px' }}>User & Role</th>
                    <th style={{ padding: '10px' }}>Action Type</th>
                    <th style={{ padding: '10px' }}>Details & Context</th>
                    <th style={{ padding: '10px' }}>IP Origin</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '700', color: '#64748B' }}>
                        #{log.id}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>@{log.username}</div>
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: '#F1F5F9', color: '#475569', fontWeight: '600' }}>
                          {log.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          background: log.action.includes('FAIL') || log.action.includes('BLOCK') ? '#FEF2F2' : log.action.includes('CREATE') || log.action.includes('ADD') ? '#ECFDF5' : '#EFF6FF',
                          color: log.action.includes('FAIL') || log.action.includes('BLOCK') ? '#DC2626' : log.action.includes('CREATE') || log.action.includes('ADD') ? '#059669' : '#1D4ED8'
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: '#334155' }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#94A3B8', fontSize: '11px' }}>
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: ERROR & DIAGNOSTIC LOGS (Section 3.2.I) */}
      {activeTab === 'errors' && (
        <>
          {/* Error Filters Bar */}
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '18px 24px',
            border: '1px solid #E2E8F0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={errorModule}
                onChange={(e) => setErrorModule(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
              >
                <option value="All">All Modules</option>
                {availableModules.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={errorStatus}
                onChange={(e) => setErrorStatus(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
              >
                <option value="All">All Statuses</option>
                <option value="Logged">Logged (Unreviewed)</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Resolved">Resolved</option>
              </select>

              <input
                type="date"
                value={errorStart}
                onChange={(e) => setErrorStart(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
              />
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>to</span>
              <input
                type="date"
                value={errorEnd}
                onChange={(e) => setErrorEnd(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
              />

              <button
                onClick={fetchErrorLogs}
                style={{ padding: '9px 16px', borderRadius: '8px', background: '#0F172A', color: '#FFF', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Filter
              </button>
            </div>
          </div>

          {/* Error Logs Table */}
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            {errorLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#059669', fontSize: '14px', fontWeight: '600' }}>
                ✅ Zero diagnostic errors recorded. The system is operating normally.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B' }}>
                      <th style={{ padding: '10px' }}>ID</th>
                      <th style={{ padding: '10px' }}>Timestamp</th>
                      <th style={{ padding: '10px' }}>Error Type & Module</th>
                      <th style={{ padding: '10px' }}>Description</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Diagnostic Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorLogs.map(err => (
                      <tr key={err.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        <td style={{ padding: '12px 10px', fontWeight: '700', color: '#DC2626' }}>
                          #{err.id}
                        </td>
                        <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>
                          {new Date(err.timestamp).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ fontWeight: '700', color: '#0F172A' }}>{err.error_type}</span>
                          <span style={{ marginLeft: '6px', fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: '#F1F5F9', color: '#475569' }}>
                            {err.module}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', color: '#334155' }}>
                          {err.description}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: err.status === 'Resolved' ? '#ECFDF5' : err.status === 'Reviewed' ? '#EFF6FF' : '#FEF2F2',
                            color: err.status === 'Resolved' ? '#059669' : err.status === 'Reviewed' ? '#1D4ED8' : '#DC2626'
                          }}>
                            {err.status || 'Logged'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedError(err)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Stack Trace
                            </button>
                            {err.status !== 'Resolved' && (
                              <button
                                onClick={() => handleUpdateErrorStatus(err.id, 'Resolved')}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  background: '#ECFDF5',
                                  color: '#059669',
                                  border: '1px solid #A7F3D0',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ERROR STACK TRACE MODAL */}
      {selectedError && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#FFF', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '640px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 10px 0' }}>
              Error #{selectedError.id}: {selectedError.error_type}
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 14px 0' }}>
              <strong>Module:</strong> {selectedError.module} • <strong>Timestamp:</strong> {new Date(selectedError.timestamp).toLocaleString('en-IN')}
            </p>
            <div style={{ background: '#FEF2F2', padding: '12px', borderRadius: '8px', color: '#991B1B', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>
              {selectedError.description}
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Diagnostic Stack Trace:</h4>
            <pre style={{
              background: '#0F172A',
              color: '#F87171',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'Consolas, monospace',
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {selectedError.stack_trace || 'No detailed stack trace captured.'}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleUpdateErrorStatus(selectedError.id, 'Reviewed')}
                  style={{ padding: '6px 12px', borderRadius: '6px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Mark as Reviewed
                </button>
                <button
                  onClick={() => handleUpdateErrorStatus(selectedError.id, 'Resolved')}
                  style={{ padding: '6px 12px', borderRadius: '6px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Mark as Resolved
                </button>
              </div>

              <button
                onClick={() => setSelectedError(null)}
                style={{ padding: '6px 16px', borderRadius: '6px', background: '#0F172A', color: '#FFF', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
