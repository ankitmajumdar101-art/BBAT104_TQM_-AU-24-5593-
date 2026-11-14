import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Users, 
  Clock, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  ChefHat, 
  Sparkles, 
  RefreshCw, 
  X, 
  Tag, 
  Send,
  Coffee,
  Check,
  Printer,
  Building2,
  Armchair,
  LayoutGrid,
  ArrowRight
} from 'lucide-react';
import ReceiptModal from '../ReceiptModal';
import DishImage from '../common/DishImage';

export default function WaiterDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('tables'); // 'tables', 'order', 'orders'
  
  // Data States
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedChair, setSelectedChair] = useState(1); // 1, 2, 3, 4, or 0 (Shared)
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [notifications, setNotifications] = useState({ foodReadyCount: 0, foodReadyOrders: [], billReadyCount: 0, billReadyOrders: [] });
  
  // Seating Modal State
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedTableForSeat, setSelectedTableForSeat] = useState(null);
  const [seatForm, setSeatForm] = useState({ customer_name: '', customer_phone: '', guests_count: 2 });
  
  // Order Taking State
  const [selectedTableNum, setSelectedTableNum] = useState(1);
  const [orderCustomerName, setOrderCustomerName] = useState('');
  const [orderCustomerPhone, setOrderCustomerPhone] = useState('');
  const [cartItems, setCartItems] = useState([]); // [{ id, name, price, discounted_price, quantity, discount_percent }]
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState(null);
  
  // General UI States
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // 0. Fetch Rooms / Floors
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/waiter/rooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.rooms) {
        setRooms(data.rooms);
        if (data.rooms.length > 0 && !selectedRoomId) {
          setSelectedRoomId(data.rooms[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  // 1. Fetch Tables
  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/waiter/tables', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTables(data.tables || []);
      }
    } catch (err) {
      console.error('Failed to load tables:', err);
    }
  };

  // 2. Fetch Menu with Dishes & Discounts
  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/waiter/menu', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setMenuItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  };

  // 3. Fetch Orders & Live Notifications
  const fetchOrdersAndNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const [ordRes, notifRes] = await Promise.all([
        fetch('/api/waiter/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/waiter/notifications', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const ordData = await ordRes.json();
      const notifData = await notifRes.json();

      if (ordData.success) setActiveOrders(ordData.orders || []);
      if (notifData.success) setNotifications(notifData);
    } catch (err) {
      console.error('Failed to load orders/notifications:', err);
    }
  };

  const refreshAll = () => {
    fetchRooms();
    fetchTables();
    fetchOrdersAndNotifications();
  };

  useEffect(() => {
    fetchRooms();
    fetchTables();
    fetchMenu();
    fetchOrdersAndNotifications();

    const interval = setInterval(() => {
      fetchRooms();
      fetchTables();
      fetchOrdersAndNotifications();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Handle Seating Customer
  const handleOpenSeatModal = (tbl) => {
    setSelectedTableForSeat(tbl);
    setSeatForm({
      customer_name: '',
      customer_phone: '',
      guests_count: tbl.capacity || 2
    });
    setShowSeatModal(true);
  };

  const handleConfirmSeat = async (e) => {
    e.preventDefault();
    if (!selectedTableForSeat) return;

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/waiter/tables/seat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          table_number: selectedTableForSeat.table_number,
          customer_name: seatForm.customer_name,
          customer_phone: seatForm.customer_phone,
          guests_count: seatForm.guests_count
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        setShowSeatModal(false);
        fetchTables();
      } else {
        setFeedback({ type: 'error', message: data.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to assign table.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Clearing Table
  const handleClearTable = async (tableNum) => {
    if (!window.confirm(`Are you sure you want to clear Table #${tableNum} and mark it Available?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/waiter/tables/${tableNum}/clear`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        fetchTables();
        fetchOrdersAndNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Switching to Order Taking with Preselected Table & Chair
  const handleStartOrderForTable = (tbl, chairNum = 1) => {
    if (tbl.room_id) setSelectedRoomId(tbl.room_id);
    setSelectedTableNum(tbl.table_number);
    setSelectedChair(chairNum);
    setOrderCustomerName(tbl.customer_name || '');
    setOrderCustomerPhone(tbl.customer_phone || '');
    setActiveTab('order');
  };

  // Cart Management with Chair Allocation
  const handleAddToCart = (dish) => {
    const chairNum = selectedChair !== undefined ? selectedChair : 1;
    const chairLbl = chairNum === 0 ? 'Shared / Whole Table' : `Chair ${chairNum}`;
    const cartKey = `${dish.id}-c${chairNum}`;

    const existing = cartItems.find(i => i.cartKey === cartKey);
    if (existing) {
      setCartItems(cartItems.map(i => i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCartItems([...cartItems, {
        cartKey,
        id: dish.id,
        name: dish.name,
        price: dish.price,
        discounted_price: dish.discounted_price,
        discount_percent: dish.discount_percent,
        image_url: dish.image_url,
        category_name: dish.category_name,
        chair_number: chairNum,
        chair_label: chairLbl,
        quantity: 1
      }]);
    }
  };

  const handleUpdateCartQty = (keyOrId, delta) => {
    setCartItems(cartItems.map(i => {
      if (i.cartKey === keyOrId || i.id === keyOrId) {
        const nextQty = i.quantity + delta;
        return nextQty > 0 ? { ...i, quantity: nextQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const handleRemoveFromCart = (keyOrId) => {
    setCartItems(cartItems.filter(i => (i.cartKey !== keyOrId && i.id !== keyOrId)));
  };

  const handleItemChairChange = (cartKey, newChairNum) => {
    const cNum = parseInt(newChairNum, 10);
    const cLbl = cNum === 0 ? 'Shared / Whole Table' : `Chair ${cNum}`;
    setCartItems(cartItems.map(item => {
      if (item.cartKey === cartKey) {
        return {
          ...item,
          chair_number: cNum,
          chair_label: cLbl,
          cartKey: `${item.id}-c${cNum}`
        };
      }
      return item;
    }));
  };

  // Calculate Cart Totals
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.discounted_price * item.quantity), 0);
  const cartTotalOriginal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartSavings = Math.max(0, cartTotalOriginal - cartSubtotal);
  const cartTax = parseFloat(((cartSubtotal * 5) / 100).toFixed(2));
  const cartEstimatedTotal = parseFloat((cartSubtotal + cartTax).toFixed(2));

  // Submit Order to Cashier (includes Room, Table, and Chair assignments)
  const handleSubmitOrderToCashier = async () => {
    if (cartItems.length === 0) {
      alert('Please add at least one dish to the order.');
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/waiter/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          room_id: selectedRoomId,
          table_number: selectedTableNum,
          customer_name: orderCustomerName,
          customer_phone: orderCustomerPhone,
          items: cartItems.map(i => ({ 
            menu_item_id: i.id, 
            quantity: i.quantity,
            chair_number: i.chair_number !== undefined ? i.chair_number : 1,
            chair_label: i.chair_label || (i.chair_number === 0 ? 'Shared' : `Chair ${i.chair_number || 1}`)
          })),
          notes: orderNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Order submitted for Table #${selectedTableNum}! Forwarded to Cashier for bill generation.`
        });
        setCartItems([]);
        setOrderNotes('');
        refreshAll();
        setActiveTab('orders');
      } else {
        setFeedback({ type: 'error', message: data.message || 'Order submission failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error submitting order.' });
    } finally {
      setLoading(false);
    }
  };

  // Mark Food Served
  const handleMarkServed = async (orderId, tableNum) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/waiter/orders/${orderId}/serve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        refreshAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark Bill Delivered to Customer
  const handleMarkBillDelivered = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/waiter/orders/${orderId}/bill-delivered`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        refreshAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // View Receipt Modal
  const handleViewReceipt = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.order) {
        setReceiptOrder(data.order);
      }
    } catch (err) {
      console.error('Failed to load bill receipt:', err);
    }
  };

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category_name === selectedCategory;
    const matchSearch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Real-Time Live Notification Alerts */}
      {notifications.foodReadyCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#FFF',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.25)', padding: '8px', borderRadius: '50%' }}>
              <Bell size={24} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '0.3px' }}>
                🔔 FOOD READY ALERT: {notifications.foodReadyCount} Table(s) Ready for Pickup!
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Kitchen Chef has finished cooking for:{' '}
                {notifications.foodReadyOrders.map(o => `Table #${o.table_number}`).join(', ')}. Please pick up and serve to guests.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              background: '#FFF',
              color: '#065F46',
              fontWeight: '800',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Go to Serve ➔
          </button>
        </div>
      )}

      {notifications.billReadyCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #7E22CE 0%, #6B21A8 100%)',
          color: '#FFF',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 16px rgba(126, 34, 206, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.25)', padding: '8px', borderRadius: '50%' }}>
              <Receipt size={24} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '0.3px' }}>
                🧾 BILL READY ALERT: {notifications.billReadyCount} Customer Bill(s) Calculated by Cashier!
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Bills finalized for:{' '}
                {notifications.billReadyOrders.map(o => `Table #${o.table_number} (₹${o.total})`).join(', ')}. Hand receipt to guests.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              background: '#FFF',
              color: '#6B21A8',
              fontWeight: '800',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            View Bills ➔
          </button>
        </div>
      )}

      {/* Main Sub-Navigation Tabs */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('tables')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'tables' ? '#7E22CE' : 'transparent',
              color: activeTab === 'tables' ? '#FFF' : '#475569',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <Users size={18} />
            <span>1. Table Seating Map</span>
            <span style={{
              background: activeTab === 'tables' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
              padding: '1px 8px',
              borderRadius: '999px',
              fontSize: '11px'
            }}>
              {tables.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('order')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'order' ? '#7E22CE' : 'transparent',
              color: activeTab === 'order' ? '#FFF' : '#475569',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <UtensilsCrossed size={18} />
            <span>2. Menu & Take Order</span>
            {cartItems.length > 0 && (
              <span style={{
                background: '#EF4444',
                color: '#FFF',
                padding: '1px 8px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: '900'
              }}>
                {cartItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'orders' ? '#7E22CE' : 'transparent',
              color: activeTab === 'orders' ? '#FFF' : '#475569',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <Receipt size={18} />
            <span>3. Order Status & Bills</span>
            <span style={{
              background: activeTab === 'orders' ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
              padding: '1px 8px',
              borderRadius: '999px',
              fontSize: '11px'
            }}>
              {activeOrders.length}
            </span>
          </button>
        </div>

        <button
          onClick={refreshAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} />
          <span>Sync Status</span>
        </button>
      </div>

      {feedback.message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: '600',
          background: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          color: feedback.type === 'success' ? '#15803D' : '#B91C1C',
          border: feedback.type === 'success' ? '1px solid #86EFAC' : '1px solid #FCA5A5'
        }}>
          {feedback.message}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: TABLE SITTING & STATUS MAP WITH ROOMS & CHAIRS    */}
      {/* ======================================================== */}
      {activeTab === 'tables' && (() => {
        const currentRoomId = selectedRoomId || (rooms[0]?.id || null);
        const currentRoom = rooms.find(r => r.id === currentRoomId) || rooms[0] || null;
        const roomTables = tables.filter(t => !currentRoomId || t.room_id === currentRoomId);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Step 1: Room / Floor Selector Option */}
            <div style={{
              background: '#FFF',
              borderRadius: '16px',
              padding: '16px 20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#7E22CE" />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A', display: 'block' }}>
                    SELECT DINING ROOM / FLOOR
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Choose a room to view its 10 tables and 4 chairs per table
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flexWrap: 'wrap' }}>
                {rooms.map(room => {
                  const isSelected = room.id === currentRoomId;
                  const roomTbls = tables.filter(t => t.room_id === room.id);
                  const availCount = roomTbls.filter(t => t.status === 'Available').length;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #7E22CE' : '1px solid #CBD5E1',
                        background: isSelected ? 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)' : '#FFF',
                        color: isSelected ? '#6B21A8' : '#334155',
                        fontSize: '13px',
                        fontWeight: isSelected ? '800' : '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 8px rgba(126, 34, 206, 0.2)' : 'none'
                      }}
                    >
                      <span>🏢 {room.name}</span>
                      <span style={{
                        background: isSelected ? '#7E22CE' : '#F1F5F9',
                        color: isSelected ? '#FFF' : '#475569',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}>
                        {roomTbls.length || 10} Tables • {availCount} Free
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Legend Bar */}
            <div style={{
              background: '#FFF',
              borderRadius: '14px',
              padding: '12px 18px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: '800', color: '#0F172A' }}>{currentRoom?.name || 'Selected Room'}:</span>
                <span>{roomTables.length} Tables • {roomTables.reduce((a, b) => a + (b.capacity || 4), 0)} Chairs</span>
              </span>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16A34A' }}></span>
                  Available (Clean)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D97706' }}></span>
                  Seated (Browsing)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563EB' }}></span>
                  Order Placed
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7E22CE' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7E22CE' }}></span>
                  Bill Ready
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }}></span>
                  Food Ready
                </span>
              </div>
            </div>

            {/* Tables Grid for Current Room */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '18px'
            }}>
              {roomTables.map(tbl => {
                const isAvailable = tbl.status === 'Available';
                const isSeated = tbl.status === 'Seated';
                const isOrderPlaced = tbl.status === 'Order Placed';
                const isBillReady = tbl.status === 'Bill Ready';
                const isFoodReady = tbl.status === 'Food Ready';
                const isServed = tbl.status === 'Served';

                let borderColor = '#E2E8F0';
                let badgeBg = '#F1F5F9';
                let badgeColor = '#475569';

                if (isAvailable) {
                  borderColor = '#86EFAC';
                  badgeBg = '#DCFCE7';
                  badgeColor = '#15803D';
                } else if (isSeated) {
                  borderColor = '#FDE68A';
                  badgeBg = '#FEF3C7';
                  badgeColor = '#B45309';
                } else if (isOrderPlaced) {
                  borderColor = '#BFDBFE';
                  badgeBg = '#EFF6FF';
                  badgeColor = '#1D4ED8';
                } else if (isBillReady) {
                  borderColor = '#E9D5FF';
                  badgeBg = '#F3E8FF';
                  badgeColor = '#7E22CE';
                } else if (isFoodReady) {
                  borderColor = '#10B981';
                  badgeBg = '#D1FAE5';
                  badgeColor = '#065F46';
                } else if (isServed) {
                  borderColor = '#99F6E4';
                  badgeBg = '#CCFBF1';
                  badgeColor = '#0F766E';
                }

                return (
                  <div
                    key={tbl.id}
                    style={{
                      background: '#FFF',
                      borderRadius: '16px',
                      border: `2px solid ${borderColor}`,
                      padding: '18px',
                      boxShadow: isFoodReady ? '0 4px 18px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            background: '#0F172A',
                            color: '#FFF',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '900'
                          }}>
                            TABLE #{tbl.table_number}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>
                            {tbl.capacity} Chairs
                          </span>
                        </div>

                        <span style={{
                          background: badgeBg,
                          color: badgeColor,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '800'
                        }}>
                          {tbl.status}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div style={{
                        background: '#F8FAFC',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '12px',
                        minHeight: '52px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '3px'
                      }}>
                        {isAvailable ? (
                          <div style={{ color: '#16A34A', fontWeight: '700', textAlign: 'center' }}>
                            ✨ Table is clean & 4 chairs ready for guests
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748B' }}>Guest:</span>
                              <span style={{ fontWeight: '800', color: '#0F172A' }}>{tbl.customer_name || 'Walk-in'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                              <span>Party Size:</span>
                              <span style={{ fontWeight: '700', color: '#0F172A' }}>{tbl.guests_count || 1} Guests</span>
                            </div>
                            {tbl.seated_elapsed_minutes !== null && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8', fontSize: '11px' }}>
                                <Clock size={11} />
                                <span>Seated {tbl.seated_elapsed_minutes} mins ago</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Visual Realistic 4-Chairs Seating Map */}
                      <div style={{
                        marginTop: '10px',
                        background: '#F1F5F9',
                        borderRadius: '12px',
                        padding: '10px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '800', color: '#64748B' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Armchair size={13} color="#7E22CE" />
                            <span>CHAIR SEATING BASES ({tbl.capacity} CHAIRS):</span>
                          </span>
                          <span style={{ fontSize: '10px', color: '#7E22CE' }}>Click chair to order</span>
                        </div>

                        {/* Interactive Chairs Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${Math.min(4, tbl.capacity || 4)}, 1fr)`,
                          gap: '6px'
                        }}>
                          {Array.from({ length: tbl.capacity || 4 }, (_, idx) => {
                            const cNum = idx + 1;
                            const cItems = (tbl.active_items || []).filter(i => i.chair_number === cNum);
                            const hasOrder = cItems.length > 0;

                            return (
                              <button
                                key={cNum}
                                type="button"
                                onClick={() => handleStartOrderForTable(tbl, cNum)}
                                title={hasOrder 
                                  ? `Chair #${cNum}: ${cItems.map(i => `${i.quantity}x ${i.item_name}`).join(', ')}`
                                  : `Click to Take Order for Chair #${cNum}`}
                                style={{
                                  padding: '6px 4px',
                                  borderRadius: '8px',
                                  border: hasOrder ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                                  background: hasOrder ? '#EFF6FF' : '#FFF',
                                  color: hasOrder ? '#1D4ED8' : '#334155',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <Armchair size={14} color={hasOrder ? '#2563EB' : '#64748B'} />
                                <span style={{ fontSize: '10px', fontWeight: '800', marginTop: '2px' }}>
                                  Chair {cNum}
                                </span>
                                {hasOrder ? (
                                  <span style={{ fontSize: '9px', background: '#2563EB', color: '#FFF', padding: '0 4px', borderRadius: '4px', fontWeight: '800', marginTop: '1px' }}>
                                    {cItems.reduce((acc, ci) => acc + ci.quantity, 0)} dishes
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '9px', color: '#94A3B8' }}>Ready</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Table Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {isAvailable && (
                        <button
                          onClick={() => handleOpenSeatModal(tbl)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            background: '#16A34A',
                            color: '#FFF',
                            fontWeight: '800',
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Users size={16} />
                          <span>Seat Customer at Table #{tbl.table_number}</span>
                        </button>
                      )}

                      {(isSeated || isAvailable) && (
                        <button
                          onClick={() => handleStartOrderForTable(tbl, 1)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            background: '#7E22CE',
                            color: '#FFF',
                            fontWeight: '800',
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <UtensilsCrossed size={16} />
                          <span>Take Order (Chair-by-Chair)</span>
                        </button>
                      )}

                      {isOrderPlaced && (
                        <div style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          fontSize: '12px',
                          fontWeight: '700',
                          textAlign: 'center'
                        }}>
                          ⏳ Order Sent to Cashier for Billing Calculation...
                        </div>
                      )}

                      {isBillReady && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleViewReceipt(tbl.current_order_id)}
                            style={{
                              flex: 1,
                              padding: '9px',
                              borderRadius: '8px',
                              background: '#7E22CE',
                              color: '#FFF',
                              fontWeight: '800',
                              fontSize: '12px',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <Printer size={14} />
                            <span>View & Print Bill</span>
                          </button>
                          <button
                            onClick={() => handleMarkBillDelivered(tbl.current_order_id)}
                            title="Mark receipt handed to customer"
                            style={{
                              padding: '9px 12px',
                              borderRadius: '8px',
                              background: '#F3E8FF',
                              color: '#6B21A8',
                              fontWeight: '800',
                              fontSize: '12px',
                              border: '1px solid #D8B4FE',
                              cursor: 'pointer'
                            }}
                          >
                            Handed
                          </button>
                        </div>
                      )}

                      {isFoodReady && (
                        <button
                          onClick={() => handleMarkServed(tbl.current_order_id, tbl.table_number)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            background: '#059669',
                            color: '#FFF',
                            fontWeight: '900',
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                          }}
                        >
                          <CheckCircle2 size={16} />
                          <span>Food Ready! Serve to Chairs</span>
                        </button>
                      )}

                      {!isAvailable && (
                        <button
                          onClick={() => handleClearTable(tbl.table_number)}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            color: '#475569',
                            fontWeight: '700',
                            fontSize: '11px',
                            border: '1px solid #E2E8F0',
                            cursor: 'pointer'
                          }}
                        >
                          Clear / Free Table
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* TAB 2: MENU & ORDER TAKING (DISHES & CART)               */}
      {/* ======================================================== */}
      {activeTab === 'order' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', alignItems: 'start' }}>
          
          {/* Left: Dishes Catalog */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Step Selection Stepper: Room/Floor ➔ Table ➔ Chair ➔ Order */}
            <div style={{
              background: '#FFF',
              borderRadius: '16px',
              padding: '16px 20px',
              border: '1.5px solid #7E22CE',
              boxShadow: '0 4px 16px rgba(126, 34, 206, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#7E22CE', color: '#FFF', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '900' }}>
                    SELECTION FLOW
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                    Room/Floor ➔ Table ➔ Chair ➔ Take Order
                  </span>
                </div>

                <div style={{ fontSize: '12px', fontWeight: '700', color: '#7E22CE', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Currently Adding Dishes For:</span>
                  <span style={{ background: '#F3E8FF', color: '#6B21A8', padding: '3px 10px', borderRadius: '12px', border: '1px solid #D8B4FE', fontWeight: '800' }}>
                    🪑 {selectedChair === 0 ? 'Shared / Whole Table' : `Chair #${selectedChair}`}
                  </span>
                </div>
              </div>

              {/* 3-Step Selection Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'center' }}>
                {/* 1. Room/Floor */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '4px' }}>
                    1. ROOM / FLOOR
                  </label>
                  <select
                    value={selectedRoomId || (rooms[0]?.id || '')}
                    onChange={(e) => {
                      const rId = parseInt(e.target.value, 10);
                      setSelectedRoomId(rId);
                      const roomTbls = tables.filter(t => t.room_id === rId);
                      if (roomTbls.length > 0) {
                        setSelectedTableNum(roomTbls[0].table_number);
                        setOrderCustomerName(roomTbls[0].customer_name || '');
                        setOrderCustomerPhone(roomTbls[0].customer_phone || '');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#0F172A'
                    }}
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        🏢 {r.name} (F{r.floor_number})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Table */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '4px' }}>
                    2. TABLE
                  </label>
                  <select
                    value={selectedTableNum}
                    onChange={(e) => {
                      const num = parseInt(e.target.value, 10);
                      setSelectedTableNum(num);
                      const tbl = tables.find(t => t.table_number === num);
                      if (tbl && tbl.customer_name) setOrderCustomerName(tbl.customer_name);
                      if (tbl && tbl.customer_phone) setOrderCustomerPhone(tbl.customer_phone);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#0F172A'
                    }}
                  >
                    {tables
                      .filter(t => !selectedRoomId || t.room_id === selectedRoomId)
                      .map(t => (
                        <option key={t.id} value={t.table_number}>
                          Table #{t.table_number} ({t.status} - {t.capacity} Chairs) {t.customer_name ? `[${t.customer_name}]` : ''}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 3. Chair Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '4px' }}>
                    3. SELECT CHAIR (SEAT)
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {Array.from({ length: (tables.find(t => t.table_number === selectedTableNum)?.capacity || 4) }, (_, idx) => {
                      const cNum = idx + 1;
                      const isSelected = selectedChair === cNum;
                      return (
                        <button
                          key={cNum}
                          type="button"
                          onClick={() => setSelectedChair(cNum)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid #7E22CE' : '1px solid #CBD5E1',
                            background: isSelected ? '#7E22CE' : '#FFF',
                            color: isSelected ? '#FFF' : '#334155',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Armchair size={12} />
                          <span>C{cNum}</span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setSelectedChair(0)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: selectedChair === 0 ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                        background: selectedChair === 0 ? '#2563EB' : '#FFF',
                        color: selectedChair === 0 ? '#FFF' : '#334155',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Shared
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Search & Category Pills */}
            <div style={{
              background: '#FFF',
              borderRadius: '16px',
              padding: '18px 20px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search dishes by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Categories */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: selectedCategory === 'All' ? '1px solid #7E22CE' : '1px solid #E2E8F0',
                    background: selectedCategory === 'All' ? '#7E22CE' : '#F8FAFC',
                    color: selectedCategory === 'All' ? '#FFF' : '#475569',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  All Items
                </button>
                {categories.map(c => {
                  const isSel = selectedCategory === c.name;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.name)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        border: isSel ? '1px solid #7E22CE' : '1px solid #E2E8F0',
                        background: isSel ? '#7E22CE' : '#F8FAFC',
                        color: isSel ? '#FFF' : '#475569',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '14px'
            }}>
              {filteredMenuItems.map(dish => {
                const dishItemsInCart = cartItems.filter(i => i.id === dish.id);
                const totalDishQtyInCart = dishItemsInCart.reduce((sum, ci) => sum + ci.quantity, 0);
                const hasDiscount = dish.has_discount;

                return (
                  <div
                    key={dish.id}
                    style={{
                      background: '#FFF',
                      borderRadius: '16px',
                      border: totalDishQtyInCart > 0 ? '2px solid #7E22CE' : '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: totalDishQtyInCart > 0 ? '0 6px 20px rgba(126, 34, 206, 0.15)' : '0 2px 10px rgba(0,0,0,0.04)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {/* Top Dish Image Banner */}
                    <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden' }}>
                      <DishImage
                        src={dish.image_url}
                        alt={dish.name}
                        category={dish.category_name}
                        price={dish.final_price || dish.price}
                        discount_pct={dish.discount_pct}
                        description={dish.description}
                        size="menu-card"
                        style={{ height: '100%', borderRadius: '15px 15px 0 0' }}
                      />
                      {/* Gradient overlay for contrast */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.2) 100%)',
                        pointerEvents: 'none'
                      }} />

                      {/* Category Badge on image */}
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: '#FFF',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase'
                      }}>
                        {dish.category_name}
                      </div>

                      {/* Discount Badge on image */}
                      {hasDiscount && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#EF4444',
                          color: '#FFF',
                          fontSize: '11px',
                          fontWeight: '900',
                          padding: '4px 9px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 10px rgba(239, 68, 68, 0.5)'
                        }}>
                          <Tag size={11} />
                          <span>{parseFloat(dish.discount_percent).toFixed(0)}% OFF</span>
                        </div>
                      )}
                    </div>

                    {/* Dish Info & Content */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '14px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                          {dish.name}
                        </h4>
                        {dish.description && (
                          <p style={{ fontSize: '12px', color: '#64748B', margin: '0', lineHeight: '1.45' }}>
                            {dish.description}
                          </p>
                        )}
                      </div>

                      <div>
                        {/* Price Display */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                          {hasDiscount ? (
                            <>
                              <span style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A' }}>
                                ₹{dish.discounted_price.toFixed(2)}
                              </span>
                              <span style={{ fontSize: '13px', color: '#94A3B8', textDecoration: 'line-through' }}>
                                ₹{dish.price.toFixed(2)}
                              </span>
                              <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '800', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                                Save ₹{dish.discount_amount.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A' }}>
                              ₹{dish.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Add to Order Button with Active Chair Target */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(dish)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #7E22CE 0%, #6B21A8 100%)',
                              border: 'none',
                              color: '#FFF',
                              fontWeight: '800',
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(126, 34, 206, 0.25)'
                            }}
                          >
                            <Plus size={15} />
                            <span>+ Add to {selectedChair === 0 ? 'Shared' : `Chair ${selectedChair}`}</span>
                          </button>
                          {totalDishQtyInCart > 0 && (
                            <div style={{
                              textAlign: 'center',
                              fontSize: '11px',
                              fontWeight: '800',
                              color: '#6B21A8',
                              background: '#F3E8FF',
                              border: '1px solid #D8B4FE',
                              borderRadius: '6px',
                              padding: '4px 8px'
                            }}>
                              ✓ {totalDishQtyInCart} in tray ({dishItemsInCart.map(i => `${i.quantity}x ${i.chair_label}`).join(', ')})
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Order Cart & Submission Tray */}
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            border: '2px solid #7E22CE',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(126, 34, 206, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'sticky',
            top: '80px'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  Customer Order Tray
                </h3>
                <span style={{
                  background: '#F3E8FF',
                  color: '#6B21A8',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {cartItems.length} Dishes
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                Order will be transmitted to Cashier for bill calculation.
              </p>
            </div>

            {/* Current Room & Table Context Banner */}
            {(() => {
              const currentRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];
              const currentTbl = tables.find(t => t.table_number === selectedTableNum);
              return (
                <div style={{
                  background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
                  border: '1.5px solid #D8B4FE',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={16} color="#7E22CE" />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#6B21A8' }}>
                      {currentRoom?.name || 'Dining Room'}
                    </span>
                  </div>
                  <span style={{
                    background: '#7E22CE',
                    color: '#FFF',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '900'
                  }}>
                    Table #{selectedTableNum} ({currentTbl?.capacity || 4} Chairs)
                  </span>
                </div>
              );
            })()}

            {/* Target Table Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                ASSIGN TO TABLE
              </label>
              <select
                value={selectedTableNum}
                onChange={(e) => {
                  const num = parseInt(e.target.value, 10);
                  setSelectedTableNum(num);
                  const tbl = tables.find(t => t.table_number === num);
                  if (tbl && tbl.room_id) setSelectedRoomId(tbl.room_id);
                  if (tbl && tbl.customer_name) setOrderCustomerName(tbl.customer_name);
                  if (tbl && tbl.customer_phone) setOrderCustomerPhone(tbl.customer_phone);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#0F172A'
                }}
              >
                {tables.map(t => (
                  <option key={t.id} value={t.table_number}>
                    {t.room_name ? `${t.room_name} • ` : ''}Table #{t.table_number} ({t.status} - {t.capacity} Seats) {t.customer_name ? `[${t.customer_name}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Guest Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  CUSTOMER NAME
                </label>
                <input
                  type="text"
                  placeholder="Guest Name"
                  value={orderCustomerName}
                  onChange={(e) => setOrderCustomerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  PHONE (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="Mobile #"
                  value={orderCustomerPhone}
                  onChange={(e) => setOrderCustomerPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>

            {/* Cart Items List with Chair Labels & Stepper */}
            <div style={{
              maxHeight: '230px',
              overflowY: 'auto',
              border: '1px solid #F1F5F9',
              borderRadius: '10px',
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94A3B8', fontSize: '12px' }}>
                  No dishes added yet. Click &quot;+ Add to Chair&quot; on any dish.
                </div>
              ) : (
                cartItems.map(item => (
                  <div
                    key={item.cartKey || `${item.id}-${item.chair_number}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <DishImage
                          src={item.image_url}
                          alt={item.name}
                          category={item.category_name}
                          price={item.price}
                          discount_pct={item.discount_pct}
                          description={item.description}
                          size="sm"
                          style={{
                            width: '32px',
                            height: '32px',
                            minWidth: '32px',
                            minHeight: '32px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1'
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            ₹{item.discounted_price.toFixed(2)} each
                            {item.discount_percent > 0 && (
                              <span style={{ color: '#16A34A', marginLeft: '4px', fontWeight: '700' }}>
                                (-{parseFloat(item.discount_percent).toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: '900', color: '#0F172A', fontSize: '13px' }}>
                        ₹{(item.discounted_price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Chair badge + Reassign Chair dropdown + Qty Stepper + Trash */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #CBD5E1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          background: item.chair_number === 0 ? '#EFF6FF' : '#F3E8FF',
                          color: item.chair_number === 0 ? '#1D4ED8' : '#6B21A8',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '800'
                        }}>
                          🪑 {item.chair_label}
                        </span>

                        <select
                          value={item.chair_number}
                          onChange={(e) => handleItemChairChange(item.cartKey, e.target.value)}
                          title="Reassign dish to another chair"
                          style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            border: '1px solid #CBD5E1',
                            background: '#FFF',
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          {Array.from({ length: (tables.find(t => t.table_number === selectedTableNum)?.capacity || 4) }, (_, idx) => {
                            const cn = idx + 1;
                            return <option key={cn} value={cn}>Chair {cn}</option>;
                          })}
                          <option value={0}>Shared</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#FFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '1px 4px' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(item.cartKey, -1)}
                            style={{ background: 'transparent', border: 'none', color: '#7E22CE', cursor: 'pointer', padding: '2px', display: 'flex' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '12px', fontWeight: '800', minWidth: '16px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(item.cartKey, 1)}
                            style={{ background: 'transparent', border: 'none', color: '#7E22CE', cursor: 'pointer', padding: '2px', display: 'flex' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.cartKey)}
                          title="Remove item"
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px', display: 'flex' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Special Instructions / Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                SPECIAL COOKING NOTES
              </label>
              <input
                type="text"
                placeholder="e.g. Less spicy, extra butter, no onion..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Financial Summary */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#475569' }}>
                <span>Subtotal:</span>
                <span>₹{cartSubtotal.toFixed(2)}</span>
              </div>
              {cartSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#16A34A', fontWeight: '700' }}>
                  <span>Dish Discounts:</span>
                  <span>-₹{cartSavings.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#475569' }}>
                <span>Estimated GST (5%):</span>
                <span>₹{cartTax.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px solid #CBD5E1',
                fontSize: '15px',
                fontWeight: '900',
                color: '#0F172A'
              }}>
                <span>Est. Total:</span>
                <span style={{ color: '#7E22CE' }}>₹{cartEstimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Big Action Button */}
            <button
              type="button"
              disabled={loading || cartItems.length === 0}
              onClick={handleSubmitOrderToCashier}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: cartItems.length === 0 ? '#94A3B8' : 'linear-gradient(135deg, #7E22CE 0%, #6B21A8 100%)',
                color: '#FFF',
                fontWeight: '900',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: cartItems.length === 0 || loading ? 'not-allowed' : 'pointer',
                border: 'none',
                boxShadow: '0 4px 14px rgba(126, 34, 206, 0.3)'
              }}
            >
              <Send size={16} />
              <span>{loading ? 'Submitting...' : 'Submit Order to Cashier'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ACTIVE ORDERS & WORKFLOW TRACKER                  */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{
            background: '#FFF',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Live Table Orders & Service Progression
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                Track each order across Cashier billing, Kitchen preparation, and Floor serving.
              </p>
            </div>
          </div>

          {activeOrders.length === 0 ? (
            <div style={{
              background: '#FFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '60px 20px',
              textAlign: 'center',
              color: '#94A3B8'
            }}>
              <UtensilsCrossed size={44} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#334155' }}>
                No Active Orders Today
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                Orders placed from the Table Map or Menu will appear here in real time.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeOrders.map(ord => {
                const isPendingCashier = ord.order_status === 'Pending_Cashier';
                const isBilled = ord.order_status === 'Completed' || ord.order_status === 'Billed';
                const isCooking = ord.kitchen_status === 'Preparing';
                const isFoodReady = ord.kitchen_status === 'Ready' && !ord.food_served_to_table;
                const isServed = Boolean(ord.food_served_to_table);

                return (
                  <div
                    key={ord.id}
                    style={{
                      background: '#FFF',
                      borderRadius: '16px',
                      border: isFoodReady ? '2px solid #10B981' : '1px solid #E2E8F0',
                      padding: '20px',
                      boxShadow: isFoodReady ? '0 4px 18px rgba(16, 185, 129, 0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                          background: '#0F172A',
                          color: '#FFF',
                          padding: '5px 14px',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: '900'
                        }}>
                          TABLE #{ord.table_number}
                        </span>
                        {ord.room_name && (
                          <span style={{
                            background: '#F1F5F9',
                            color: '#475569',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            🏢 {ord.room_name}
                          </span>
                        )}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                            {ord.customer_name || 'Dine-in Guest'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            Bill #{ord.bill_number} • Placed {new Date(ord.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>
                          ₹{parseFloat(ord.total).toFixed(2)}
                        </span>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          background: ord.payment_status === 'Paid' ? '#DCFCE7' : '#FEF3C7',
                          color: ord.payment_status === 'Paid' ? '#15803D' : '#B45309'
                        }}>
                          {ord.payment_status?.toUpperCase()} ({ord.payment_method || 'Unpaid'})
                        </span>
                      </div>
                    </div>

                    {/* Stepper Progress Bar */}
                    <div style={{
                      background: '#F8FAFC',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px',
                      textAlign: 'center'
                    }}>
                      {/* Step 1: Order Sent */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: '#10B981',
                          color: '#FFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '900'
                        }}>
                          ✓
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F172A' }}>1. Order Sent</span>
                        <span style={{ fontSize: '10px', color: '#64748B' }}>Waiter Submitted</span>
                      </div>

                      {/* Step 2: Cashier Billed */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: isBilled ? '#10B981' : '#E2E8F0',
                          color: isBilled ? '#FFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '900'
                        }}>
                          {isBilled ? '✓' : '2'}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: isBilled ? '#0F172A' : '#94A3B8' }}>2. Cashier Billed</span>
                        <span style={{ fontSize: '10px', color: isBilled ? '#15803D' : '#94A3B8' }}>
                          {isBilled ? 'Bill Calculated' : 'Calculating...'}
                        </span>
                      </div>

                      {/* Step 3: Kitchen Cooking */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: (isCooking || isFoodReady || isServed) ? '#10B981' : '#E2E8F0',
                          color: (isCooking || isFoodReady || isServed) ? '#FFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '900'
                        }}>
                          {(isCooking || isFoodReady || isServed) ? '✓' : '3'}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: (isCooking || isFoodReady || isServed) ? '#0F172A' : '#94A3B8' }}>
                          3. Kitchen Cooking
                        </span>
                        <span style={{ fontSize: '10px', color: isCooking ? '#D97706' : (isFoodReady || isServed) ? '#15803D' : '#94A3B8' }}>
                          {isCooking ? 'In Progress' : (isFoodReady || isServed) ? 'Finished' : 'Queued'}
                        </span>
                      </div>

                      {/* Step 4: Food Ready & Served */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: isServed ? '#10B981' : isFoodReady ? '#F59E0B' : '#E2E8F0',
                          color: (isServed || isFoodReady) ? '#FFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '900'
                        }}>
                          {isServed ? '✓' : '4'}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: (isFoodReady || isServed) ? '#0F172A' : '#94A3B8' }}>
                          4. Serve to Table
                        </span>
                        <span style={{ fontSize: '10px', color: isServed ? '#059669' : isFoodReady ? '#D97706' : '#94A3B8', fontWeight: '700' }}>
                          {isServed ? 'Served / Dining' : isFoodReady ? 'READY TO PICK UP!' : 'Waiting Food'}
                        </span>
                      </div>
                    </div>

                    {/* Items Breakdown with Visual Dish Badges */}
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '6px', letterSpacing: '0.4px' }}>
                        DISHES IN ORDER ({ord.items?.length || 0}):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        {ord.items?.map((i, itmIdx) => (
                          <div
                            key={itmIdx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              padding: '4px 8px 4px 5px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}
                          >
                            <DishImage
                              src={i.image_url}
                              alt={i.item_name}
                              price={i.price}
                              size="sm"
                              style={{ width: '26px', height: '26px', minWidth: '26px', minHeight: '26px', borderRadius: '6px' }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>
                                {i.quantity}× {i.item_name}
                              </span>
                              {i.chair_label && (
                                <span style={{
                                  background: i.chair_number === 0 ? '#EFF6FF' : '#F3E8FF',
                                  color: i.chair_number === 0 ? '#1D4ED8' : '#7E22CE',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '800'
                                }}>
                                  🪑 {i.chair_label}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Action Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      {isBilled && (
                        <button
                          type="button"
                          onClick={() => handleViewReceipt(ord.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: '#F3E8FF',
                            color: '#7E22CE',
                            border: '1px solid #D8B4FE',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          <Printer size={14} />
                          <span>View & Print Customer Bill</span>
                        </button>
                      )}

                      {isFoodReady && (
                        <button
                          type="button"
                          onClick={() => handleMarkServed(ord.id, ord.table_number)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: '#059669',
                            color: '#FFF',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                          }}
                        >
                          <CheckCircle2 size={16} />
                          <span>Food Picked Up & Served!</span>
                        </button>
                      )}

                      {isServed && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#059669',
                          fontWeight: '800',
                          fontSize: '13px'
                        }}>
                          <Check size={16} />
                          <span>Dishes Served Successfully</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SEATING MODAL                                            */}
      {/* ======================================================== */}
      {showSeatModal && selectedTableForSeat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>
                  Seat Customer at Table #{selectedTableForSeat.table_number}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  Capacity: {selectedTableForSeat.capacity} Seats
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSeatModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmSeat} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  GUEST / CUSTOMER NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={seatForm.customer_name}
                  onChange={(e) => setSeatForm({ ...seatForm, customer_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  PHONE NUMBER (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="10-digit mobile number"
                  value={seatForm.customer_phone}
                  onChange={(e) => setSeatForm({ ...seatForm, customer_phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  NUMBER OF GUESTS (SEATS)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={seatForm.guests_count}
                  onChange={(e) => setSeatForm({ ...seatForm, guests_count: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowSeatModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#16A34A',
                    border: 'none',
                    color: '#FFF',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Seating...' : 'Confirm Seating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* THERMAL RECEIPT MODAL                                    */}
      {/* ======================================================== */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}

    </div>
  );
}
