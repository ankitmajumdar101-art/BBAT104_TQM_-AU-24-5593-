import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import OwnerDashboard from './components/owner/OwnerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import CashierDashboard from './components/cashier/CashierDashboard';
import POSBilling from './components/POSBilling';
import BillHistory from './components/BillHistory';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('cashier');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);

        // Default tab based on role
        if (parsedUser.role === 'Owner') {
          setActiveTab('owner');
        } else if (parsedUser.role === 'Admin') {
          setActiveTab('admin');
        } else if (parsedUser.role === 'Cashier') {
          setActiveTab('cashier');
        } else {
          setActiveTab('kitchen');
        }
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (loggedInUser, jwtToken) => {
    setUser(loggedInUser);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.setItem('token', jwtToken);

    if (loggedInUser.role === 'Owner') {
      setActiveTab('owner');
    } else if (loggedInUser.role === 'Admin') {
      setActiveTab('admin');
    } else if (loggedInUser.role === 'Cashier') {
      setActiveTab('cashier');
    } else {
      setActiveTab('kitchen');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    setActiveTab('cashier');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <p style={{ fontWeight: '700', color: 'var(--primary)' }}>Loading POS System...</p>
      </div>
    );
  }

  if (!user || !token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isOwner = user.role === 'Owner';
  const isAdmin = user.role === 'Admin';
  const isCashier = user.role === 'Cashier';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        {isOwner && <OwnerDashboard onLogout={handleLogout} />}

        {isAdmin && <AdminDashboard currentUser={user} onLogout={handleLogout} />}

        {isCashier && <CashierDashboard currentUser={user} onLogout={handleLogout} />}

        {!isOwner && !isAdmin && !isCashier && (
          <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ color: '#0F172A' }}>Kitchen Display & Order Pipeline</h2>
            <p style={{ color: '#64748B' }}>Real-time food preparation queue for Kitchen Staff.</p>
          </div>
        )}
      </main>
    </div>
  );
}