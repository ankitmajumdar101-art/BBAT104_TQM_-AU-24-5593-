import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import OwnerDashboard from './components/owner/OwnerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import CashierDashboard from './components/cashier/CashierDashboard';
import KitchenDashboard from './components/kitchen/KitchenDashboard';
import WaiterDashboard from './components/waiter/WaiterDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [appTitle, setAppTitle] = useState(() => {
    return localStorage.getItem('application_title') || 'Royal Feast Restaurant Billing & POS';
  });
  const [themePreference, setThemePreference] = useState(() => {
    const saved = localStorage.getItem('theme_preference') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    if (saved === 'dark') document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
    return saved;
  });

  // Fetch active system preferences on initial app mount
  useEffect(() => {
    const fetchSystemPrefs = async () => {
      try {
        const res = await fetch('/api/system/preferences');
        const data = await res.json();
        if (data.success && data.preferences) {
          const { application_title, theme_preference: prefTheme } = data.preferences;
          if (application_title) {
            setAppTitle(application_title);
            document.title = application_title;
            localStorage.setItem('application_title', application_title);
          }
          if (prefTheme) {
            setThemePreference(prefTheme);
            document.documentElement.setAttribute('data-theme', prefTheme);
            if (prefTheme === 'dark') document.body.classList.add('dark-theme');
            else document.body.classList.remove('dark-theme');
            localStorage.setItem('theme_preference', prefTheme);
          }
        }
      } catch (err) {
        console.error('Failed to fetch system preferences:', err);
      }
    };

    fetchSystemPrefs();

    // Listen to custom event when settings are updated in Admin panel
    const handleSettingsChanged = (e) => {
      if (!e.detail) return;
      const { application_title, theme_preference: prefTheme } = e.detail;
      if (application_title) {
        setAppTitle(application_title);
        document.title = application_title;
        localStorage.setItem('application_title', application_title);
      }
      if (prefTheme) {
        setThemePreference(prefTheme);
        document.documentElement.setAttribute('data-theme', prefTheme);
        if (prefTheme === 'dark') document.body.classList.add('dark-theme');
        else document.body.classList.remove('dark-theme');
        localStorage.setItem('theme_preference', prefTheme);
      }
    };

    window.addEventListener('app-settings-changed', handleSettingsChanged);
    return () => {
      window.removeEventListener('app-settings-changed', handleSettingsChanged);
    };
  }, []);

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
        } else if (parsedUser.role === 'Waiter') {
          setActiveTab('waiter');
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
    } else if (loggedInUser.role === 'Waiter') {
      setActiveTab('waiter');
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
  const isWaiter = user.role === 'Waiter';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        appTitle={appTitle}
        themePreference={themePreference}
      />

      <main style={{ flex: 1 }}>
        {isOwner && <OwnerDashboard onLogout={handleLogout} />}

        {isAdmin && (
          <AdminDashboard 
            currentUser={user} 
            onLogout={handleLogout} 
            appTitle={appTitle}
            themePreference={themePreference}
          />
        )}

        {isCashier && <CashierDashboard currentUser={user} onLogout={handleLogout} />}

        {isKitchen && <KitchenDashboard currentUser={user} onLogout={handleLogout} />}

        {isWaiter && <WaiterDashboard currentUser={user} onLogout={handleLogout} />}

        {!isOwner && !isAdmin && !isCashier && !isKitchen && !isWaiter && (
          <div style={{ padding: '32px', maxWidth: '800px', margin: '40px auto', textAlign: 'center', background: '#FFF', borderRadius: '16px' }}>
            <h2 style={{ color: '#0F172A' }}>Account Setup Completed</h2>
            <p style={{ color: '#64748B' }}>Please contact an administrator to review your assigned system role.</p>
          </div>
        )}
      </main>
    </div>
  );
}