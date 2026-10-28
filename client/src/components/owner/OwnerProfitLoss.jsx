import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  Download, 
  Calendar, 
  AlertTriangle,
  Info,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function OwnerProfitLoss() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchPnL();
  }, []);

  const fetchPnL = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/owner/profit-loss';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('PnL fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rev = data.revenue;
    const exp = data.expenses;
    const prof = data.profitability;

    const rows = [
      ['STATEMENT OF ESTIMATED PROFIT AND LOSS'],
      ['Period', `${data.dateRange.startDate} to ${data.dateRange.endDate}`],
      ['Generated On', new Date().toLocaleString('en-IN')],
      [],
      ['REVENUE COMPONENT', 'AMOUNT (Rs)'],
      ['Gross Customer Sales (+)', rev.grossSales.toFixed(2)],
      ['Discounts Allowed (-)', `(${rev.discounts.toFixed(2)})`],
      ['Taxes (5% GST) (+)', rev.taxes.toFixed(2)],
      ['Voided / Cancelled (deducted)', `(${rev.voidedSales.toFixed(2)})`],
      ['NET REALIZED REVENUE', rev.netSales.toFixed(2)],
      [],
      ['RECORDED OPERATING EXPENSES', 'AMOUNT (Rs)'],
      ...exp.breakdown.map(b => [`- ${b.category}`, parseFloat(b.category_total).toFixed(2)]),
      ['TOTAL RECORDED EXPENSES (-)', `(${exp.totalExpenses.toFixed(2)})`],
      [],
      ['ESTIMATED NET OPERATING PROFIT', prof.operatingProfit.toFixed(2)],
      ['Operating Margin (%)', `${prof.profitMarginPct}%`],
      [],
      ['DISCLAIMER', data.calculationRuleNote]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Profit_Loss_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revenue = data?.revenue || { grossSales: 0, discounts: 0, taxes: 0, netSales: 0, voidedSales: 0 };
  const expenses = data?.expenses || { totalExpenses: 0, breakdown: [] };
  const profitability = data?.profitability || { operatingProfit: 0, profitMarginPct: 0 };

  const isProfitable = profitability.operatingProfit >= 0;

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
              Section D • Profit & Loss Statement
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Estimated Operating Profit & Loss
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Audit net realized revenue against recorded operating overheads.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
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
            <Download size={15} /> Export Statement (CSV)
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
            <Printer size={15} /> Print Statement
          </button>
          <button
            onClick={fetchPnL}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
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

      {/* Date Range Selector */}
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
        gap: '12px'
      }}>
        <div style={{ fontSize: '13px', color: '#475569' }}>
          Reporting Period: <strong>{data?.dateRange?.startDate}</strong> to <strong>{data?.dateRange?.endDate}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            onClick={fetchPnL}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              background: '#0F172A',
              color: '#FFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Update Period
          </button>
        </div>
      </div>

      {/* Primary KPI Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '12px', color: '#065F46', fontWeight: '700' }}>1. Net Realized Revenue</span>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#059669', marginTop: '6px' }}>
            ₹{revenue.netSales.toFixed(2)}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Gross ₹{revenue.grossSales.toFixed(2)} minus discounts</span>
        </div>

        <div style={{ background: '#FFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '12px', color: '#991B1B', fontWeight: '700' }}>2. Total Recorded Expenses</span>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#DC2626', marginTop: '6px' }}>
            ₹{expenses.totalExpenses.toFixed(2)}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Raw materials, utilities & packaging</span>
        </div>

        <div style={{
          background: isProfitable ? '#ECFDF5' : '#FEF2F2',
          borderRadius: '16px',
          padding: '20px',
          border: `2px solid ${isProfitable ? '#059669' : '#DC2626'}`
        }}>
          <span style={{ fontSize: '12px', color: isProfitable ? '#065F46' : '#991B1B', fontWeight: '700' }}>
            3. Estimated Operating {isProfitable ? 'Profit' : 'Loss'}
          </span>
          <div style={{
            fontSize: '28px',
            fontWeight: '900',
            color: isProfitable ? '#059669' : '#DC2626',
            marginTop: '6px'
          }}>
            ₹{profitability.operatingProfit.toFixed(2)}
          </div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: isProfitable ? '#059669' : '#DC2626' }}>
            Operating Margin: {profitability.profitMarginPct}%
          </span>
        </div>
      </div>

      {/* Formal Financial Statement Breakdown */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '28px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: '0 0 20px 0', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px' }}>
          Statement of Operating Income & Expenses
        </h3>

        {/* Section 1: Revenue Breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#059669', margin: '0 0 10px 0' }}>
            A. REVENUE & COLLECTIONS
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                <td style={{ padding: '8px 0', color: '#334155' }}>Gross Sales (Customer Item Totals)</td>
                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', color: '#0F172A' }}>
                  ₹{revenue.grossSales.toFixed(2)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                <td style={{ padding: '8px 0', color: '#D97706' }}>Less: Promotional Discounts & Coupons</td>
                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', color: '#D97706' }}>
                  - ₹{revenue.discounts.toFixed(2)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                <td style={{ padding: '8px 0', color: '#2563EB' }}>Add: GST Collected (CGST + SGST 5%)</td>
                <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', color: '#2563EB' }}>
                  + ₹{revenue.taxes.toFixed(2)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                <td style={{ padding: '8px 0', color: '#64748B' }}>Cancelled / Voided Bills (Excluded from revenue)</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: '#94A3B8' }}>
                  [₹{revenue.voidedSales.toFixed(2)}]
                </td>
              </tr>
              <tr style={{ background: '#F8FAFC', fontWeight: '700' }}>
                <td style={{ padding: '10px 8px', color: '#065F46' }}>TOTAL NET REALIZED SALES</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', color: '#059669', fontSize: '14px' }}>
                  ₹{revenue.netSales.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Operating Expenses Breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#DC2626', margin: '0 0 10px 0' }}>
            B. RECORDED OPERATING EXPENSES
          </h4>
          {expenses.breakdown.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>No expenses recorded for this period.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                {expenses.breakdown.map((b, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '8px 0', color: '#334155' }}>{b.category}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', color: '#DC2626' }}>
                      - ₹{parseFloat(b.category_total).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#FEF2F2', fontWeight: '700' }}>
                  <td style={{ padding: '10px 8px', color: '#991B1B' }}>TOTAL RECORDED OPERATING OUTFLOW</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#DC2626', fontSize: '14px' }}>
                    - ₹{expenses.totalExpenses.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Section 3: Bottom Line Net Operating Profit */}
        <div style={{
          borderTop: '2px solid #0F172A',
          paddingTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
              ESTIMATED NET OPERATING {isProfitable ? 'PROFIT' : 'LOSS'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Formula: Net Realized Sales (₹{revenue.netSales.toFixed(2)}) - Recorded Expenses (₹{expenses.totalExpenses.toFixed(2)})
            </div>
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '900',
            color: isProfitable ? '#059669' : '#DC2626'
          }}>
            ₹{profitability.operatingProfit.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Mandatory Transparent Calculation Disclaimer Note (Section 2.2.D Requirement) */}
      <div style={{
        background: '#FFFBEB',
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid #FCD34D',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: '#92400E', lineHeight: '1.5' }}>
          <strong>Transparency & Accounting Standard Disclaimer (bbat104 TQM Course Compliance):</strong>
          <p style={{ margin: '4px 0 0 0' }}>
            {data?.calculationRuleNote || 
             'Operating Profit = Net Sales - Total Recorded Expenses. This report reflects only verified finalized sales orders and recorded expense vouchers in the database. It is not labeled as audited net profit if indirect depreciation, commercial leases, payroll liabilities, or unrecorded vendor costs remain unentered.'}
          </p>
        </div>
      </div>
    </div>
  );
}
