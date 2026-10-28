import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  TrendingUp, 
  CreditCard,
  Percent,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

export default function OwnerSalesReports() {
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [period, paymentMethod]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `/api/owner/sales-reports?period=${period}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      if (paymentMethod) {
        url += `&paymentMethod=${encodeURIComponent(paymentMethod)}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setReportData(json);
      }
    } catch (err) {
      console.error('Failed to fetch sales reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFilterSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.timeline) return;
    const headers = ['Report Date', 'Completed Orders', 'Gross Sales (Rs)', 'Discounts (Rs)', 'Taxes 5% GST (Rs)', 'Net Sales (Rs)'];
    const rows = reportData.timeline.map(t => [
      t.report_date,
      t.orders_count,
      parseFloat(t.gross_sales).toFixed(2),
      parseFloat(t.discounts).toFixed(2),
      parseFloat(t.taxes).toFixed(2),
      parseFloat(t.net_sales).toFixed(2)
    ]);

    // Add summary row at bottom
    const sum = reportData.summary;
    rows.push([]);
    rows.push(['GRAND TOTAL SUMMARY', sum.totalCompletedBills, sum.grossSales.toFixed(2), sum.discounts.toFixed(2), sum.taxes.toFixed(2), sum.netSales.toFixed(2)]);
    rows.push(['CANCELLED / VOIDED', sum.cancelledBillsCount, '0.00', '0.00', '0.00', sum.cancelledAmount.toFixed(2)]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = reportData?.summary || {
    totalCompletedBills: 0,
    grossSales: 0,
    discounts: 0,
    taxes: 0,
    netSales: 0,
    cancelledBillsCount: 0,
    cancelledAmount: 0
  };

  const timeline = reportData?.timeline || [];

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Header and Controls */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: '#EFF6FF',
                color: '#1D4ED8',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                Section B • Sales Auditing
              </span>
              {reportData?.generatedAt && (
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Generated on: {new Date(reportData.generatedAt).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
              Comprehensive Sales Reports
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Gross, discounts, taxes, cancellations, and net revenue segmented by period and payment method.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportCSV}
              disabled={!reportData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                background: '#059669',
                color: '#FFF',
                border: 'none',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Download size={15} /> Export to CSV
            </button>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                background: '#334155',
                color: '#FFF',
                border: 'none',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} /> Print Report
            </button>
            <button
              onClick={fetchReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '8px',
                background: '#F1F5F9',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Quick Period Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setStartDate('');
                  setEndDate('');
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: period === p && !startDate ? '1px solid var(--primary)' : '1px solid #CBD5E1',
                  background: period === p && !startDate ? '#FEF3C7' : '#FFF',
                  color: period === p && !startDate ? '#92400E' : '#475569',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  cursor: 'pointer'
                }}
              >
                {p === 'daily' ? "Today's Report" : p}
              </button>
            ))}
          </div>

          {/* Payment Method Filter & Custom Date Range Form */}
          <form onSubmit={handleCustomFilterSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                background: '#FFF'
              }}
            >
              <option value="">All Payment Methods</option>
              <option value="Cash">Cash Only</option>
              <option value="UPI / QR">UPI / QR Only</option>
              <option value="Card">Card Only</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12px'
              }}
            />
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12px'
              }}
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
              Apply Filter
            </button>
          </form>
        </div>
      </div>

      {/* Summary Financial Metric Cards (Separate Figures as required by Section 2.2.B) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Completed Bills */}
        <div style={{ background: '#FFF', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Completed Bills</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>
            {summary.totalCompletedBills}
          </div>
          <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Finalized Sales</span>
        </div>

        {/* Gross Sales */}
        <div style={{ background: '#FFF', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Gross Sales</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#334155', marginTop: '6px' }}>
            ₹{summary.grossSales.toFixed(2)}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Before discounts/taxes</span>
        </div>

        {/* Total Discounts */}
        <div style={{ background: '#FFF', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Discounts Allowed</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#D97706', marginTop: '6px' }}>
            ₹{summary.discounts.toFixed(2)}
          </div>
          <span style={{ fontSize: '11px', color: '#D97706' }}>Promotions & waivers</span>
        </div>

        {/* Total Taxes */}
        <div style={{ background: '#FFF', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Taxes Collected (GST)</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563EB', marginTop: '6px' }}>
            ₹{summary.taxes.toFixed(2)}
          </div>
          <span style={{ fontSize: '11px', color: '#2563EB' }}>2.5% CGST + 2.5% SGST</span>
        </div>

        {/* Net Sales */}
        <div style={{ background: '#FFF', borderRadius: '14px', padding: '18px', border: '2px solid #059669', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)' }}>
          <span style={{ fontSize: '12px', color: '#065F46', fontWeight: '700' }}>Net Realized Sales</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669', marginTop: '6px' }}>
            ₹{summary.netSales.toFixed(2)}
          </div>
          <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Authorized Revenue</span>
        </div>

        {/* Cancelled / Voided Bills */}
        <div style={{ background: '#FFF', borderRadius: '14px', padding: '18px', border: '1px solid #FECACA' }}>
          <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: '600' }}>Cancelled / Voided</span>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#DC2626', marginTop: '6px' }}>
            {summary.cancelledBillsCount}
          </div>
          <span style={{ fontSize: '11px', color: '#DC2626' }}>₹{summary.cancelledAmount.toFixed(2)} excluded</span>
        </div>
      </div>

      {/* Sales Trend Timeline Table */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
            Timeline Trend Breakdown
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Showing {timeline.length} period {timeline.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {timeline.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748B', fontSize: '14px' }}>
            No finalized transactions recorded for this period selection.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Orders Count</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Gross Sales</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Discounts</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Taxes (5%)</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Net Realized</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '700', color: '#0F172A' }}>
                      {row.report_date}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#334155' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        fontWeight: '700',
                        fontSize: '12px'
                      }}>
                        {row.orders_count} bills
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', color: '#64748B' }}>
                      ₹{parseFloat(row.gross_sales).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', color: '#D97706' }}>
                      ₹{parseFloat(row.discounts).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', color: '#2563EB' }}>
                      ₹{parseFloat(row.taxes).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                      ₹{parseFloat(row.net_sales).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #CBD5E1', background: '#F8FAFC', fontWeight: '800' }}>
                  <td style={{ padding: '12px 10px', color: '#0F172A' }}>TOTALS</td>
                  <td style={{ padding: '12px 10px', color: '#0F172A' }}>{summary.totalCompletedBills} bills</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#64748B' }}>₹{summary.grossSales.toFixed(2)}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#D97706' }}>₹{summary.discounts.toFixed(2)}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#2563EB' }}>₹{summary.taxes.toFixed(2)}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#059669', fontSize: '15px' }}>₹{summary.netSales.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
