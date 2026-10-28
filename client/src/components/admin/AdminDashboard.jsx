import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  UtensilsCrossed, 
  Settings, 
  Database, 
  ShieldCheck, 
  Sliders, 
  UserCircle 
} from 'lucide-react';

import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminMenu from './AdminMenu';
import AdminBillingSettings from './AdminBillingSettings';
import AdminBackups from './AdminBackups';
import AdminAuditLogs from './AdminAuditLogs';
import AdminSystemSettings from './AdminSystemSettings';
import AdminProfile from './AdminProfile';

export default function AdminDashboard({ currentUser, onLogout, initialSubTab = 'overview' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3, desc: 'A. Operational Status' },
    { id: 'users', label: 'User Accounts', icon: Users, desc: 'B & C. Staff & RBAC' },
    { id: 'menu', label: 'Menu & Categories', icon: UtensilsCrossed, desc: 'D & E. Offerings & Prices' },
    { id: 'billing', label: 'Tax & Billing', icon: Settings, desc: 'F. GST & Invoicing Rules' },
    { id: 'backup', label: 'Backups & Recovery', icon: Database, desc: 'G. Safeguards & Dumps' },
    { id: 'audit', label: 'Audit & Error Logs', icon: ShieldCheck, desc: 'H & I. Compliance Trails' },
    { id: 'system', label: 'System Settings', icon: Sliders, desc: 'J. Operational Prefs' },
    { id: 'profile', label: 'Profile & Security', icon: UserCircle, desc: 'K. Identity & Password' },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Sub-Navigation Tabs */}
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
                background: isActive ? '#2563EB' : 'transparent',
                color: isActive ? '#FFF' : '#475569',
                fontSize: '13px',
                fontWeight: isActive ? '700' : '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none'
              }}
            >
              <Icon size={16} color={isActive ? '#FFF' : '#64748B'} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Sub-Section */}
      <div style={{ minHeight: '600px' }}>
        {activeSubTab === 'overview' && <AdminOverview onNavigate={(target) => setActiveSubTab(target)} />}
        {activeSubTab === 'users' && <AdminUsers currentUser={currentUser} />}
        {activeSubTab === 'menu' && <AdminMenu />}
        {activeSubTab === 'billing' && <AdminBillingSettings />}
        {activeSubTab === 'backup' && <AdminBackups />}
        {activeSubTab === 'audit' && <AdminAuditLogs />}
        {activeSubTab === 'system' && <AdminSystemSettings />}
        {activeSubTab === 'profile' && <AdminProfile onLogout={onLogout} />}
      </div>
    </div>
  );
}
