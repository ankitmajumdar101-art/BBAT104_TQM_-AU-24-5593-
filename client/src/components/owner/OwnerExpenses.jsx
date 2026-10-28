import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  Trash2, 
  Filter, 
  Tag, 
  Calendar, 
  TrendingDown, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function OwnerExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  // Add Expense Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Vegetables & Groceries',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().slice(0, 10)
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const categoriesList = [
    'Vegetables & Groceries',
    'Meat & Dairy',
    'Cooking Gas & Utilities',
    'Packaging & Takeaway',
    'Staff Advance / Wages',
    'Cleaning & Maintenance',
    'Equipment & Repairs',
    'Miscellaneous'
  ];

  useEffect(() => {
    fetchExpenses();
  }, [filterCategory]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/owner/expenses?';
      if (filterCategory) url += `category=${encodeURIComponent(filterCategory)}&`;
      if (filterStart && filterEnd) url += `startDate=${filterStart}&endDate=${filterEnd}&`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses || []);
        setCategorySummary(data.categorySummary || []);
        setTotalExpenses(data.totalExpenses || 0);
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a valid expense amount.' });
      return;
    }
    if (!formData.description.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a description for the expense.' });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Expense recorded successfully.' });
        setShowAddModal(false);
        setFormData({
          category: 'Vegetables & Groceries',
          amount: '',
          description: '',
          expense_date: new Date().toISOString().slice(0, 10)
        });
        fetchExpenses();
      } else {
        setFeedbackMsg({ type: 'error', text: data.message || 'Failed to record expense.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id, desc) => {
    if (!window.confirm(`Are you sure you want to delete expense record: "${desc}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/owner/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchExpenses();
      } else {
        alert(data.message || 'Error deleting expense.');
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
              background: '#FEF2F2',
              color: '#DC2626',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Section C • Expense Surveillance
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Operating Expenses & Outflow
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Audit and record raw material purchases, utilities, packaging, and operating costs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { setShowAddModal(true); setFeedbackMsg(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#DC2626',
              color: '#FFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
            }}
          >
            <PlusCircle size={16} /> Record New Expense
          </button>
          <button
            onClick={fetchExpenses}
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

      {feedbackMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '600',
          background: feedbackMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: feedbackMsg.type === 'success' ? '#065F46' : '#991B1B',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#A7F3D0' : '#FECACA'}`
        }}>
          {feedbackMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Category Totals Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#FFF', borderRadius: '14px', padding: '18px', border: '2px solid #DC2626' }}>
          <span style={{ fontSize: '12px', color: '#991B1B', fontWeight: '700' }}>Total Recorded Expenses</span>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#DC2626', marginTop: '4px' }}>
            ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Total of filtered expenses</span>
        </div>

        {categorySummary.slice(0, 3).map((cs, idx) => (
          <div key={idx} style={{ background: '#FFF', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>{cs.category}</span>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
              ₹{parseFloat(cs.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>{cs.count} entries recorded</span>
          </div>
        ))}
      </div>

      {/* Filter and Expense History Table */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
            Expense Audit Trail
          </h3>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                background: '#FFF'
              }}
            >
              <option value="">All Categories</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
            />
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>to</span>
            <input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
            />

            <button
              onClick={fetchExpenses}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#0F172A',
                color: '#FFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Filter
            </button>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748B', fontSize: '14px' }}>
            No expense records found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Category</th>
                  <th style={{ padding: '10px' }}>Description</th>
                  <th style={{ padding: '10px' }}>Recorded By</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 10px', color: '#0F172A', fontWeight: '600' }}>
                      {exp.expense_date}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: '#FEF3C7',
                        color: '#92400E'
                      }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#334155' }}>
                      {exp.description}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748B' }}>
                      {exp.recorded_by_name || exp.recorded_by_username || 'Owner'}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', color: '#DC2626' }}>
                      ₹{parseFloat(exp.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.description)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#DC2626',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}
                        title="Delete expense entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 16px 0' }}>
              Record Operating Expense
            </h3>

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px'
                  }}
                >
                  {categoriesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1500.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Date of Expense
                </label>
                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Description / Vendor / Item Details
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Purchased fresh tomatoes, onions, spices from wholesale market"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    background: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    background: '#DC2626',
                    color: '#FFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
