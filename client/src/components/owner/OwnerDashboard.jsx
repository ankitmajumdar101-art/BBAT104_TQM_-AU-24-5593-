import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  DollarSign, 
  Receipt, 
  Users, 
  Settings, 
  UserCircle 
} from 'lucide-react';

import OwnerOverview from './OwnerOverview';
import OwnerSalesReports from './OwnerSalesReports';
import OwnerExpenses from './OwnerExpenses';
import OwnerProfitLoss from './OwnerProfitLoss';
import OwnerBillHistory from './OwnerBillHistory';
import OwnerStaffPerformance from './OwnerStaffPerformance';
import OwnerBusinessSettings from './OwnerBusinessSettings';
import OwnerProfile from './OwnerProfile';

export default function OwnerDashboard({ onLogout, initialSubTab = 'overview' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3, desc: 'A. Business KPI Summary' },
    { id: 'sales', label: 'Sales Reports', icon: TrendingUp, desc: 'B. Daily, Monthly & Yearly' },
    { id: 'expenses', label: 'Expenses', icon: Wallet, desc: 'C. Overheads & Raw Costs' },
    { id: 'pnl', label: 'Profit & Loss', icon: DollarSign, desc: 'D. Estimated Operating P&L' },
    { id: 'bills', label: 'Bill History', icon: Receipt, desc: 'E. Read-Only Auditing' },
    { id: 'staff', label: 'Staff Performance', icon: Users, desc: 'F. Cashier Throughput' },
    { id: 'settings', label: 'Business Settings', icon: Settings, desc: 'G. Restaurant Profile' },
    { id: 'profile', label: 'Profile & Security', icon: UserCircle, desc: 'H. Password & Identity' },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Owner Dashboard Sub-Navigation Tabs */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {sections.map(sec => {
          const Icon = sec.icon;
          const isActive = activeSubTab === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSubTab(sec.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#FFF' : '#475569',
                fontSize: '13px',
                fontWeight: isActive ? '700' : '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(180, 83, 9, 0.25)' : 'none'
              }}
            >
              <Icon size={16} color={isActive ? '#FFF' : '#64748B'} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Selected Sub-Section */}
      <div style={{ minHeight: '600px' }}>
        {activeSubTab === 'overview' && <OwnerOverview onNavigate={(target) => setActiveSubTab(target)} />}
        {activeSubTab === 'sales' && <OwnerSalesReports />}
        {activeSubTab === 'expenses' && <OwnerExpenses />}
        {activeSubTab === 'pnl' && <OwnerProfitLoss />}
        {activeSubTab === 'bills' && <OwnerBillHistory />}
        {activeSubTab === 'staff' && <OwnerStaffPerformance />}
        {activeSubTab === 'settings' && <OwnerBusinessSettings />}
        {activeSubTab === 'profile' && <OwnerProfile onLogout={onLogout} />}
      </div>
    </div>
  );
}
