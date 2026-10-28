import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  RotateCcw, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  FileCode, 
  Clock, 
  HardDrive,
  X
} from 'lucide-react';

export default function AdminBackups() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Modals
  const [inspectModalData, setInspectModalData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [restoreConfirmBackup, setRestoreConfirmBackup] = useState(null);

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/backup', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBackups(data.backups || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: data.message });
        fetchBackups();
      } else {
        setFeedback({ type: 'error', text: data.message || 'Failed to create backup.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network communication error.' });
    } finally {
      setCreating(false);
    }
  };

  const handleInspectBackup = async (backup) => {
    setInspectLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/backup/${backup.id}/inspect`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInspectModalData(data);
      } else {
        alert(data.message || 'Failed to inspect backup.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setInspectLoading(false);
    }
  };

  const handleDownloadBackup = (backup) => {
    const token = localStorage.getItem('token');
    window.open(`/api/backup/${backup.id}/download?token=${encodeURIComponent(token)}`, '_blank');
  };

  const handleConfirmRestore = async () => {
    if (!restoreConfirmBackup) return;
    setRestoring(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/backup/${restoreConfirmBackup.id}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          text: `${data.message} Safety snapshot: ${data.preRestoreBackup}`
        });
        setRestoreConfirmBackup(null);
        fetchBackups();
      } else {
        setFeedback({ type: 'error', text: data.message || 'Restoration failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network communication error during restore.' });
    } finally {
      setRestoring(false);
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
              background: '#ECFDF5',
              color: '#059669',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Section G • Disaster Recovery & Safeguards
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Database Backup & Restoration Center
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Generate instant SQL snapshots, inspect table integrity safely, and restore with automatic pre-restore snapshots.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#059669',
              color: '#FFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: creating ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
            }}
          >
            <Database size={16} />
            <span>{creating ? 'Dumping Database...' : 'Create Manual Backup'}</span>
          </button>

          <button
            onClick={fetchBackups}
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
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '600',
          background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: feedback.type === 'success' ? '#065F46' : '#991B1B',
          border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`
        }}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Safeguards Summary Notice */}
      <div style={{
        background: '#FFFBEB',
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid #FCD34D',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <ShieldCheck size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: '#92400E', lineHeight: '1.5' }}>
          <strong>TQM Reliability Protection Safeguards (Section 3.2.G Compliance):</strong>
          <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
            <li><strong>Safe Read-Only Inspection:</strong> Open and examine table schemas and row estimates without modifying backup data.</li>
            <li><strong>Automated Pre-Restore Snapshot:</strong> Before replacing the live database, the system automatically creates a safety snapshot (`pre_restore_safety_backup_*.sql`) to eliminate data loss risk.</li>
            <li><strong>Strict Role Restriction:</strong> Cashiers and Kitchen Staff are blocked from creating, downloading, or restoring backups.</li>
          </ul>
        </div>
      </div>

      {/* Backup History Table */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
            Available Backup Archives ({backups.length})
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Stored in: <code>/backups/</code>
          </span>
        </div>

        {backups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontSize: '14px' }}>
            No backup archives found. Click "Create Manual Backup" to generate one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '10px' }}>Filename</th>
                  <th style={{ padding: '10px' }}>Created Timestamp</th>
                  <th style={{ padding: '10px' }}>File Size</th>
                  <th style={{ padding: '10px' }}>Created By</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '700', color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HardDrive size={15} color="#2563EB" />
                        <span>{b.backup_file}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#475569' }}>
                      {new Date(b.created_at).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#334155', fontWeight: '600' }}>
                      {b.file_size_kb} KB
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748B' }}>
                      @{b.created_by_username || 'Admin'}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: b.status === 'Success' ? '#ECFDF5' : '#FEF2F2',
                        color: b.status === 'Success' ? '#059669' : '#DC2626'
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleInspectBackup(b)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          title="Safely Inspect Table Schema"
                        >
                          <Eye size={13} /> Inspect
                        </button>

                        <button
                          onClick={() => handleDownloadBackup(b)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          title="Download SQL File"
                        >
                          <Download size={13} /> Download
                        </button>

                        <button
                          onClick={() => setRestoreConfirmBackup(b)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          title="Restore Database from this file"
                        >
                          <RotateCcw size={13} /> Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SAFE BACKUP INSPECTOR MODAL */}
      {inspectModalData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#FFF', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '640px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#2563EB" /> Safe Read-Only Backup Inspector
              </h3>
              <button onClick={() => setInspectModalData(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '16px', fontSize: '12px' }}>
              <div><strong>File:</strong> {inspectModalData.backupFile}</div>
              <div><strong>Size:</strong> {inspectModalData.fileSizeKb} KB • <strong>Timestamp:</strong> {new Date(inspectModalData.createdAt).toLocaleString('en-IN')}</div>
              <div><strong>Estimated Table Inserts:</strong> {inspectModalData.estimatedDataInserts} INSERT statements</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                Tables Contained in Archive ({inspectModalData.tablesContained.length}):
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {inspectModalData.tablesContained.map((t, idx) => (
                  <span key={idx} style={{ padding: '3px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: '700' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                SQL Archive Header Inspection Preview:
              </h4>
              <pre style={{
                background: '#0F172A',
                color: '#38BDF8',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'Consolas, monospace',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {inspectModalData.sqlHeaderPreview}
              </pre>
            </div>

            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <button
                onClick={() => setInspectModalData(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#0F172A', color: '#FFF', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE CONFIRMATION MODAL (WITH PRE-RESTORE SNAPSHOT NOTICE) */}
      {restoreConfirmBackup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#FFF', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', marginBottom: '14px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                Confirm Database Restoration
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              You are about to restore the database from: <strong>{restoreConfirmBackup.backup_file}</strong>.
            </p>

            <div style={{ background: '#ECFDF5', padding: '14px', borderRadius: '10px', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '12px', lineHeight: '1.4', marginBottom: '20px' }}>
              🛡️ <strong>Automated Safety Guarantee:</strong> Before replacing current records, a fresh pre-restore backup (`pre_restore_safety_backup_*.sql`) will be generated automatically to safeguard your data.
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRestoreConfirmBackup(null)}
                disabled={restoring}
                style={{ padding: '9px 16px', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={restoring}
                style={{ padding: '9px 20px', borderRadius: '8px', background: '#DC2626', color: '#FFF', border: 'none', fontSize: '13px', fontWeight: '700', cursor: restoring ? 'not-allowed' : 'pointer' }}
              >
                {restoring ? 'Safely Restoring...' : 'Yes, Restore Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
