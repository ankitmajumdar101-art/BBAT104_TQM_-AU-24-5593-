import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import OwnerDashboard from './components/owner/OwnerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import CashierDashboard from './components/cashier/CashierDashboard';
import KitchenDashboard from './components/kitchen/KitchenDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
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
        } else if (parsedUser.role === 'Kitchen Staff') {
          setActiveTab('kitchen');
        } else {
          setActiveTab('overview');
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
    } else if (loggedInUser.role === 'Kitchen Staff') {
      setActiveTab('kitchen');
    } else {
      setActiveTab('overview');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    setActiveTab('overview');
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
  const isKitchen = user.role === 'Kitchen Staff';

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

        {isKitchen && <KitchenDashboard currentUser={user} onLogout={handleLogout} />}

        {!isOwner && !isAdmin && !isCashier && !isKitchen && (
          <div style={{ padding: '32px', maxWidth: '800px', margin: '40px auto', textAlign: 'center', background: '#FFF', borderRadius: '16px' }}>
            <h2 style={{ color: '#0F172A' }}>Account Setup Completed</h2>
            <p style={{ color: '#64748B' }}>Please contact an administrator to review your assigned system role.</p>
          </div>
        )}
      </main>
    </div>
  );
}