import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Check, X, UtensilsCrossed, AlertCircle } from 'lucide-react';

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAvailable, setFormAvailable] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/menu/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        if (data.categories.length > 0 && !formCategory) {
          setFormCategory(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(categories[0]?.id || '');
    setFormPrice('');
    setFormDescription('');
    setFormAvailable(1);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category_id);
    setFormPrice(item.price);
    setFormDescription(item.description || '');
    setFormAvailable(item.available);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formName.trim()) {
      setErrorMsg('Item name is required.');
      return;
    }
    const numPrice = parseFloat(formPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg('Price must be greater than zero.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName.trim(),
          category_id: formCategory,
          price: numPrice,
          description: formDescription,
          available: formAvailable
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Operation failed.');
      }

      setShowModal(false);
      fetchItems();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      fetchItems();
    } catch (err) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/menu/${item.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(it => {
    const matchesCat = selectedCat === 'All' || it.category_name === selectedCat;
    const matchesSearch = it.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      {/* Top Header */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
            Menu Catalog Management
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            Add, update prices, manage food categories, and control live dish availability
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Filter menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={handleOpenAdd}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#FFF',
              fontWeight: '700',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(115, 15, 25, 0.3)'
            }}
          >
            <Plus size={16} />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Menu Table */}
      <div style={{ background: '#FFF', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '700' }}>
              <th style={{ padding: '14px 18px' }}>Dish Name</th>
              <th style={{ padding: '14px 18px' }}>Category</th>
              <th style={{ padding: '14px 18px' }}>Price</th>
              <th style={{ padding: '14px 18px', textAlign: 'center' }}>In Stock</th>
              <th style={{ padding: '14px 18px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr
                key={item.id}
                style={{ borderBottom: '1px solid #F1F5F9' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFF'}
              >
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: '700', color: '#0F172A' }}>{item.name}</div>
                  {item.description && (
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{item.description}</div>
                  )}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{ background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: '600', fontSize: '11px' }}>
                    {item.category_name}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>
                  ₹{parseFloat(item.price).toFixed(2)}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: item.available ? '#ECFDF5' : '#FEE2E2',
                      color: item.available ? '#065F46' : '#991B1B',
                      border: `1px solid ${item.available ? '#A7F3D0' : '#FECACA'}`,
                      cursor: 'pointer'
                    }}
                  >
                    {item.available ? '✓ Available' : '✕ Out of Stock'}
                  </button>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit dish"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#1E40AF',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      title="Delete dish"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#FEE2E2',
                        color: '#991B1B',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
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
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>

            {errorMsg && (
              <div style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  ITEM NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Butter Chicken"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    CATEGORY *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#FFF' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    PRICE (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="250.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  DESCRIPTION
                </label>
                <textarea
                  rows="2"
                  placeholder="Brief description of dish..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  AVAILABILITY
                </label>
                <select
                  value={formAvailable}
                  onChange={(e) => setFormAvailable(parseInt(e.target.value, 10))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#FFF' }}
                >
                  <option value={1}>In Stock (Available)</option>
                  <option value={0}>Out of Stock (Unavailable)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary)', color: '#FFF', fontWeight: '700' }}
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
