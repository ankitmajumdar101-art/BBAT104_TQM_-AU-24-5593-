import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import POSBilling from './components/POSBilling';
import BillHistory from './components/BillHistory';
import AdminMenu from './components/AdminMenu';
import AdminUsers from './components/AdminUsers';
import OwnerDashboard from './components/owner/OwnerDashboard';
import AuditLogs from './components/AuditLogs';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
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
        } else {
          setActiveTab('pos');
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
    } else {
      setActiveTab('pos');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    setActiveTab('pos');
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        {isOwner ? (
          <OwnerDashboard onLogout={handleLogout} />
        ) : (
          <>
            {activeTab === 'pos' && <POSBilling user={user} />}
            {activeTab === 'history' && <BillHistory />}
            {activeTab === 'menu' && <AdminMenu />}
            {activeTab === 'users' && <AdminUsers currentUser={user} />}
            {activeTab === 'audit' && <AuditLogs />}
          </>
        )}
      </main>
    </div>
  );
}
