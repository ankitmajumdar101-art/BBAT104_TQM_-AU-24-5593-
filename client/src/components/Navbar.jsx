import React from 'react';
import { 
  Receipt, 
  History, 
  UtensilsCrossed, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon 
} from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  const isOwner = user?.role === 'Owner';
  const isAdmin = user?.role === 'Admin';
  const isCashier = user?.role === 'Cashier';

  const navItems = isOwner
    ? [
        { id: 'owner', label: 'Owner Executive Dashboard', icon: BarChart3, roles: ['Owner'] }
      ]
    : [
        { id: 'pos', label: 'POS Billing', icon: Receipt, roles: ['Admin', 'Cashier'] },
        { id: 'history', label: 'Bill History', icon: History, roles: ['Admin', 'Cashier'] },
        { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed, roles: ['Admin'] },
        { id: 'users', label: 'User Management', icon: Users, roles: ['Admin'] },
        { id: 'audit', label: 'Audit & Backup', icon: ShieldCheck, roles: ['Admin'] }
      ];

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

  const roleBadgeColors = {
    Owner: 'background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D;',
    Admin: 'background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE;',
    Cashier: 'background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0;'
  };

  return (
    <header style={{
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
      color: '#FFF',
      padding: '0 24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
        maxWidth: '1440px',
        margin: '0 auto'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--accent-gold)',
            color: '#FFF',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)'
          }}>
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', margin: 0 }}>
              Royal Feast
            </h1>
            <p style={{ fontSize: '11px', color: '#FCD34D', margin: 0, fontWeight: '700', letterSpacing: '0.4px' }}>
              {isOwner ? '👑 EXECUTIVE OWNER PORTAL' : 'RESTAURANT BILLING & POS'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  background: isActive ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                  color: isActive ? '#FDE68A' : '#E2E8F0',
                  border: isActive ? '1px solid rgba(253, 230, 138, 0.4)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.08)',
            padding: '6px 12px',
            borderRadius: '8px'
          }}>
            <div style={{
              background: '#FFF',
              color: 'var(--primary)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px'
            }}>
              <UserIcon size={16} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: '700' }}>{user?.full_name || user?.username}</div>
              <span style={{
                display: 'inline-block',
                fontSize: '10px',
                fontWeight: '800',
                padding: '1px 6px',
                borderRadius: '4px',
                marginTop: '2px',
                background: user?.role === 'Owner' ? '#FEF3C7' : user?.role === 'Admin' ? '#DBEAFE' : '#D1FAE5',
                color: user?.role === 'Owner' ? '#92400E' : user?.role === 'Admin' ? '#1E40AF' : '#065F46'
              }}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#EF4444',
              color: '#FFF',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
