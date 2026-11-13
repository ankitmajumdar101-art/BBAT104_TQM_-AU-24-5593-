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
  Tag,
  DollarSign,
  Percent,
  Sparkles,
  ShoppingBag,
  Image as ImageIcon
} from 'lucide-react';
import DishImage, { PRESET_DISH_IMAGES } from '../common/DishImage';

export default function OwnerMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [filterDiscountsOnly, setFilterDiscountsOnly] = useState(false);

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState(null);
  const [quickDiscountPercent, setQuickDiscountPercent] = useState(0);

  // Item Form
  const [itemForm, setItemForm] = useState({
    name: '',
    category_id: '',
    price: '',
    discount_percent: 0,
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
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedAvailability === 'available') params.append('availableOnly', 'true');

      const res = await fetch(`/api/menu?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open Add Item Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      price: '',
      discount_percent: 0,
      description: '',
      available: 1,
      image_url: ''
    });
    setShowItemModal(true);
  };

  // Open Edit Item Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category_id: item.category_id,
      price: item.price,
      discount_percent: parseFloat(item.discount_percent || 0),
      description: item.description || '',
      available: item.available ? 1 : 0,
      image_url: item.image_url || ''
    });
    setShowItemModal(true);
  };

  // Open Quick Discount / Offer Modal
  const handleOpenDiscountModal = (item) => {
    setSelectedItemForDiscount(item);
    setQuickDiscountPercent(parseFloat(item.discount_percent || 0));
    setShowDiscountModal(true);
  };

  // Save Item (Add or Edit)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const isEdit = !!editingItem;
    const url = isEdit ? `/api/menu/${editingItem.id}` : '/api/menu';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemForm)
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        setShowItemModal(false);
        fetchMenu();
      } else {
        setFeedback({ type: 'error', message: data.message || 'Operation failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error saving menu item.' });
    }
  };

  // Save Quick Discount / Offer
  const handleSaveDiscount = async (discountPercentValue) => {
    if (!selectedItemForDiscount) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/menu/${selectedItemForDiscount.id}/discount`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ discount_percent: discountPercentValue })
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        setShowDiscountModal(false);
        fetchMenu();
      } else {
        setFeedback({ type: 'error', message: data.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update discount.' });
    }
  };

  // Remove / Delete Item
  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to remove "${item.name}" from the restaurant menu?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        fetchMenu();
      } else {
        setFeedback({ type: 'error', message: data.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to delete menu item.' });
    }
  };

  // Toggle Availability
  const handleToggleAvailability = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/menu/${item.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems(items.map(i => i.id === item.id ? { ...i, available: data.available } : i));
        setFeedback({ type: 'success', message: data.message });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const isEdit = !!editingCategory;
    const url = isEdit ? `/api/menu/categories/${editingCategory.id}` : '/api/menu/categories';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        setShowCategoryModal(false);
        fetchCategories();
      } else {
        setFeedback({ type: 'error', message: data.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to save category.' });
    }
  };

  // Filter items
  const displayedItems = items.filter(item => {
    const matchSearch = !search.trim() || item.name.toLowerCase().includes(search.toLowerCase()) || (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchDiscount = !filterDiscountsOnly || parseFloat(item.discount_percent || 0) > 0;
    return matchSearch && matchDiscount;
  });

  const discountedItemsCount = items.filter(i => parseFloat(i.discount_percent || 0) > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '22px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}>
              👑 Executive Owner Portal
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              • Menu Catalog, Pricing & Customer Promotional Offers
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
            Menu Offerings & Customer Discount Management
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Add, update, or remove restaurant dishes, configure base prices, and provide special promotional discounts or offers to your customers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              background: '#F8FAFC',
              color: '#334155',
              border: '1px solid #CBD5E1',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Layers size={16} />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: '#FFF',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(180, 83, 9, 0.25)'
            }}
          >
            <PlusCircle size={17} />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div style={{ background: '#FFF', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#FEF3C7', color: '#B45309', padding: '10px', borderRadius: '10px' }}>
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>TOTAL MENU DISHES</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>{items.length}</div>
          </div>
        </div>

        <div style={{ background: '#FFF', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px', borderRadius: '10px' }}>
            <Tag size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>SPECIAL OFFERS / DISCOUNTS</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#DC2626' }}>{discountedItemsCount} Dishes</div>
          </div>
        </div>

        <div style={{ background: '#FFF', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '10px', borderRadius: '10px' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>ACTIVE CATEGORIES</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>{categories.length}</div>
          </div>
        </div>

        <div style={{ background: '#FFF', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#ECFDF5', color: '#059669', padding: '10px', borderRadius: '10px' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>AVAILABLE FOR POS & WAITER</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#059669' }}>
              {items.filter(i => i.available).length} Live
            </div>
          </div>
        </div>
      </div>

      {feedback && (
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

      {/* Filter and Search Bar */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        padding: '16px 20px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={17} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search dishes by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            fontSize: '13px',
            fontWeight: '600',
            color: '#334155',
            background: '#FFF'
          }}
        >
          <option value="All">All Categories ({categories.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Discount Filter Pill Toggle */}
        <button
          type="button"
          onClick={() => setFilterDiscountsOnly(!filterDiscountsOnly)}
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            border: filterDiscountsOnly ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
            background: filterDiscountsOnly ? '#FEE2E2' : '#FFF',
            color: filterDiscountsOnly ? '#B91C1C' : '#475569',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Tag size={15} />
          <span>Discounted / Offer Dishes Only ({discountedItemsCount})</span>
        </button>

        <button
          onClick={() => { fetchCategories(); fetchMenu(); }}
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            fontSize: '13px',
            fontWeight: '600',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Menu Dishes Table */}
      <div style={{
        background: '#FFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        {displayedItems.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94A3B8' }}>
            <UtensilsCrossed size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <h4 style={{ margin: 0, fontSize: '16px', color: '#475569', fontWeight: '800' }}>
              No Menu Items Found
            </h4>
            <p style={{ margin: '4px 0 16px 0', fontSize: '13px' }}>
              Click &quot;Add New Dish&quot; above to create a menu offering.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '800', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Dish Name & Details</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Standard Price</th>
                  <th style={{ padding: '14px 18px' }}>Discount / Offer %</th>
                  <th style={{ padding: '14px 18px' }}>Customer Offer Price</th>
                  <th style={{ padding: '14px 18px' }}>Live Stock Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Owner Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((item, idx) => {
                  const regularPrice = parseFloat(item.price) || 0;
                  const discountPct = parseFloat(item.discount_percent) || 0;
                  const hasDiscount = discountPct > 0;
                  const discountAmount = (regularPrice * discountPct) / 100;
                  const offerPrice = regularPrice - discountAmount;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        background: idx % 2 === 0 ? '#FFF' : '#FAFAFA'
                      }}
                    >
                      {/* Name, Photo & Details */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <DishImage
                            src={item.image_url}
                            alt={item.name}
                            category={item.category_name}
                            size="md"
                            style={{
                              width: '46px',
                              height: '46px',
                              minWidth: '46px',
                              minHeight: '46px',
                              borderRadius: '10px',
                              border: '1px solid #E2E8F0',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '14px' }}>
                              {item.name}
                            </div>
                            {item.description && (
                              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', maxWidth: '320px' }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {item.category_name}
                        </span>
                      </td>

                      {/* Standard Price */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontWeight: hasDiscount ? '600' : '800',
                          color: hasDiscount ? '#94A3B8' : '#0F172A',
                          textDecoration: hasDiscount ? 'line-through' : 'none',
                          fontSize: hasDiscount ? '13px' : '15px'
                        }}>
                          ₹{regularPrice.toFixed(2)}
                        </span>
                      </td>

                      {/* Discount / Offer Tag */}
                      <td style={{ padding: '14px 18px' }}>
                        {hasDiscount ? (
                          <button
                            onClick={() => handleOpenDiscountModal(item)}
                            title="Click to edit discount"
                            style={{
                              background: '#FEE2E2',
                              color: '#DC2626',
                              border: '1px solid #FCA5A5',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Tag size={12} />
                            <span>{discountPct.toFixed(0)}% OFF</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDiscountModal(item)}
                            style={{
                              background: '#F8FAFC',
                              color: '#64748B',
                              border: '1px dashed #CBD5E1',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            + Set Offer
                          </button>
                        )}
                      </td>

                      {/* Customer Offer Price */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '900', color: hasDiscount ? '#059669' : '#0F172A', fontSize: '15px' }}>
                            ₹{offerPrice.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700' }}>
                              Save ₹{discountAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Availability */}
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            background: item.available ? '#DCFCE7' : '#FEE2E2',
                            color: item.available ? '#15803D' : '#991B1B'
                          }}
                        >
                          {item.available ? '● Available' : '○ Out of Stock'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenDiscountModal(item)}
                            title="Provide Discount or Offer"
                            style={{
                              background: '#FFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              color: '#DC2626',
                              fontWeight: '700',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Percent size={13} />
                            <span>Offer</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Dish & Price"
                            style={{
                              background: '#FFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              color: '#2563EB'
                            }}
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            title="Remove Dish from Menu"
                            style={{
                              background: '#FFF',
                              border: '1px solid #FCA5A5',
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              color: '#DC2626'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT DISH                                    */}
      {/* ======================================================== */}
      {showItemModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
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
            maxWidth: '520px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>
                  {editingItem ? 'Edit Dish & Pricing' : 'Add New Dish to Menu'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  Configure base price, category, and special customer discounts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  DISH NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Butter Masala"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                    CATEGORY *
                  </label>
                  <select
                    value={itemForm.category_id}
                    onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                    STANDARD PRICE (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="250.00"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Promotional Discount / Customer Offer % */}
              <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '900', color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={14} /> SPECIAL CUSTOMER OFFER / DISCOUNT (%)
                  </label>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#B45309' }}>
                    {itemForm.discount_percent || 0}% OFF
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={itemForm.discount_percent}
                    onChange={(e) => setItemForm({ ...itemForm, discount_percent: e.target.value })}
                    style={{ width: '90px', padding: '8px', borderRadius: '6px', border: '1px solid #F59E0B', fontSize: '13px', fontWeight: '800' }}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 10, 15, 20, 25].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setItemForm({ ...itemForm, discount_percent: pct })}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: itemForm.discount_percent == pct ? '1.5px solid #92400E' : '1px solid #CBD5E1',
                          background: itemForm.discount_percent == pct ? '#92400E' : '#FFF',
                          color: itemForm.discount_percent == pct ? '#FFF' : '#475569',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {pct === 0 ? 'No Offer' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Offer Price Live Preview */}
                {parseFloat(itemForm.price) > 0 && (
                  <div style={{ fontSize: '12px', color: '#78350F', display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #FCD34D' }}>
                    <span>Customer Offer Price:</span>
                    <strong style={{ fontSize: '13px' }}>
                      ₹{Math.max(0, (parseFloat(itemForm.price) - (parseFloat(itemForm.price) * (parseFloat(itemForm.discount_percent || 0) / 100)))).toFixed(2)}
                    </strong>
                  </div>
                )}
              </div>

              {/* Dish Image URL & Preset Selection */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ImageIcon size={14} /> DISH IMAGE (URL OR PRESET)
                  </label>
                  {itemForm.image_url && (
                    <button
                      type="button"
                      onClick={() => setItemForm({ ...itemForm, image_url: '' })}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <DishImage
                    src={itemForm.image_url}
                    alt={itemForm.name || 'Preview'}
                    size="md"
                    style={{ borderRadius: '8px', border: '1px solid #CBD5E1', flexShrink: 0 }}
                  />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    value={itemForm.image_url || ''}
                    onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  />
                </div>

                {/* 1-Click Preset Food Photos */}
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Quick Preset Photos (1-Click Fill):
                  </div>
                  <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {PRESET_DISH_IMAGES.slice(0, 10).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setItemForm(prev => ({
                            ...prev,
                            image_url: preset.url,
                            name: prev.name ? prev.name : preset.name
                          }));
                        }}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: itemForm.image_url === preset.url ? '1px solid #7E22CE' : '1px solid #E2E8F0',
                          background: itemForm.image_url === preset.url ? '#F3E8FF' : '#FFF',
                          color: '#334155',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{preset.emoji}</span>
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  DESCRIPTION
                </label>
                <textarea
                  rows="2"
                  placeholder="Ingredients, preparation style, allergen notes..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    border: 'none',
                    color: '#FFF',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(180, 83, 9, 0.25)'
                  }}
                >
                  {editingItem ? 'Save Updates' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: QUICK CUSTOMER OFFER / DISCOUNT SETTER           */}
      {/* ======================================================== */}
      {showDiscountModal && selectedItemForDiscount && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
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
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '8px', borderRadius: '10px' }}>
                  <Tag size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>
                    Set Customer Offer / Discount
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {selectedItemForDiscount.name} (Base: ₹{parseFloat(selectedItemForDiscount.price).toFixed(2)})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
              Select a promotional discount percentage to provide to customers on this dish:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[0, 5, 10, 15, 20, 25].map(pct => {
                const regPrice = parseFloat(selectedItemForDiscount.price);
                const calcOffer = regPrice - (regPrice * (pct / 100));
                const isSelected = quickDiscountPercent === pct;

                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setQuickDiscountPercent(pct)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #DC2626' : '1px solid #CBD5E1',
                      background: isSelected ? '#FEF2F2' : '#FFF',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '900', color: isSelected ? '#DC2626' : '#0F172A' }}>
                      {pct === 0 ? 'No Offer' : `${pct}% OFF`}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      ₹{calcOffer.toFixed(2)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Percentage Input */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                OR ENTER CUSTOM DISCOUNT PERCENTAGE:
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={quickDiscountPercent}
                onChange={(e) => setQuickDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '14px', fontWeight: '800' }}
              />
            </div>

            <div style={{
              background: '#F8FAFC',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#64748B' }}>New Customer Price:</span>
              <strong style={{ color: '#059669', fontSize: '14px' }}>
                ₹{(parseFloat(selectedItemForDiscount.price) - (parseFloat(selectedItemForDiscount.price) * (quickDiscountPercent / 100))).toFixed(2)}
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveDiscount(quickDiscountPercent)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  background: '#DC2626',
                  color: '#FFF',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Apply Customer Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CATEGORY MANAGEMENT                                */}
      {/* ======================================================== */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
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
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>
                {editingCategory ? 'Edit Category' : 'Create Menu Category'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  CATEGORY NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starters, Chef Specials, Drinks"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  DESCRIPTION
                </label>
                <textarea
                  rows="2"
                  placeholder="Appetizers, main meals, desserts..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    border: 'none',
                    color: '#FFF',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {editingCategory ? 'Save Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
