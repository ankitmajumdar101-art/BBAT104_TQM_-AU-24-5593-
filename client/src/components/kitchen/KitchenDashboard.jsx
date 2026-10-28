import React, { useState } from 'react';
import { 
  BarChart3, 
  Bell, 
  Flame, 
  CheckCircle2, 
  FileText, 
  UserCircle,
  Volume2,
  VolumeX
} from 'lucide-react';

import KitchenOverview from './KitchenOverview';
import KitchenOrderQueue from './KitchenOrderQueue';
import KitchenCompletedHistory from './KitchenCompletedHistory';
import KitchenProfile from './KitchenProfile';

export default function KitchenDashboard({ currentUser, onLogout, initialSubTab = 'overview' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sections = [
    { id: 'overview', label: 'Kitchen Overview', icon: BarChart3, desc: 'A. Line Pulse' },
    { id: 'new', label: 'New Orders', icon: Bell, desc: 'B. Accept Queue' },
    { id: 'preparing', label: 'Cooking (Prep)', icon: Flame, desc: 'C. In Progress' },
    { id: 'ready', label: 'Ready for Service', icon: CheckCircle2, desc: 'D. Waiter Pickup' },
    { id: 'completed', label: 'Completed Archive', icon: FileText, desc: 'E. Prep History' },
    { id: 'profile', label: 'Profile & Security', icon: UserCircle, desc: 'G. Chef Account' },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Sub-Navigation Tabs & Audio Toggle */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '8px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                  background: isActive ? '#0F172A' : 'transparent',
                  color: isActive ? '#FFF' : '#475569',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(15, 23, 42, 0.25)' : 'none'
                }}
              >
                <Icon size={16} color={isActive ? '#FFF' : '#64748B'} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: soundEnabled ? '#ECFDF5' : '#F1F5F9',
            border: soundEnabled ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
            color: soundEnabled ? '#065F46' : '#64748B',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>{soundEnabled ? 'Alert Chime: ON' : 'Muted'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div>
        {activeSubTab === 'overview' && (
          <KitchenOverview
            onNavigate={(tab) => setActiveSubTab(tab)}
          />
        )}

        {activeSubTab === 'new' && (
          <KitchenOrderQueue
            status="New"
            title="New Orders Awaiting Acceptance"
            subtitle="Section 5.2.B: Review guest order items, dietary notes, and accept to start cooking."
            nextStatus="Preparing"
            nextButtonLabel="Accept & Start Preparing"
            nextButtonIcon={Flame}
          />
        )}

        {activeSubTab === 'preparing' && (
          <KitchenOrderQueue
            status="Preparing"
            title="Orders Currently Cooking in Progress"
            subtitle="Section 5.2.C: Food in preparation on woks, tandoors, and ovens. Mark as Ready when plated."
            nextStatus="Ready"
            nextButtonLabel="Mark Order as Ready for Pickup"
            nextButtonIcon={CheckCircle2}
          />
        )}

        {activeSubTab === 'ready' && (
          <KitchenOrderQueue
            status="Ready"
            title="Orders Ready for Waiter Pickup & Service"
            subtitle="Section 5.2.D: Plated dishes ready at the pass. Hand over to waiters or food runners."
            nextStatus="Completed"
            nextButtonLabel="Confirm Handover to Waiter (Complete)"
            nextButtonIcon={CheckCircle2}
          />
        )}

        {activeSubTab === 'completed' && (
          <KitchenCompletedHistory />
        )}

        {activeSubTab === 'profile' && (
          <KitchenProfile
            currentUser={currentUser}
            onLogout={onLogout}
          />
        )}
      </div>

    </div>
  );
}