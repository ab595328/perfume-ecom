import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Shop.css';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState(30000);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const { addToCart } = useCart();
  const location = useLocation();

  // Load category and search from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const search = params.get('search');
    
    if (cat) {
      setCategoryFilter(cat);
    } else {
      setCategoryFilter('All');
    }

    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery('');
    }
  }, [location.search]);

  // Fetch products from backend with local fallback
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Database server empty');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Error loading products from database, falling back to mock catalog:", err);
        const defaultMockProducts = [
          { id: 1, name: 'Oud Élixir', brand: 'Astraire Private Blend', category: 'Woody', price: 24500, stock: 12, description: 'Compounded matured Cambodian Oud absolute resins. Maturing for 180 days in oak casks.', top_notes: 'Saffron, Rose', base_notes: 'Agarwood, Amberwood', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop' },
          { id: 2, name: 'Aurée', brand: 'Astraire Private Blend', category: 'Floral', price: 18500, stock: 8, description: 'Bulgarian Rose Damascena blended with absolute Jasmine. A warm velvet hug.', top_notes: 'Bergamot, Saffron', base_notes: 'Jasmine, Patchouli', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop' },
          { id: 3, name: 'Santal de Ciel', brand: 'Astraire Private Blend', category: 'Woody', price: 21000, stock: 15, description: 'Aged Mysore Sandalwood extract with ambergris fixatives. High longevity.', top_notes: 'Sandalwood, Cardamom', base_notes: 'Cedarwood, Vetiver', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop' },
          { id: 4, name: 'Noir Extrême', brand: 'Astraire Private Blend', category: 'Oriental', price: 26000, stock: 5, description: 'Black Vanilla beans macerated in Limousin oak barrels. Smoky and dark.', top_notes: 'Black Pepper, Vanilla', base_notes: 'Smoked Wood, Incense', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop' }
        ];
        setProducts(defaultMockProducts);
        setLoading(false);
      });
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Filter by Category
    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Filter by Price
    result = result.filter(p => p.price <= priceFilter);

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);
  }, [products, categoryFilter, priceFilter, searchQuery, sortBy]);

  return (
    <div className="shop-page container animate-fade">
      <div className="shop-header">
        <span className="section-subtitle">THE CELLARS</span>
        <h1>Curated Fine Extracts</h1>
        <div className="title-underline"></div>
        <p className="shop-intro">
          Enter the private compounding reserves of Astraire. Every formulation displayed represents an authentic Extrait de Parfum concentration—hand-compounded from aged resins, cold-pressed absolute florals, and organic fixatives matured for 180 days in Limousin oak casks. Select a signature reserve that speaks to your skin chemistry.
        </p>
      </div>

      {/* Mobile Filters Trigger */}
      <div className="mobile-filter-bar">
        <button 
          className="mobile-filters-toggle gold-button" 
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={14} /> {showFilters ? "Close Filters" : "Filter Reserves"}
        </button>
      </div>

      <div className="shop-layout">
        {/* Filters Sidebar */}
        <aside className={`filters-sidebar glass-panel ${showFilters ? 'open' : ''}`}>
          <div className="sidebar-header">
            <SlidersHorizontal size={18} className="gold-icon" />
            <h3>Filter Reserves</h3>
          </div>

          <div className="filter-group">
            <h4>Search</h4>
            <input 
              type="text" 
              placeholder="Scent, note, key ingredient..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <h4>Scent Families</h4>
            <div className="category-options">
              {['All', 'Woody', 'Floral', 'Fresh', 'Oriental'].map((cat) => (
                <button
                  key={cat}
                  className={`category-opt ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Maximum Price</h4>
            <div className="price-slider-wrapper">
              <input 
                type="range" 
                min="5000" 
                max="30000" 
                step="500"
                value={priceFilter}
                onChange={(e) => setPriceFilter(Number(e.target.value))}
                className="price-slider"
              />
              <div className="price-labels">
                <span>₹5,000</span>
                <span className="current-price">₹{priceFilter.toLocaleString('en-IN')}</span>
                <span>₹30,000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <main className="catalog-area">
          <div className="catalog-toolbar">
            <span className="results-count">
              Showing {filteredProducts.length} masterpieces
            </span>
            <div className="sort-wrapper">
              <span>Sort By</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="default">Default curation</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="catalog-loading">
              <div className="spinner"></div>
              <p>Unlocking the vaults...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-results-message glass-panel">
              <ShoppingBag size={40} className="empty-icon" />
              <h3>No blends found</h3>
              <p>Try broadening your filter criteria or clear the search query.</p>
              <button 
                className="gold-button"
                onClick={() => {
                  setCategoryFilter('All');
                  setPriceFilter(30000);
                  setSearchQuery('');
                  setSortBy('default');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="catalog-grid animate-fade">
              {filteredProducts.map((product, idx) => (
                <div key={product.id} className={`perfume-card glass-panel reveal-item stagger-${(idx % 6) + 1}`}>
                  <div className="card-img-wrapper">
                    <img src={product.image} alt={product.name} className="perfume-img-spin-on-hover" />
                    <span className="card-category-badge">{product.category}</span>
                  </div>
                  <div className="card-content">
                    <span className="card-brand">{product.brand}</span>
                    <h3>{product.name}</h3>
                    <p className="card-desc">
                      {product.description.substring(0, 90)}...
                    </p>
                    <div className="card-notes-preview">
                      <span><strong>Top:</strong> {product.top_notes?.split(',')[0]}</span>
                      <span><strong>Base:</strong> {product.base_notes?.split(',')[0]}</span>
                    </div>
                    <div className="card-footer">
                      <span className="card-price">₹{product.price.toLocaleString('en-IN')}</span>
                      <div className="card-btns">
                        <Link to={`/product/${product.id}`} className="detail-icon-btn" title="View details">
                          <Eye size={18} />
                        </Link>
                        <button 
                          className="gold-button solid add-btn"
                          onClick={() => addToCart(product, 1)}
                        >
                          Acquire
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
