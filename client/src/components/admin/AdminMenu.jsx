import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Layers, 
  AlertCircle,
  RefreshCw,
  X,
  ShoppingBag,
  DollarSign
} from 'lucide-react';

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  // Preview Mode
  const [previewMode, setPreviewMode] = useState(false);

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Item Form
  const [itemForm, setItemForm] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    available: 1,
    image_url: ''
  });

  // Category Form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchMenu();
  }, [selectedCategory, selectedAvailability]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/menu/categories?includeInactive=true');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        if (data.categories.length > 0 && !itemForm.category_id) {
          setItemForm(prev => ({ ...prev, category_id: data.categories[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMenu = async () => {
    setLoading(true);
    try {
      let url = '/api/menu?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedAvailability === 'available') url += 'availableOnly=true&';

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let list = data.items || [];
        if (selectedAvailability === 'unavailable') {
          list = list.filter(i => i.available === 0);
        }
        setItems(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMenu();
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setFeedback(null);
    const token = localStorage.getItem('token');
    const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemForm)
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: data.message });
        setShowItemModal(false);
        setEditingItem(null);
        fetchMenu();
      } else {
        setFeedback({ type: 'error', text: data.message || 'Operation failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network communication error.' });
    }
  };

  const handleToggleAvailable = async (item) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/menu/${item.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchMenu();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to remove or deactivate "${item.name}"?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      alert(data.message);
      fetchMenu();
    } catch (err) {
      alert('Error removing item.');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setFeedback(null);
    const token = localStorage.getItem('token');
    const url = editingCategory ? `/api/menu/categories/${editingCategory.id}` : '/api/menu/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: data.message });
        setShowCategoryModal(false);
        setEditingCategory(null);
        fetchCategories();
        fetchMenu();
      } else {
        setFeedback({ type: 'error', text: data.message || 'Operation failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network error.' });
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Deactivate or delete category "${cat.name}"?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/menu/categories/${cat.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      alert(data.message);
      fetchCategories();
      fetchMenu();
    } catch (err) {
      alert('Error.');
    }
  };

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Top Banner */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Section D & E • Culinary Inventory
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Menu & Category Management
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Configure offerings, pricing tiers, food availability, and cashier catalog presentation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: previewMode ? 'var(--primary)' : '#F1F5F9',
              color: previewMode ? '#FFF' : '#334155',
              border: '1px solid #CBD5E1',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Eye size={16} />
            <span>{previewMode ? 'Exit Cashier Preview' : 'Cashier POS Preview'}</span>
          </button>

          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ name: '', description: '', status: 'active' });
              setShowCategoryModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Layers size={16} /> Categories ({categories.length})
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setItemForm({
                name: '',
                category_id: categories[0]?.id || 1,
                price: '',
                description: '',
                available: 1,
                image_url: ''
              });
              setShowItemModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'var(--primary)',
              color: '#FFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(180, 83, 9, 0.25)'
            }}
          >
            <PlusCircle size={16} /> Add Food / Beverage
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '600',
          background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: feedback.type === 'success' ? '#065F46' : '#991B1B',
          border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`
        }}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '18px 24px',
        border: '1px solid #E2E8F0',
        marginBottom: '24px'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search items by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px'
              }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
          >
            <option value="All">All Statuses</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
          </select>

          <button
            type="submit"
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              background: '#0F172A',
              color: '#FFF',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Filter
          </button>
        </form>
      </div>

      {/* Cashier Preview Mode (Section 3.2.D Requirement) */}
      {previewMode ? (
        <div style={{
          background: '#F8FAFC',
          borderRadius: '16px',
          padding: '24px',
          border: '2px dashed var(--primary)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>
                👁️ Live Cashier Point-of-Sale Interface Preview
              </span>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                This is exactly how food and drink tiles appear on the Cashier's touch-enabled billing screen.
              </p>
            </div>
            <button
              onClick={() => setPreviewMode(false)}
              style={{ padding: '6px 12px', borderRadius: '6px', background: '#FFF', border: '1px solid #CBD5E1', fontSize: '12px', cursor: 'pointer' }}
            >
              Exit Preview
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {items.map(it => (
              <div
                key={it.id}
                style={{
                  background: '#FFF',
                  borderRadius: '12px',
                  padding: '14px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  opacity: it.available ? 1 : 0.5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#FEF3C7', color: '#92400E', fontWeight: '700' }}>
                      {it.category_name}
                    </span>
                    {!it.available && (
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#FEF2F2', color: '#DC2626', fontWeight: '800' }}>
                        Sold Out
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: '4px 0' }}>{it.name}</h4>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineClamp: 2 }}>{it.description || 'Fresh restaurant preparation'}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#059669' }}>₹{parseFloat(it.price).toFixed(2)}</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Tap to add</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Main Admin Menu Items Table */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
            Master Menu Catalog ({items.length} items)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Historical billing rule: Price changes preserve past bill records
          </span>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontSize: '14px' }}>
            No menu items found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B' }}>
                  <th style={{ padding: '10px' }}>Item Name</th>
                  <th style={{ padding: '10px' }}>Category</th>
                  <th style={{ padding: '10px' }}>Description</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Price (₹)</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Availability</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '700', color: '#0F172A' }}>
                      {it.name}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: '#FEF3C7',
                        color: '#92400E'
                      }}>
                        {it.category_name}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748B', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.description || '—'}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', color: '#059669', fontSize: '14px' }}>
                      ₹{parseFloat(it.price).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleAvailable(it)}
                        style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '700',
                          border: 'none',
                          background: it.available ? '#ECFDF5' : '#FEF2F2',
                          color: it.available ? '#059669' : '#DC2626',
                          cursor: 'pointer'
                        }}
                      >
                        {it.available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setEditingItem(it);
                            setItemForm({
                              name: it.name,
                              category_id: it.category_id,
                              price: it.price,
                              description: it.description || '',
                              available: it.available,
                              image_url: it.image_url || ''
                            });
                            setShowItemModal(true);
                          }}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(it)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                          title="Deactivate or Remove"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD/EDIT ITEM MODAL */}
      {showItemModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button onClick={() => setShowItemModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Tikka"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Category</label>
                  <select
                    value={itemForm.category_id}
                    onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 250.00"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows="2"
                  placeholder="Ingredients or food description..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={itemForm.image_url}
                  onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="item_available"
                  checked={Boolean(itemForm.available)}
                  onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked ? 1 : 0 })}
                />
                <label htmlFor="item_available" style={{ fontSize: '12px', color: '#334155', fontWeight: '600' }}>
                  Item is available for ordering immediately
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', background: 'var(--primary)', color: '#FFF', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORIES MANAGEMENT MODAL */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--primary)" /> Manage Menu Categories
              </h3>
              <button onClick={() => setShowCategoryModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            {/* Category Creation Form */}
            <form onSubmit={handleSaveCategory} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: '0 0 10px 0' }}>
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
              </h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Italian Delights)"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
                <select
                  value={categoryForm.status}
                  onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFF' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Description (optional)"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ name: '', description: '', status: 'active' });
                    }}
                    style={{ padding: '6px 12px', borderRadius: '6px', background: '#E2E8F0', border: 'none', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  style={{ padding: '6px 16px', borderRadius: '6px', background: 'var(--primary)', color: '#FFF', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>

            {/* List of Existing Categories */}
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '10px' }}>Existing Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: '#FFF', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>{c.name}</span>
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: c.status === 'active' ? '#ECFDF5' : '#FEF2F2', color: c.status === 'active' ? '#059669' : '#DC2626', fontWeight: '700' }}>
                        {c.status || 'active'}
                      </span>
                    </div>
                    {c.description && <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{c.description}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setCategoryForm({ name: c.name, description: c.description || '', status: c.status || 'active' });
                      }}
                      style={{ padding: '4px 8px', borderRadius: '4px', background: '#F1F5F9', border: '1px solid #CBD5E1', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c)}
                      style={{ padding: '4px 8px', borderRadius: '4px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '11px', cursor: 'pointer' }}
                      title="Deactivate or Remove"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
