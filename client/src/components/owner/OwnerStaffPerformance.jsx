import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  DollarSign, 
  CheckCircle2, 
  ShoppingBag, 
  TrendingUp, 
  Calendar,
  Filter,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export default function OwnerStaffPerformance() {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  useEffect(() => {
    fetchPerformance();
  }, [selectedStaff]);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/owner/staff-performance?';
      if (startDate && endDate) {
        url += `startDate=${startDate}&endDate=${endDate}&`;
      }
      if (selectedStaff) {
        url += `staffId=${selectedStaff}&`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStaffData(data.staffPerformance || []);
      }
    } catch (err) {
      console.error('Staff performance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterSubmit = (e) => {
    e.preventDefault();
    fetchPerformance();
  };

  // Grand totals across all cashiers
  const totalRestaurantSales = staffData.reduce((acc, s) => acc + parseFloat(s.total_sales_generated), 0);
  const totalRestaurantBills = staffData.reduce((acc, s) => acc + parseInt(s.total_bills_handled, 10), 0);

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
              background: '#F5F3FF',
              color: '#7C3AED',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Section F • Staff Productivity Audit
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              • Read-Only Performance Benchmarking
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Cashier & Staff Performance
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Compare sales generated, bills settled, average transaction values, and throughput across personnel.
          </p>
        </div>

        <button
          onClick={fetchPerformance}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 16px',
            borderRadius: '10px',
            background: '#F1F5F9',
            color: '#0F172A',
            border: '1px solid #CBD5E1',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Date Filter & Staff Dropdown Toolbar */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '16px 20px',
        border: '1px solid #E2E8F0',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ fontSize: '13px', color: '#475569' }}>
          Total Aggregated Staff Sales: <strong style={{ color: '#059669' }}>₹{totalRestaurantSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> across <strong>{totalRestaurantBills}</strong> bills
        </div>

        <form onSubmit={handleDateFilterSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFF' }}
          >
            <option value="">All Staff Members</option>
            {staffData.map(s => (
              <option key={s.staff_id} value={s.staff_id}>{s.full_name || s.username} ({s.role})</option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
          />
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
          />

          <button
            type="submit"
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
            Apply Period
          </button>
        </form>
      </div>

      {/* Staff Leaderboard Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {staffData.map((staff, index) => {
          const sales = parseFloat(staff.total_sales_generated);
          const bills = parseInt(staff.total_bills_handled, 10);
          const avg = parseFloat(staff.avg_bill_value);
          const share = totalRestaurantSales > 0 ? ((sales / totalRestaurantSales) * 100).toFixed(1) : 0;

          return (
            <div
              key={staff.staff_id}
              style={{
                background: '#FFF',
                borderRadius: '16px',
                padding: '24px',
                border: index === 0 && sales > 0 ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                position: 'relative'
              }}
            >
              {index === 0 && sales > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#FEF3C7',
                  color: '#92400E',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Award size={14} color="#D97706" /> TOP PERFORMER
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '16px'
                }}>
                  {staff.full_name ? staff.full_name.charAt(0).toUpperCase() : staff.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {staff.full_name || staff.username}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>@{staff.username}</span>
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700',
                      background: staff.role === 'Cashier' ? '#ECFDF5' : '#EFF6FF',
                      color: staff.role === 'Cashier' ? '#065F46' : '#1E40AF'
                    }}>
                      {staff.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Sales Generated</span>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                    ₹{sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Bills Handled</span>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
                    {bills}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', padding: '8px 0', borderTop: '1px solid #F1F5F9' }}>
                <span>Average Bill Value:</span>
                <span style={{ fontWeight: '700', color: '#0F172A' }}>₹{avg.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', padding: '4px 0' }}>
                <span>Revenue Contribution:</span>
                <span style={{ fontWeight: '700', color: '#2563EB' }}>{share}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Table */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0' }}>
          Staff Throughput Ranking Table
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B' }}>
                <th style={{ padding: '10px' }}>Rank</th>
                <th style={{ padding: '10px' }}>Staff Name</th>
                <th style={{ padding: '10px' }}>Designation</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Bills Settled</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Total Sales (₹)</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Avg Bill (₹)</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Share of Revenue</th>
              </tr>
            </thead>
            <tbody>
              {staffData.map((staff, idx) => {
                const sales = parseFloat(staff.total_sales_generated);
                const bills = parseInt(staff.total_bills_handled, 10);
                const avg = parseFloat(staff.avg_bill_value);
                const share = totalRestaurantSales > 0 ? ((sales / totalRestaurantSales) * 100).toFixed(1) : 0;

                return (
                  <tr key={staff.staff_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '700', color: idx === 0 ? '#D97706' : '#64748B' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: '700', color: '#0F172A' }}>
                      {staff.full_name || staff.username}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748B' }}>
                      {staff.role}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600' }}>
                      {bills}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                      ₹{sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', color: '#334155' }}>
                      ₹{avg.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', color: '#2563EB' }}>
                      {share}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
