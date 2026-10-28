import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Trash2, 
  PlayCircle, 
  RefreshCw, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function CashierDrafts({ onResumeDraft }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchDrafts = async () => {
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/drafts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDrafts(data.drafts || []);
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to load drafts.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error loading drafts.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleDiscardDraft = async (id, billNumber) => {
    if (!window.confirm(`Are you sure you want to discard Draft #${billNumber}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/drafts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Draft discarded successfully.' });
        fetchDrafts();
      } else {
        setFeedback({ type: 'error', message: data.message || 'Could not discard draft.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error discarding draft.' });
    }
  };

  const handleResume = async (draft) => {
    try {
      const token = localStorage.getItem('token');
      // Fetch full order details including line items
      const res = await fetch(`/api/orders/${draft.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.order) {
        onResumeDraft(data.order);
      } else {
        onResumeDraft(draft);
      }
    } catch (err) {
      onResumeDraft(draft);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Saved Draft Bills
          </h3>
          <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748B' }}>
            Unfinalized guest orders paused during service. Resume billing or discard expired drafts.
          </p>
        </div>

        <button
          onClick={fetchDrafts}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#F1F5F9',
            border: '1px solid #CBD5E1',
            color: '#334155',
            padding: '8px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback.message && (
        <div style={{
          background: feedback.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: feedback.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FCA5A5',
          color: feedback.type === 'success' ? '#166534' : '#991B1B',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Drafts List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <p>Loading draft bills...</p>
        </div>
      ) : drafts.length === 0 ? (
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#94A3B8'
        }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#475569' }}>
            No Draft Bills Pending
          </h4>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px' }}>
            When a table pauses ordering, click "Save Draft" in POS to keep their items safe.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {drafts.map(draft => (
            <div
              key={draft.id}
              style={{
                background: '#FFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    Draft Order
                  </span>
                  <span style={{
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: '12px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    Table {draft.table_number}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#0F172A', fontFamily: 'monospace' }}>
                  {draft.bill_number}
                </h4>

                <div style={{ fontSize: '13px', color: '#334155', fontWeight: '600' }}>
                  Guest: {draft.customer_name}
                </div>
                {draft.customer_phone && (
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Phone: {draft.customer_phone}
                  </div>
                )}

                {draft.notes && (
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 10px',
                    background: '#F8FAFC',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#475569',
                    fontStyle: 'italic'
                  }}>
                    "{draft.notes}"
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    {draft.item_count || 1} items • Total:
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>
                    ₹{parseFloat(draft.total).toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleResume(draft)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#2563EB',
                      color: '#FFF',
                      border: 'none',
                      padding: '9px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <PlayCircle size={15} />
                    <span>Resume POS</span>
                  </button>

                  <button
                    onClick={() => handleDiscardDraft(draft.id, draft.bill_number)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#FFF',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}