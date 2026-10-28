import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ShoppingBag, 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  RefreshCw,
  XCircle,
  FileText,
  Users,
  Wallet,
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function OwnerOverview({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const [customResult, setCustomResult] = useState(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/owner/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.overview);
      }
    } catch (err) {
      console.error('Failed to fetch owner overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRangeSearch = async (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    setCustomLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/owner/overview?startDate=${customStart}&endDate=${customEnd}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.overview.customRange) {
        setCustomResult(json.overview.customRange);
      }
    } catch (err) {
      console.error('Custom range fetch error:', err);
    } finally {
      setCustomLoading(false);
    }
  };

  const today = data?.today || {
    totalSales: 0,
    completedBills: 0,
    cancelledBills: 0,
    avgBillAmount: 0,
    expenses: 0,
    growthVsYesterday: 0
  };

  const month = data?.month || {
    totalSales: 0,
    totalBills: 0,
    expenses: 0,
    estimatedProfit: 0
  };

  const paymentBreakdown = data?.paymentBreakdown || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Top Banner */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0',
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
              background: '#FEF3C7',
              color: '#92400E',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Executive Business Overview
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              • Read-Only Financial Surveillance
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Restaurant Business Performance
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Live metrics compiled from verified database transactions and recorded operating costs.
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
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Quick Navigation Links Bar (Section 2.2.A Requirement) */}
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
          <span style={{ fontWeight: '700', fontSize: '13px', color: '#FCD34D' }}>
            ⚡ Quick Dashboard Links:
          </span>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>
            Jump directly to detailed stakeholder sections
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('sales')}
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
            <TrendingUp size={13} color="#FCD34D" /> Sales Reports
          </button>
          <button
            onClick={() => onNavigate('expenses')}
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
            <Wallet size={13} color="#FCD34D" /> Expenses
          </button>
          <button
            onClick={() => onNavigate('pnl')}
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
            <DollarSign size={13} color="#FCD34D" /> Profit & Loss
          </button>
          <button
            onClick={() => onNavigate('bills')}
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
            <Receipt size={13} color="#FCD34D" /> Bill History
          </button>
          <button
            onClick={() => onNavigate('staff')}
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
            <Users size={13} color="#FCD34D" /> Staff Performance
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Today's Sales */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Today's Total Sales</span>
            <div style={{ background: '#ECFDF5', color: '#059669', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
            ₹{today.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            {today.growthVsYesterday >= 0 ? (
              <span style={{ color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <TrendingUp size={14} /> +{today.growthVsYesterday}%
              </span>
            ) : (
              <span style={{ color: '#DC2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <TrendingDown size={14} /> {today.growthVsYesterday}%
              </span>
            )}
            <span style={{ color: '#94A3B8' }}>vs yesterday</span>
          </div>
        </div>

        {/* Today's Bills Count */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Bills Completed Today</span>
            <div style={{ background: '#EFF6FF', color: '#2563EB', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
            {today.completedBills}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#DC2626' }}>
            <XCircle size={14} />
            <span style={{ fontWeight: '600' }}>{today.cancelledBills} cancelled / voided</span>
          </div>
        </div>

        {/* Average Bill Amount */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Today's Average Bill</span>
            <div style={{ background: '#F5F3FF', color: '#7C3AED', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
            ₹{today.avgBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
            Average revenue per finalized customer table
          </p>
        </div>

        {/* Current Month Sales */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Current Month Sales</span>
            <div style={{ background: '#FFFBEB', color: '#D97706', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
            ₹{month.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
            {month.totalBills} total completed bills this month
          </p>
        </div>
      </div>

      {/* Month Financial Overview & Custom Date Range Filter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '24px' }}>
        {/* Monthly Financial Health Card */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0' }}>
            Current Month Financial Health (Sales vs Expenses)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Gross Month Revenue</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                ₹{month.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Recorded Month Expenses</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#DC2626', marginTop: '4px' }}>
                ₹{month.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{
              background: month.estimatedProfit >= 0 ? '#ECFDF5' : '#FEF2F2',
              padding: '14px',
              borderRadius: '12px',
              border: `1px solid ${month.estimatedProfit >= 0 ? '#A7F3D0' : '#FECACA'}`
            }}>
              <span style={{ fontSize: '12px', color: month.estimatedProfit >= 0 ? '#065F46' : '#991B1B' }}>
                Estimated Operating Profit
              </span>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                color: month.estimatedProfit >= 0 ? '#059669' : '#DC2626',
                marginTop: '4px'
              }}>
                ₹{month.estimatedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={{
            background: '#F1F5F9',
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            color: '#475569'
          }}>
            <AlertCircle size={16} color="#64748B" />
            <span>
              <strong>Transparency Note:</strong> Estimated Operating Profit = Month Net Sales - Recorded Expenses. Indirect depreciation and unrecorded staff wages are excluded.
            </span>
          </div>
        </div>

        {/* Custom Date Range Query Widget */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0' }}>
            Custom Date Range Sales Query
          </h3>
          <form onSubmit={handleCustomRangeSearch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>
                  FROM
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>
                  TO
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={customLoading}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#FFF',
                border: 'none',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {customLoading ? 'Calculating...' : 'Query Custom Sales'}
            </button>
          </form>

          {customResult && (
            <div style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Total Sales in Period:</span>
                <span style={{ fontWeight: '800', color: '#0F172A' }}>
                  ₹{parseFloat(customResult.range_sales).toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Completed Bills:</span>
                <span style={{ fontWeight: '700', color: '#0F172A' }}>{customResult.range_bills}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Average Bill Value:</span>
                <span style={{ fontWeight: '700', color: '#059669' }}>
                  ₹{parseFloat(customResult.range_avg).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Totals Breakdown & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px' }}>
        {/* Payment Totals Grouped by Method */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0' }}>
            Payment Distribution (Authorized Totals)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paymentBreakdown.map((pm, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#FEF3C7',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>
                      {pm.payment_method}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {pm.count} transactions completed
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>
                    ₹{parseFloat(pm.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales Activity */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Recent Sales Activity
            </h3>
            <button
              onClick={() => onNavigate('bills')}
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--primary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View All Bills <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '8px 10px' }}>Bill #</th>
                  <th style={{ padding: '8px 10px' }}>Table / Customer</th>
                  <th style={{ padding: '8px 10px' }}>Method</th>
                  <th style={{ padding: '8px 10px' }}>Cashier</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map(act => (
                  <tr key={act.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '10px', fontWeight: '700', color: '#0F172A' }}>
                      {act.bill_number}
                    </td>
                    <td style={{ padding: '10px', color: '#334155' }}>
                      Table {act.table_number} • {act.customer_name}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: '#F1F5F9',
                        color: '#475569'
                      }}>
                        {act.payment_method}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: '#64748B' }}>
                      {act.cashier_name || 'Cashier'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                      ₹{parseFloat(act.total).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: act.order_status === 'Completed' ? '#ECFDF5' : '#FEF2F2',
                        color: act.order_status === 'Completed' ? '#059669' : '#DC2626'
                      }}>
                        {act.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
