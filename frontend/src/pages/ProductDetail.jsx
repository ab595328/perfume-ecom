import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Minus, Check, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      
      if (db) {
        try {
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProduct({ id: docSnap.id, ...docSnap.data() });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error fetching product document from Firestore:", err);
        }
      }

      // Offline mock fallback
      console.warn("ProductDetail falling back to mock catalog match.");
      const defaultMockProducts = [
        { id: '1', name: 'Oud Élixir', brand: 'Astraire Private Blend', category: 'Woody', price: 24500, stock: 12, description: 'Compounded matured Cambodian Oud absolute resins. Maturing for 180 days in oak casks.', top_notes: 'Saffron, Rose', middle_notes: 'Patchouli, Jasmine', base_notes: 'Agarwood, Amberwood', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop' },
        { id: '2', name: 'Aurée', brand: 'Astraire Private Blend', category: 'Floral', price: 18500, stock: 8, description: 'Bulgarian Rose Damascena blended with absolute Jasmine. A warm velvet hug.', top_notes: 'Bergamot, Saffron', middle_notes: 'Damask Rose, Night Jasmine', base_notes: 'Jasmine, Patchouli, Amber', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop' },
        { id: '3', name: 'Santal de Ciel', brand: 'Astraire Private Blend', category: 'Woody', price: 21000, stock: 15, description: 'Aged Mysore Sandalwood extract with ambergris fixatives. High longevity.', top_notes: 'Sandalwood, Cardamom', middle_notes: 'Amber, Vetiver', base_notes: 'Cedarwood, Vetiver', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop' },
        { id: '4', name: 'Noir Extrême', brand: 'Astraire Private Blend', category: 'Oriental', price: 26000, stock: 5, description: 'Black Vanilla beans macerated in Limousin oak barrels. Smoky and dark.', top_notes: 'Black Pepper, Vanilla', middle_notes: 'Oakwood, Tobacco', base_notes: 'Smoked Wood, Incense, Cedar', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop' }
      ];
      
      const matched = defaultMockProducts.find(p => p.id === id || p.id === String(id));
      if (matched) {
        setProduct(matched);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="detail-loading-container">
        <div className="spinner"></div>
        <p>Uncorking fragrance notes...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="detail-error-container container">
        <h2>Blend Not Found</h2>
        <p>This premium reserve might have sold out or does not exist in our catalog.</p>
        <Link to="/shop" className="gold-button">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page container animate-fade">
      <Link to="/shop" className="back-link reveal-item stagger-1">
        <ArrowLeft size={16} /> Back to curation
      </Link>

      <div className="detail-layout">
        {/* Gallery */}
        <div className="detail-gallery reveal-item stagger-2">
          <div className="main-image-wrapper glass-panel float-rotate-3d">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        {/* Product Details */}
        <div className="detail-info-pane reveal-item stagger-3">
          <span className="detail-category">{product.category} family</span>
          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-brand">{product.brand}</p>
          <div className="detail-rating">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} fill="var(--gold)" color="var(--gold)" />
            ))}
            <span>(4.9/5 - 42 Reviews)</span>
          </div>

          <p className="detail-price">₹{product.price.toLocaleString('en-IN')}</p>

          <p className="detail-desc">{product.description}</p>

          {/* Scent Pyramid Interaction */}
          <div className="scent-pyramid-section">
            <h3>Scent Profile Pyramid</h3>
            <div className="pyramid-wrapper">
              <div className="pyramid-level top-level glass-panel">
                <div className="level-badge">Top Notes</div>
                <div className="level-notes">{product.top_notes || 'Citrus, Spices'}</div>
                <div className="level-desc">The sparkling curtain reveal. High-frequency volatile molecules like cold-pressed bergamot, saffron, and pink pepper. Evaporates gracefully within 20-30 minutes.</div>
              </div>
              <div className="pyramid-level middle-level glass-panel">
                <div className="level-badge">Heart Notes</div>
                <div className="level-notes">{product.middle_notes || 'Floral accords'}</div>
                <div className="level-desc">The core narrative structure. Rich absolute floral extracts or spices like Turkish Damask Rose and Night Jasmine. Clings close to the skin, lingering for 4-5 hours.</div>
              </div>
              <div className="pyramid-level base-level glass-panel">
                <div className="level-badge">Base Notes</div>
                <div className="level-notes">{product.base_notes || 'Amber, Woods, Musk'}</div>
                <div className="level-desc">The heavy, grounding anchor. Oak cask-matured oils like Cambodian Oud, leather, and vanilla pod resin. Longevities exceed 12-16 hours.</div>
              </div>
            </div>
          </div>

          <div className="purchase-controls">
            <div className="qty-selector">
              <button 
                onClick={() => setQty(prev => Math.max(1, prev - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span>{qty}</span>
              <button 
                onClick={() => setQty(prev => prev + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button 
              className={`gold-button solid add-cart-btn ${added ? 'success' : ''}`}
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <Check size={18} /> Added to Selection
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Acquire Extrait (₹{(product.price * qty).toLocaleString('en-IN')})
                </>
              )}
            </button>
          </div>

          {/* Stock warnings */}
          <p className="stock-notice">
            {product.stock <= 5 
              ? `Only ${product.stock} decants left in the house vaults.` 
              : 'In stock. Shipped immediately via armored carrier courier.'}
          </p>
        </div>
      </div>
    </div>
  );
}
