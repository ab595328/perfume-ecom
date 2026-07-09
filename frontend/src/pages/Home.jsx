import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import banner1 from '../assets/banner1.jpg';
import banner2 from '../assets/banner2.jpg';
import banner3 from '../assets/banner3.jpg';
import banner4 from '../assets/banner4.jpg';
import './Home.css';

export default function Home({ onOpenQuiz }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: banner1,
      subtitle: "HAUTE PARFUMERIE",
      title: "SCENTS OF OBSIDIAN & OUD",
      desc: "An olfactory masterpiece blending the smoky depth of Cambodian agarwood resin with dark obsidian amber and dry black cedar. Hand-poured in small batches, this intense Extrait de Parfum evolves continuously over twelve hours, revealing whispers of warm saffron and leather. Craftsmanship redefined for the refined senses.",
      tagline: "BEYOND SCENT. BEYOND ORDINARY."
    },
    {
      image: banner2,
      subtitle: "THE PARIS CELLARS",
      title: "SCENTS THAT LEAVE A LEGACY",
      desc: "Mature extraction at its absolute peak. Aged inside French Limousin oak casks for 180 days, this golden amber elixir merges Bulgarian Damask rose with sun-kissed patchouli. Its velvet textures cling close to the skin, developing a legendary trail that matures gracefully.",
      tagline: "OUD ÉLIXIR & AURÉE"
    },
    {
      image: banner3,
      subtitle: "THE MAISON COLLECTION",
      title: "ELEVATE YOUR ESSENCE",
      desc: "Begin an extraordinary journey through Astraire's master perfumery library. Ten meticulously balanced accords ethically harvested and hand-compounded in Grasse. Designed for the olfactory connoisseur seeking a signature statement.",
      tagline: "TEN EXQUISITE ACCORDS"
    },
    {
      image: banner4,
      subtitle: "CITRUS L'EAU",
      title: "NATURE INSPIRES. LUXURY DEFINES.",
      desc: "Vibrant mountain waterfalls merging with Clean Sage, Bergamot, and Mediterranean Bitter Orange. A crisp, sophisticated fresh trail anchored by dry white musk and marine oakmoss. Elegant, dry, and clean.",
      tagline: "LUMIÈRE & VERT ÉMERAUDE"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        // Display top 3 products as featured
        setFeaturedProducts(data.slice(0, 3));
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  return (
    <div className="home-page animate-fade">
      {/* Hero Slider Section */}
      <section className="hero-slider-section">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <span className="hero-subtitle">{slide.subtitle}</span>
              <h1 className="hero-title">
                {slide.title.includes("OBSIDIAN") ? (
                  <>SCENTS OF <span className="gold-gradient-text">OBSIDIAN & OUD</span></>
                ) : slide.title.includes("LEGACY") ? (
                  <>SCENTS THAT <span className="gold-gradient-text">LEAVE A LEGACY</span></>
                ) : slide.title.includes("NATURE") ? (
                  <>NATURE INSPIRES. <span className="gold-gradient-text">LUXURY DEFINES.</span></>
                ) : (
                  <>ELEVATE <span className="gold-gradient-text">YOUR ESSENCE</span></>
                )}
              </h1>
              <span className="hero-tagline-text">{slide.tagline}</span>
              <p className="hero-desc">
                {slide.desc}
              </p>
              <div className="hero-actions">
                <Link to="/shop" className="gold-button solid">Explore Collections</Link>
                <button className="gold-button" onClick={onOpenQuiz}>
                  <Compass size={16} /> Find Your Signature Scent
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button className="slider-arrow prev" onClick={prevSlide} aria-label="Previous Slide">
          &#10094;
        </button>
        <button className="slider-arrow next" onClick={nextSlide} aria-label="Next Slide">
          &#10095;
        </button>

        {/* Slide Bullets */}
        <div className="slider-bullets">
          {slides.map((_, index) => (
            <button 
              key={index} 
              className={`bullet ${index === currentSlide ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <span>Scroll to Discover</span>
        </div>
      </section>

      {/* Scent Quiz Highlight Banner */}
      <section className="quiz-banner container">
        <div className="quiz-banner-inner glass-panel">
          <div className="quiz-banner-text">
            <Sparkles className="gold-icon animate-pulse" size={32} />
            <h2>Unsure of your fragrance note?</h2>
            <p>Engage with our digital scent concierge. Through an interactive exploration of your aesthetic preferences, atmospheric moods, and lifestyle accords, we consult the compounding registry to reveal your signature Astraire masterpiece.</p>
          </div>
          <button className="gold-button solid" onClick={onOpenQuiz}>
            Begin Scent Quiz
          </button>
        </div>
      </section>

      {/* Scent Families Category Grid */}
      <section className="categories-section container">
        <div className="section-header">
          <span className="section-subtitle">THE PALETTE</span>
          <h2>Explore Scent Families</h2>
          <div className="title-underline"></div>
        </div>

        <div className="categories-grid">
          <Link to="/shop?category=Woody" className="category-card woody reveal-item stagger-1">
            <div className="category-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1541443131876-44b03de101c5?q=80&w=600&auto=format&fit=crop)' }}></div>
            <div className="category-overlay"></div>
            <div className="category-info">
              <h3>Woody</h3>
              <p>Cedarwood, Oud, Cardamom & Smoky Leather</p>
              <span className="explore-btn">Discover <ArrowRight size={14} /></span>
            </div>
          </Link>

          <Link to="/shop?category=Floral" className="category-card floral reveal-item stagger-2">
            <div className="category-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop)' }}></div>
            <div className="category-overlay"></div>
            <div className="category-info">
              <h3>Floral</h3>
              <p>Damask Rose, Night Jasmine & Velvet Iris</p>
              <span className="explore-btn">Discover <ArrowRight size={14} /></span>
            </div>
          </Link>

          <Link to="/shop?category=Fresh" className="category-card fresh reveal-item stagger-3">
            <div className="category-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=600&auto=format&fit=crop)' }}></div>
            <div className="category-overlay"></div>
            <div className="category-info">
              <h3>Fresh</h3>
              <p>Neroli, Bergamot, Sea Salt & Mineral Sage</p>
              <span className="explore-btn">Discover <ArrowRight size={14} /></span>
            </div>
          </Link>

          <Link to="/shop?category=Oriental" className="category-card oriental reveal-item stagger-4">
            <div className="category-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop)' }}></div>
            <div className="category-overlay"></div>
            <div className="category-info">
              <h3>Oriental</h3>
              <p>Vanilla Bean, Amberwood, Patchouli & Saffron</p>
              <span className="explore-btn">Discover <ArrowRight size={14} /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section container">
        <div className="section-header">
          <span className="section-subtitle">THE SELECTION</span>
          <h2>House Masterpieces</h2>
          <div className="title-underline"></div>
        </div>

        <div className="featured-grid">
          {featuredProducts.map((product, idx) => (
            <div key={product.id} className={`perfume-card glass-panel reveal-item stagger-${idx + 1}`}>
              <div className="card-img-wrapper">
                <img src={product.image} alt={product.name} className="perfume-img-spin-on-hover" />
                <span className="card-category-badge">{product.category}</span>
              </div>
              <div className="card-content">
                <span className="card-brand">{product.brand}</span>
                <h3>{product.name}</h3>
                <p className="card-desc">
                  {product.description.substring(0, 100)}...
                </p>
                <div className="card-notes-preview">
                  <span><strong>Top:</strong> {product.top_notes?.split(',')[0]}</span>
                  <span><strong>Base:</strong> {product.base_notes?.split(',')[0]}</span>
                </div>
                <div className="card-footer">
                  <span className="card-price">₹{product.price.toLocaleString('en-IN')}</span>
                  <div className="card-btns">
                    <Link to={`/product/${product.id}`} className="detail-link">Details</Link>
                    <button 
                      className="gold-button solid add-btn"
                      onClick={() => addToCart(product, 1)}
                    >
                      Add To Selection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Auto-scrolling Showcase */}
      {allProducts.length > 0 && (
        <section className="marquee-section">
          <div className="section-header container">
            <span className="section-subtitle">THE COLLECTION</span>
            <h2>The Infinite Rotation</h2>
            <div className="title-underline"></div>
          </div>
          <div className="marquee-wrapper">
            <div className="marquee-track">
              {[...allProducts, ...allProducts, ...allProducts].map((product, index) => (
                <div key={`${product.id}-${index}`} className="marquee-card glass-panel">
                  <div className="marquee-img-container">
                    <img src={product.image} alt={product.name} className="marquee-img float-rotate-3d" />
                  </div>
                  <div className="marquee-info">
                    <span className="marquee-brand">{product.brand}</span>
                    <h3>{product.name}</h3>
                    <p className="marquee-desc-text">{product.description.substring(0, 110)}...</p>
                    <span className="marquee-price">₹{product.price.toLocaleString('en-IN')}</span>
                    <div className="marquee-actions">
                      <Link to={`/product/${product.id}`} className="marquee-detail-btn">Details</Link>
                      <button 
                        className="gold-button solid marquee-add-btn"
                        onClick={() => addToCart(product, 1)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Values / Story */}
      <section id="story" className="story-section">
        <div className="story-container container">
          <div className="story-content reveal-item stagger-1">
            <span className="section-subtitle">OUR VALUES</span>
            <h2>Pure Ingredients, Master Craftsmanship</h2>
            <div className="title-underline left"></div>
            <p>
              We believe that fine perfumery is not a retail product; it is a sacred art. Each crystal vial of Astraire Extraits contains raw, ethically-sourced botanicals hand-inspected in our Grasse compounding studio and matured for months in historic Limousin oak casks to yield unmatched sillage and longevity.
            </p>
            <div className="values-list">
              <div className="value-item reveal-item stagger-2">
                <ShieldCheck className="gold-icon" size={24} />
                <div>
                  <h4>100% Pure Perfume Oils</h4>
                  <p>No synthetic fillers. We use Extraits de Parfum with high concentration for 12+ hour longevity.</p>
                </div>
              </div>
              <div className="value-item reveal-item stagger-3">
                <Sparkles className="gold-icon" size={24} />
                <div>
                  <h4>Artisanal Small Batches</h4>
                  <p>Matured in French oak casks for 6 months before bottling to enrich the base notes.</p>
                </div>
              </div>
              <div className="value-item reveal-item stagger-4">
                <Heart className="gold-icon" size={24} />
                <div>
                  <h4>Refillable Crystal Vials</h4>
                  <p>Sustainable design meets pure luxury. Return your bottle to our stores for a refill discount.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="story-image reveal-item stagger-3">
            <img src="https://images.unsplash.com/photo-1615655404745-a10c24ac25e9?q=80&w=800&auto=format&fit=crop" alt="Perfume Lab Setup" />
            <div className="story-badge">
              <span className="badge-num">100%</span>
              <span className="badge-text">Natural Origin</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
