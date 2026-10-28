import React, { useState } from 'react';
import { 
  BarChart3, 
  Receipt, 
  History, 
  FileText, 
  ChefHat, 
  UserCircle 
} from 'lucide-react';

import CashierOverview from './CashierOverview';
import CashierPOS from './CashierPOS';
import CashierBillHistory from './CashierBillHistory';
import CashierDrafts from './CashierDrafts';
import CashierKitchenOrders from './CashierKitchenOrders';
import CashierProfile from './CashierProfile';
import CashierReceiptModal from './CashierReceiptModal';

export default function CashierDashboard({ currentUser, onLogout, initialSubTab = 'overview' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [loadedDraft, setLoadedDraft] = useState(null);

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [isReprintModal, setIsReprintModal] = useState(false);

  const sections = [
    { id: 'overview', label: 'Billing Overview', icon: BarChart3, desc: 'A. Shift Metrics' },
    { id: 'pos', label: 'Create Bill / POS', icon: Receipt, desc: 'B-F. New Invoices' },
    { id: 'history', label: 'My Bill History', icon: History, desc: 'G & I. History & Refunds' },
    { id: 'drafts', label: 'Saved Drafts', icon: FileText, desc: 'C. Unfinalized Orders' },
    { id: 'kitchen', label: 'Kitchen Tracker', icon: ChefHat, desc: 'H. Live Order Prep' },
    { id: 'profile', label: 'Profile & Security', icon: UserCircle, desc: 'J. Cashier Account' },
  ];

  // Handle reprinting from Overview or History
  const handleReprintOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.order) {
        setReceiptOrder(data.order);
        setIsReprintModal(true);
      }
    } catch (err) {
      console.error('Failed to load bill for reprint:', err);
    }
  };

  // Handle fresh bill finalized in POS
  const handleBillFinalized = (order) => {
    setReceiptOrder(order);
    setIsReprintModal(false);
  };

  // Handle resuming draft from Drafts tab
  const handleResumeDraft = (draft) => {
    setLoadedDraft(draft);
    setActiveSubTab('pos');
  };

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
                background: isActive ? '#059669' : 'transparent',
                color: isActive ? '#FFF' : '#475569',
                fontSize: '13px',
                fontWeight: isActive ? '700' : '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(5, 150, 105, 0.25)' : 'none'
              }}
            >
              <Icon size={16} color={isActive ? '#FFF' : '#64748B'} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div>
        {activeSubTab === 'overview' && (
          <CashierOverview
            onNavigate={(tab) => setActiveSubTab(tab)}
            onReprintOrder={handleReprintOrder}
          />
        )}

        {activeSubTab === 'pos' && (
          <CashierPOS
            user={currentUser}
            loadedDraft={loadedDraft}
            onClearLoadedDraft={() => setLoadedDraft(null)}
            onBillFinalized={handleBillFinalized}
          />
        )}

        {activeSubTab === 'history' && (
          <CashierBillHistory
            onReprintOrder={handleReprintOrder}
          />
        )}

        {activeSubTab === 'drafts' && (
          <CashierDrafts
            onResumeDraft={handleResumeDraft}
          />
        )}

        {activeSubTab === 'kitchen' && (
          <CashierKitchenOrders />
        )}

        {activeSubTab === 'profile' && (
          <CashierProfile
            currentUser={currentUser}
            onLogout={onLogout}
          />
        )}
      </div>

      {/* Global Thermal Receipt Modal */}
      {receiptOrder && (
        <CashierReceiptModal
          order={receiptOrder}
          isReprint={isReprintModal}
          onClose={() => setReceiptOrder(null)}
        />
      )}

    </div>
  );
}