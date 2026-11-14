import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Sparkles,
  Utensils,
  ExternalLink
} from 'lucide-react';

export const PRESET_DISH_IMAGES = [
  {
    name: 'Paneer Tikka',
    category: 'Starters',
    emoji: '🧀',
    url: 'https://images.unsplash.com/photo-1666001120694-3ebe8fd207be?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Veg Spring Rolls',
    category: 'Starters',
    emoji: '🌯',
    url: 'https://images.unsplash.com/photo-1786174045051-673a64444d72?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Hot Tomato Soup',
    category: 'Starters',
    emoji: '🍲',
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Tandoori Stuffed Soya Chaap',
    category: 'Chef Specials',
    emoji: '🍢',
    url: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Tandoori Soya Chaap',
    category: 'Chef Specials',
    emoji: '🍢',
    url: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=600&q=80'
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
    url: 'https://images.unsplash.com/photo-1680359873724-8062c6806704?auto=format&fit=crop&w=600&q=80'
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
    url: 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Chocolate Brownie with Ice Cream',
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

/**
 * WhatsApp-Style Full-Screen Food Image Viewer Lightbox Modal
 * Renders via React Portal directly into document.body to prevent clipping
 */
function WhatsAppDishLightbox({
  src,
  alt = 'Dish photo',
  category = '',
  price = null,
  discount_pct = null,
  description = null,
  onClose
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Use crystal-clear high-resolution version for Unsplash images
  const highResSrc = src && src.includes('images.unsplash.com')
    ? src.replace(/w=\d+/, 'w=1400').replace(/q=\d+/, 'q=90')
    : src;

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // WhatsApp-style media download action
  const handleDownload = (e) => {
    e.stopPropagation();
    setDownloading(true);
    fetch(highResSrc || src)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const cleanName = (alt || 'dish').toLowerCase().replace(/[^a-z0-9]+/g, '_');
        link.download = `${cleanName}_full_image.jpg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setDownloading(false);
      })
      .catch(() => {
        window.open(src, '_blank');
        setDownloading(false);
      });
  };

  const emoji = getCategoryEmoji(category);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(5, 10, 20, 0.94)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'dishLightboxFadeIn 0.22s ease-out'
      }}
    >
      <style>{`
        @keyframes dishLightboxFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes dishImagePop {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Top Navigation Bar (WhatsApp Media Header style) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          height: '66px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.88)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
          zIndex: 10
        }}
      >
        {/* Left: Dish Information */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(249,115,22,0.2) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0
            }}
          >
            {emoji}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  letterSpacing: '-0.3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {alt}
              </h3>

              {category && (
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.14)',
                    color: '#E2E8F0',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {category}
                </span>
              )}

              {price && (
                <span
                  style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '2px 9px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(16,185,129,0.3)'
                  }}
                >
                  ₹{Number(price).toFixed(2)}
                </span>
              )}

              {discount_pct > 0 && (
                <span
                  style={{
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  {discount_pct}% OFF
                </span>
              )}
            </div>

            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
              WhatsApp-Style Big Food Preview • High Resolution
            </p>
          </div>
        </div>

        {/* Right: Action Controls (Zoom, Download, Close) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Zoom Toggle Button */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            title={isZoomed ? 'Reset fit to screen' : 'Zoom to 100% full resolution'}
            style={{
              background: isZoomed ? '#2563EB' : 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isZoomed ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>
              {isZoomed ? 'Fit Screen' : 'Zoom 100%'}
            </span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download & Save dish photo"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: downloading ? 'wait' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Download size={16} />
            <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>
              {downloading ? 'Saving...' : 'Save Photo'}
            </span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            title="Close viewer (Press Esc)"
            style={{
              background: '#EF4444',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '10px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(239, 68, 68, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
            <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>Close</span>
            <span
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: '700'
              }}
            >
              ESC
            </span>
          </button>
        </div>
      </div>

      {/* Main Center Stage (Big Image Container) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: isZoomed ? 'auto' : 'hidden',
          position: 'relative',
          cursor: 'pointer'
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'dishImagePop 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: isZoomed ? 'zoom-out' : 'zoom-in'
          }}
          title={isZoomed ? 'Click to fit screen' : 'Click to zoom in'}
        >
          <img
            src={highResSrc || src}
            alt={alt}
            style={{
              maxWidth: isZoomed ? 'none' : 'min(92vw, 980px)',
              maxHeight: isZoomed ? 'none' : 'min(73vh, 720px)',
              width: isZoomed ? '1280px' : 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '16px',
              boxShadow: '0 25px 70px -10px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.15)',
              display: 'block',
              transition: 'transform 0.25s ease'
            }}
          />
        </div>
      </div>

      {/* Bottom Information Caption Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#E2E8F0',
          fontSize: '13px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: '#F59E0B' }} />
          <span>
            <strong>{alt}</strong>
            {description ? ` — ${description}` : ' — 100% authentic dish photograph.'}
          </span>
        </div>

        <div style={{ color: '#94A3B8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>💡 Click anywhere outside or press <strong>Esc</strong> to close</span>
          <span>•</span>
          <span>Click photo to toggle <strong>Zoom</strong></span>
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced DishImage Component with WhatsApp-Style Full-Screen Zoom Lightbox
 */
export default function DishImage({
  src,
  alt = 'Dish photo',
  category = '',
  size = 'md', // 'sm' (36px), 'md' (48px), 'lg' (80px), 'banner' (full-width banner), 'card-banner', 'menu-card'
  style = {},
  className = '',
  aspectRatio = 'auto',
  borderRadius = '8px',
  enableZoom = true,
  price = null,
  discount_pct = null,
  description = null,
  onClick = null
}) {
  const [error, setError] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

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
  } else if (size === 'menu-card') {
    defaultSizeStyle = { width: '100%', height: '160px', borderRadius: '14px 14px 0 0' };
  }

  const emoji = getCategoryEmoji(category);

  // If no source provided or failed to load
  if (!src || error) {
    return (
      <div
        className={className}
        style={{
          ...defaultSizeStyle,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
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
        <span style={{ fontSize: size === 'banner' || size === 'card-banner' || size === 'menu-card' ? '36px' : size === 'lg' ? '28px' : size === 'sm' ? '18px' : '22px' }}>
          {emoji}
        </span>
        {(size === 'banner' || size === 'card-banner' || size === 'menu-card') && (
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', marginTop: '6px', textAlign: 'center', padding: '0 8px' }}>
            {alt}
          </span>
        )}
      </div>
    );
  }

  const handleImageClick = (e) => {
    // Stop propagation so clicking image does not trigger unwanted parent card actions
    e.stopPropagation();
    if (onClick) onClick(e);
    if (enableZoom && src && !error) {
      setIsZoomOpen(true);
    }
  };

  const isLargeDisplay = size === 'menu-card' || size === 'banner' || size === 'card-banner' || size === 'lg';

  return (
    <>
      <div
        className={`dish-image-wrapper ${className}`}
        onClick={handleImageClick}
        title={enableZoom && src && !error ? `Click to view "${alt}" in big size (WhatsApp style)` : alt}
        style={{
          position: 'relative',
          display: style.display || (size === 'banner' || size === 'card-banner' || size === 'menu-card' ? 'block' : 'inline-block'),
          width: defaultSizeStyle.width,
          height: defaultSizeStyle.height,
          minWidth: defaultSizeStyle.minWidth,
          minHeight: defaultSizeStyle.minHeight,
          borderRadius: defaultSizeStyle.borderRadius || borderRadius,
          overflow: 'hidden',
          cursor: enableZoom && src && !error ? 'zoom-in' : 'default',
          flexShrink: 0,
          userSelect: 'none',
          ...style
        }}
      >
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            backgroundColor: '#F1F5F9',
            transition: 'transform 0.25s ease'
          }}
          onMouseEnter={(e) => {
            if (enableZoom && src && !error) {
              e.currentTarget.style.transform = 'scale(1.06)';
            }
          }}
          onMouseLeave={(e) => {
            if (enableZoom && src && !error) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        />

        {/* Visual Zoom Hint Badge for card/banner formats */}
        {enableZoom && src && !error && isLargeDisplay && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(15, 23, 42, 0.82)',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '4px 9px',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              pointerEvents: 'none',
              letterSpacing: '0.2px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <Maximize2 size={12} />
            <span>Click to View</span>
          </div>
        )}
      </div>

      {/* WhatsApp-Style Full-Screen Modal Lightbox via React Portal */}
      {isZoomOpen && createPortal(
        <WhatsAppDishLightbox
          src={src}
          alt={alt}
          category={category}
          price={price}
          discount_pct={discount_pct}
          description={description}
          onClose={() => setIsZoomOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
