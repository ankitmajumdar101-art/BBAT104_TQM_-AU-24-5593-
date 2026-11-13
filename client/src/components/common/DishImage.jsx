import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

export const PRESET_DISH_IMAGES = [
  {
    name: 'Paneer Tikka',
    category: 'Starters',
    emoji: '🧀',
    url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Veg Spring Rolls',
    category: 'Starters',
    emoji: '🌯',
    url: 'https://images.unsplash.com/photo-1548869206-93b036288d7e?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Hot Tomato Soup',
    category: 'Starters',
    emoji: '🍲',
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Tandoori Soya Chaap',
    category: 'Chef Specials',
    emoji: '🍢',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Chicken Biryani',
    category: 'Main Course',
    emoji: '🍗',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Paneer Butter Masala',
    category: 'Main Course',
    emoji: '🥘',
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Dal Makhani',
    category: 'Main Course',
    emoji: '🫘',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Butter Naan',
    category: 'Main Course',
    emoji: '🫓',
    url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Margherita Pizza',
    category: 'Fast Food',
    emoji: '🍕',
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Masala Dosa',
    category: 'Fast Food',
    emoji: '🥞',
    url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Veg Cheese Burger',
    category: 'Fast Food',
    emoji: '🍔',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Cold Coffee',
    category: 'Beverages',
    emoji: '🧋',
    url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Masala Chai',
    category: 'Beverages',
    emoji: '☕',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Fresh Lime Soda',
    category: 'Beverages',
    emoji: '🍋',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Gulab Jamun',
    category: 'Desserts',
    emoji: '🍯',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Brownie with Ice Cream',
    category: 'Desserts',
    emoji: '🍫',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'
  }
];

export const getCategoryEmoji = (category = '') => {
  const cat = String(category).toLowerCase();
  if (cat.includes('starter') || cat.includes('soup')) return '🍲';
  if (cat.includes('main')) return '🍛';
  if (cat.includes('fast') || cat.includes('pizza') || cat.includes('burger')) return '🍕';
  if (cat.includes('bev') || cat.includes('coffee') || cat.includes('tea') || cat.includes('chai')) return '☕';
  if (cat.includes('dessert') || cat.includes('sweet') || cat.includes('ice')) return '🍰';
  if (cat.includes('special')) return '⭐';
  return '🍽️';
};

export default function DishImage({
  src,
  alt = 'Dish photo',
  category = '',
  size = 'md', // 'sm' (36px), 'md' (48px), 'lg' (80px), 'banner' (full-width banner)
  style = {},
  className = '',
  aspectRatio = 'auto',
  borderRadius = '8px'
}) {
  const [error, setError] = useState(false);

  // If size is preset:
  let defaultSizeStyle = {};
  if (size === 'sm') {
    defaultSizeStyle = { width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', borderRadius: '8px' };
  } else if (size === 'md') {
    defaultSizeStyle = { width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', borderRadius: '10px' };
  } else if (size === 'lg') {
    defaultSizeStyle = { width: '80px', height: '80px', minWidth: '80px', minHeight: '80px', borderRadius: '12px' };
  } else if (size === 'banner') {
    defaultSizeStyle = { width: '100%', height: '140px', borderRadius: borderRadius || '12px' };
  } else if (size === 'card-banner') {
    defaultSizeStyle = { width: '100%', height: '120px', borderRadius: '12px 12px 0 0' };
  }

  const emoji = getCategoryEmoji(category);

  // If no source provided or failed to load
  if (!src || error) {
    return (
      <div
        className={className}
        style={{
          ...defaultSizeStyle,
          background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#475569',
          border: '1px solid #CBD5E1',
          overflow: 'hidden',
          userSelect: 'none',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
          ...style
        }}
        title={alt}
      >
        <span style={{ fontSize: size === 'banner' || size === 'card-banner' ? '32px' : size === 'lg' ? '28px' : size === 'sm' ? '18px' : '22px' }}>
          {emoji}
        </span>
        {(size === 'banner' || size === 'card-banner') && (
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', marginTop: '4px' }}>
            {alt}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      loading="lazy"
      className={className}
      style={{
        ...defaultSizeStyle,
        objectFit: 'cover',
        display: 'block',
        backgroundColor: '#F1F5F9',
        ...style
      }}
    />
  );
}
