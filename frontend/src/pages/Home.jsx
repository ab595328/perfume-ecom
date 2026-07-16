import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Compass, ShieldCheck, Heart, ArrowRight,
  ChevronLeft, ChevronRight, Star, Award, ShieldAlert
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Home.css';

// Import Custom Banners
import banner1 from '../assets/banner1.jpg';
import banner2 from '../assets/banner2.jpg';
import banner3 from '../assets/banner3.jpg';
import banner4 from '../assets/banner4.jpg';

// Canvas Particle Emitter for Floating Gold Dust
function GoldParticlesCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = (canvas.width = window.innerWidth);
      height = (canvas.height = window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const maxParticles = 50;

    class GoldParticle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 50;
        this.size = Math.random() * 1.8 + 0.6;
        this.speedY = -(Math.random() * 0.7 + 0.2);
        this.speedX = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.6 + 0.1;
        this.fade = Math.random() * 0.0015 + 0.0005;
        this.colorType = Math.random() > 0.45 ? 'champagne-gold' : 'ruby';
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.opacity -= this.fade;
        if (this.opacity <= 0 || this.y < 0) {
          this.reset();
        }
      }
      draw() {
        const color = this.colorType === 'champagne-gold'
          ? `rgba(223, 185, 127, ${this.opacity})`
          : `rgba(224, 79, 102, ${this.opacity * 0.75})`;
        const shadow = this.colorType === 'champagne-gold' ? 'rgba(223, 185, 127, 0.8)' : 'rgba(224, 79, 102, 0.6)';

        ctx.fillStyle = color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = shadow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new GoldParticle());
      particles[i].y = Math.random() * height; // Distribute across canvas on start
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="gold-particles-canvas" />;
}

export default function Home({ onOpenQuiz }) {
  const [allProducts, setAllProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const { addToCart } = useCart();
  const location = useLocation();

  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  const heroSlides = [
    {
      supertitle: "MAISON D'EXTRAITS",
      title: "Crafted For Those Who Wear Elegance",
      desc: "Niche Middle Eastern alchemy compounding rare Grasse reserves. Experience cask-aged agarwood, dark saffron, and damask absolute designed to lingeringly define your legacy.",
      ctaText: "Explore Collection",
      image: banner1
    },
    {
      supertitle: "THE OUD ELIXIR",
      title: "Uncompromising Agarwood Resins",
      desc: "Compounded from wild agarwood resins of Cambodia and matured for 180 days in French Limousin oak barrels to deliver a rich, animalic woody sillage.",
      ctaText: "Acquire Reserve",
      image: banner2
    },
    {
      supertitle: "AURÉE ABSOLUTE",
      title: "Saffron Accords & Velvet Rose",
      desc: "A warm, comforting, and romantic blend of Bulgarian Damask rose, warm saffron spices, organic patchouli leaves, and golden amber fixatives.",
      ctaText: "Discover Aurée",
      image: banner3
    },
    {
      supertitle: "NOIR EXTRÊME",
      title: "Charred Vanilla & Smoked Vetiver",
      desc: "An intense, mysterious formulation featuring aged dark vetiver root extracts blended with black pepper oil and toasted wood smoke.",
      ctaText: "Explore Private Blend",
      image: banner4
    }
  ];

  // Rotate hero slides automatically
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8500);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('quiz') === 'open') {
      onOpenQuiz();
    }
  }, [location.search, onOpenQuiz]);

  // Note Visualizer Interaction
  const [activeNoteTier, setActiveNoteTier] = useState('base');

  // Testimonials Carousel
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Newsletter Success State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const testimonials = [
    {
      text: "Oud Élixir is an olfactory revelation. The Cambodian agarwood matures beautifully on the skin. I received three compliments on the sillage within hours.",
      author: "Prince Fahad",
      location: "Dubai, UAE",
      rating: 5
    },
    {
      text: "Aurée feels like a golden velvet embrace. The Bulgarian Damask rose absolute merged with warm amber and patchouli is pure royal poetry. Unbelievable longevity.",
      author: "Lady Alexandra",
      location: "London, UK",
      rating: 5
    },
    {
      text: "Astraire has restored the soul of haute parfumerie. The presentation in refillable crystal vials and the Limousin cask maturation is unparalleled.",
      author: "Marc-Antoine",
      location: "Paris, France",
      rating: 5
    }
  ];

  const giftSets = [
    {
      id: 'gift-set-1',
      name: 'The Royal Discovery Coffret',
      brand: 'Astraire Private Set',
      description: 'An introductory library of 5 x 10ml travel decants, covering Woody, Floral, Fresh, and Oriental families. Seared in wax and presented in velvet.',
      price: 6500.00,
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop',
      category: 'Gift Set'
    },
    {
      id: 'gift-set-2',
      name: 'The Oud Imperial Ritual',
      brand: 'Astraire Maison Reserve',
      description: 'A prestigious pairing: 100ml Oud Élixir Extrait de Parfum, an amberwood scented candle, and a luxury gold travel atomizer, housed in a polished cedar chest.',
      price: 28000.00,
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop',
      category: 'Gift Set'
    },
    {
      id: 'gift-set-3',
      name: 'Maison Masterpiece Duet',
      brand: 'Astraire Curation',
      description: 'Our house signature scents curated for duality: 50ml Aurée (Velvet Rose & Saffron) and 50ml Noir Extrême (Black Cedar & Papyrus).',
      price: 24000.00,
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
      category: 'Gift Set'
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      if (db) {
        try {
          const snap = await getDocs(collection(db, 'products'));
          const list = [];
          snap.forEach(docSnap => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
          if (list.length > 0) {
            setAllProducts(list);
            setBestSellers(list.slice(0, 4));
            return;
          }
        } catch (err) {
          console.error("Firestore read error in Home.jsx:", err);
        }
      }

      // Offline mock fallback
      console.warn("Home falling back to local mock products.");
      const defaultMock = [
        { id: '1', name: 'Oud Élixir', brand: 'Astraire Private Blend', category: 'Woody', price: 24500, stock: 12, description: 'Compounded matured Cambodian Oud absolute resins. Maturing for 180 days in oak casks.', top_notes: 'Saffron, Rose', base_notes: 'Agarwood, Amberwood', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop' },
        { id: '2', name: 'Aurée', brand: 'Astraire Private Blend', category: 'Floral', price: 18500, stock: 8, description: 'Bulgarian Rose Damascena blended with absolute Jasmine. A warm velvet hug.', top_notes: 'Bergamot, Saffron', base_notes: 'Jasmine, Patchouli', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop' },
        { id: '3', name: 'Santal de Ciel', brand: 'Astraire Private Blend', category: 'Woody', price: 21000, stock: 15, description: 'Aged Mysore Sandalwood extract with ambergris fixatives. High longevity.', top_notes: 'Sandalwood, Cardamom', base_notes: 'Cedarwood, Vetiver', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop' },
        { id: '4', name: 'Noir Extrême', brand: 'Astraire Private Blend', category: 'Oriental', price: 26000, stock: 5, description: 'Black Vanilla beans macerated in Limousin oak barrels. Smoky and dark.', top_notes: 'Black Pepper, Vanilla', base_notes: 'Smoked Wood, Incense', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop' }
      ];
      setAllProducts(defaultMock);
      setBestSellers(defaultMock);
    };

    fetchProducts();
  }, []);

  // Slide controls for Best Sellers
  const nextBestSeller = () => {
    setSliderIndex((prev) => (prev + 1) % (bestSellers.length - 1 || 1));
  };
  const prevBestSeller = () => {
    setSliderIndex((prev) => (prev - 1 + (bestSellers.length - 1 || 1)) % (bestSellers.length - 1 || 1));
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="home-page"
    >
      {/* 1. Cinematic Hero Banner */}
      <section className="hero-cinematic">
        {/* Background Banner Image Slider */}
        <div className="hero-video-wrapper" style={{ overflow: 'hidden', position: 'absolute', width: '100%', height: '100%' }}>
          <AnimatePresence initial={false}>
            <motion.img
              key={activeHeroSlide}
              src={heroSlides[activeHeroSlide].image}
              alt={`Astraire Banner ${activeHeroSlide + 1}`}
              className="hero-video"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            />
          </AnimatePresence>
          <div className="hero-video-overlay" style={{ background: 'linear-gradient(to right, rgba(13, 8, 5, 0.9) 35%, rgba(13, 8, 5, 0.5) 70%, rgba(13, 8, 5, 0.9) 100%)' }}></div>
        </div>

        {/* Live Canvas Particle Overlay */}
        <GoldParticlesCanvas />

        <div className="hero-cinematic-content container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeHeroSlide}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="hero-slide-grid-single"
              style={{ maxWidth: '650px', zIndex: 10, textAlign: 'left' }}
            >
              <div className="hero-text-block">
                <span className="hero-supertitle">{heroSlides[activeHeroSlide].supertitle}</span>
                <h1 className="hero-heading" style={{ fontSize: '3rem', lineHeight: '1.2', margin: '0.5rem 0 1.5rem' }}>{heroSlides[activeHeroSlide].title}</h1>
                <p className="hero-lead" style={{ marginBottom: '2.5rem' }}>
                  {heroSlides[activeHeroSlide].desc}
                </p>
                <div className="hero-buttons">
                  <Link to="/shop" className="gold-button solid">{heroSlides[activeHeroSlide].ctaText}</Link>
                  <button onClick={onOpenQuiz} className="gold-button">
                    <Compass size={16} /> Discover Signature Scents
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide navigation dots */}
        <div className="hero-slide-dots">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveHeroSlide(index)}
              className={`hero-dot ${activeHeroSlide === index ? 'active' : ''}`}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>

        {/* Cinematic Scroll indicator */}
        <div className="hero-scroll-indicator">
          <div className="scroller-line"></div>
          <span>Scroll to enter</span>
        </div>
      </section>

      {/* 2. Best Seller Collection Slider */}
      <section className="best-sellers-section container">
        <div className="section-header">
          <span className="section-subtitle">THE CRITICS' RESERVES</span>
          <h2>Best Seller Collection</h2>
          <div className="title-underline"></div>
        </div>

        <div className="slider-viewport">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${sliderIndex * 50}%)` }}
          >
            {bestSellers.map((product) => (
              <div key={product.id} className="slider-item">
                <div className="perfume-card glass-panel">
                  <div className="card-img-wrapper">
                    <img src={product.image} alt={product.name} className="perfume-img-spin-on-hover" />
                    <span className="card-category-badge">{product.category}</span>
                  </div>
                  <div className="card-content">
                    <span className="card-brand">{product.brand}</span>
                    <h3>{product.name}</h3>
                    <p className="card-desc">
                      {product.description.substring(0, 95)}...
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
                          Quick Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {bestSellers.length > 2 && (
            <>
              <button className="slider-nav prev" onClick={prevBestSeller} aria-label="Previous Best Seller">
                <ChevronLeft size={20} />
              </button>
              <button className="slider-nav next" onClick={nextBestSeller} aria-label="Next Best Seller">
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </section>

      {/* 3. Signature Oud Collection */}
      <section className="signature-oud-section">
        <div className="signature-oud-glow"></div>
        <div className="signature-oud-inner container">
          <div className="oud-spotlight-image-col">
            <motion.div
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.95 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="oud-image-frame glass-panel"
            >
              <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop" alt="Premium Oud Curation" />
              <div className="glass-reflection-overlay"></div>
            </motion.div>
          </div>

          <div className="oud-spotlight-text-col">
            <span className="section-subtitle">HOUSE ULTIMATE MASTERPIECE</span>
            <h2>Signature Oud Élixir</h2>
            <div className="title-underline left"></div>
            <p className="oud-story-p">
              Distilled in the heart of the Cardamom Mountains, our Cambodian agarwood is matured for months in authentic historic French Limousin oak barrels to yield an unmatched rich, resinous profile. High concentrations of raw botanical oil compound a velvet, woody sillage that commands presence.
            </p>

            <div className="oud-details-grid">
              <div className="oud-detail-item">
                <span>CONCENTRATION</span>
                <h4>30% Extrait</h4>
              </div>
              <div className="oud-detail-item">
                <span>MATURATION</span>
                <h4>180 Days Oak Barrel</h4>
              </div>
              <div className="oud-detail-item">
                <span>KEY ACCORDS</span>
                <h4>Oud, Leather, Sichuan Pepper</h4>
              </div>
            </div>

            <div className="oud-actions">
              <Link to="/product/1" className="gold-button solid">Acquire Reserve Decant (₹18,500)</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Fragrance Notes Experience */}
      <section className="notes-experience-section container">
        <div className="section-header">
          <span className="section-subtitle">THE OLFACTORY ARCHITECTURE</span>
          <h2>Fragrance Notes Experience</h2>
          <div className="title-underline"></div>
        </div>

        <div className="notes-visualizer-layout">
          {/* Note Selection Tiers */}
          <div className="notes-pyramid-selectors">
            <button
              className={`pyramid-tier-btn top-btn ${activeNoteTier === 'top' ? 'active' : ''}`}
              onClick={() => setActiveNoteTier('top')}
            >
              <span className="tier-tag">01. THE REVEAL</span>
              <h3>Top Notes</h3>
              <p>Sparkling & Volatile (Bergamot, Saffron)</p>
            </button>

            <button
              className={`pyramid-tier-btn middle-btn ${activeNoteTier === 'middle' ? 'active' : ''}`}
              onClick={() => setActiveNoteTier('middle')}
            >
              <span className="tier-tag">02. THE NARRATIVE</span>
              <h3>Heart Notes</h3>
              <p>Deep & Velvet (Turkish Rose, Iris)</p>
            </button>

            <button
              className={`pyramid-tier-btn base-btn ${activeNoteTier === 'base' ? 'active' : ''}`}
              onClick={() => setActiveNoteTier('base')}
            >
              <span className="tier-tag">03. THE MEMORY</span>
              <h3>Base Notes</h3>
              <p>Resinous & Heavy (Cambodian Oud, Leather)</p>
            </button>
          </div>

          {/* Interactive Note Details Display */}
          <div className="notes-detail-display glass-panel">
            <AnimatePresence mode="wait">
              {activeNoteTier === 'top' && (
                <motion.div
                  key="top-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="tier-details-content"
                >
                  <span className="display-subtitle">EVAPORATION: 20-30 MINUTES</span>
                  <h3>Top Notes: The Prelude</h3>
                  <p>
                    The initial olfactory curtain reveal. High-frequency molecules, typically cold-pressed citrus zest, delicate spices, and lightweight herbal extracts, create the immediate sensory hook that greets the room.
                  </p>
                  <div className="note-ingredients-list">
                    <div className="ingredient-badge">
                      <img src="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=400&auto=format&fit=crop" alt="Bergamot" />
                      <span>Cold-Pressed Bergamot</span>
                    </div>
                    <div className="ingredient-badge">
                      <img src="https://images.unsplash.com/photo-1615655404745-a10c24ac25e9?q=80&w=400&auto=format&fit=crop" alt="Saffron" />
                      <span>Red Saffron</span>
                    </div>
                    <div className="ingredient-badge">
                      <img src="https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=400&auto=format&fit=crop" alt="Pink Pepper" />
                      <span>Pink Pepper</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeNoteTier === 'middle' && (
                <motion.div
                  key="middle-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="tier-details-content"
                >
                  <span className="display-subtitle">EVAPORATION: 4-5 HOURS</span>
                  <h3>Heart Notes: The Soul</h3>
                  <p>
                    The core narrative structure. Rich absolute floral distillates, full-bodied aromatic herbs, and select spices develop on the skin, dictating the overall signature profile of the perfume once the prelude settles.
                  </p>
                  <div className="note-ingredients-list">
                    <div className="ingredient-badge">
                      <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop" alt="Damask Rose" />
                      <span>Damask Rose Absolute</span>
                    </div>
                    <div className="ingredient-badge">
                      <img src="https://images.unsplash.com/photo-1541443131876-44b03de101c5?q=80&w=400&auto=format&fit=crop" alt="Night Jasmine" />
                      <span>Night Jasmine</span>
                    </div>
                    <div className="ingredient-badge">
                      <img src="https://images.unsplash.com/photo-1563170351-be82bc888aa4?q=80&w=400&auto=format&fit=crop" alt="Cardamom" />
                      <span>Green Cardamom</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeNoteTier === 'base' && (
                <motion.div
                  key="base-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="tier-details-content"
                >
                  <span className="display-subtitle">EVAPORATION: 12-24 HOURS</span>
                  <h3>Base Notes: The Legacy</h3>
                  <p>
                    The heavy, grounding anchors of fine perfumery. Matured resin extracts, aged woods, leather accords, and heavy animalic or vanilla absolute pods anchor the scent to skin cells, generating the lasting sillage trail.
                  </p>
                  <div className="note-ingredients-list">
                    <div className="ingredient-badge">
                      <img src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=400&auto=format&fit=crop" alt="Oud" />
                      <span>Cambodian Agarwood (Oud)</span>
                    </div>
                    <div className="ingredient-badge">
                      <img src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=400&auto=format&fit=crop" alt="Leather" />
                      <span>Matte Leather</span>
                    </div>
                    <div className="ingredient-badge">
                      <img src="https://images.unsplash.com/photo-1615655404745-a10c24ac25e9?q=80&w=400&auto=format&fit=crop" alt="Amber" />
                      <span>Oak-Aged Amber</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="why-choose-us-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">THE PLEDGE OF QUALITY</span>
            <h2>The Standards of Astraire</h2>
            <div className="title-underline"></div>
          </div>

          <div className="why-choose-grid">
            <motion.div
              whileHover={{ y: -8 }}
              className="why-card glass-panel"
            >
              <Award className="why-icon" size={32} />
              <h3>IFRA Certified</h3>
              <p>Every decant is fully compliant with the highest international standards of safety and formulation transparency.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="why-card glass-panel"
            >
              <Sparkles className="why-icon" size={32} />
              <h3>Long Lasting</h3>
              <p>Our formulation is strictly Extrait de Parfum, featuring high oil concentrations that linger for 12 to 24 hours.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="why-card glass-panel"
            >
              <Compass className="why-icon" size={32} />
              <h3>Luxury Ingredients</h3>
              <p>We source authentic botanical extracts: damask rose petals, Florentine iris root, and pure Cambodian agarwood.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="why-card glass-panel"
            >
              <ShieldCheck className="why-icon" size={32} />
              <h3>Secure Free Shipping</h3>
              <p>Complimentary secure delivery on all orders, packaged inside our custom wooden presenter case.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Storytelling Quote Banner */}
      <section className="maturation-quote-banner">
        <div className="quote-banner-overlay"></div>
        <div className="quote-banner-content container">
          <span className="quote-super">THE ESSENCE OF TIME</span>
          <h2>"Time is the final ingredient. Our extracts mature in Limousin oak casks for 180 days to compound absolute depth."</h2>
          <div className="quote-line"></div>
          <p className="quote-author">— ASTRAIRE MAÎTRE PARFUMEUR</p>
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="testimonials-section container">
        <div className="section-header">
          <span className="section-subtitle">THE OLFACTORY RESONANCE</span>
          <h2>Connoisseur Testimonials</h2>
          <div className="title-underline"></div>
        </div>

        <div className="testimonial-card-wrapper glass-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="testimonial-card-content"
            >
              <div className="rating-stars">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />
                ))}
              </div>
              <p className="testimonial-body-text">
                "{testimonials[activeTestimonial].text}"
              </p>
              <span className="testimonial-author">{testimonials[activeTestimonial].author}</span>
              <span className="testimonial-location">{testimonials[activeTestimonial].location}</span>
            </motion.div>
          </AnimatePresence>

          <div className="testimonial-bullets">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`test-bullet ${i === activeTestimonial ? 'active' : ''}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Luxury Gift Sets */}
      <section className="gift-sets-section container">
        <div className="section-header">
          <span className="section-subtitle">THE ART OF PRESENTATION</span>
          <h2>Curated Luxury Gift Sets</h2>
          <div className="title-underline"></div>
        </div>

        <div className="gift-sets-grid">
          {giftSets.map((set) => (
            <div key={set.id} className="gift-set-card glass-panel">
              <div className="gift-img-frame">
                <img src={set.image} alt={set.name} />
                <div className="glass-reflection-overlay"></div>
              </div>
              <div className="gift-content">
                <span className="gift-brand">{set.brand}</span>
                <h3>{set.name}</h3>
                <p>{set.description}</p>
                <div className="gift-footer">
                  <span className="gift-price">₹{set.price.toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => addToCart(set, 1)}
                    className="gold-button solid"
                  >
                    Acquire Gift Box
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Brand Story Section */}
      <section className="brand-story-luxury">
        <div className="brand-story-inner container">
          <div className="story-text-pane">
            <span className="section-subtitle">THE MAISON CHRONICLE</span>
            <h2>compounded in grasse, Aged in Limousin Oak</h2>
            <div className="title-underline left"></div>
            <p>
              Astraire is born out of a refusal of generic synthetic perfume compounding. Every single one of our extraits is formulated in our Grasse compounding studio under the strict supervision of master olfactory curators.
            </p>
            <p>
              We mature our concentrated oils inside historic Limousin oak barrels for 180 days before adding natural alcohol bases. This slow oak maceration allows raw botanicals to soften, fuse, and absorb woody, vanilla-esque nuances from the wood walls, leading to an incredibly complex skin transition.
            </p>
            <div className="story-sig">ASTRAIRE MAISON DE PARFUM</div>
          </div>
          <div className="story-image-pane">
            <div className="story-img-container glass-panel">
              <img src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop" alt="Distillation Apparatus" />
              <div className="glass-reflection-overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Instagram Gallery */}
      <section className="editorial-instagram container">
        <div className="section-header">
          <span className="section-subtitle">THE SENSORY ARCHIVE</span>
          <h2>Editorial Aesthetics</h2>
          <div className="title-underline"></div>
        </div>
        <div className="editorial-marquee-container">
          <div className="editorial-marquee-track">
            {/* Set 1 */}
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=400&auto=format&fit=crop" alt="Decant aesthetic" />
              <div className="editorial-overlay"><span>Oud Wood Maceration</span></div>
            </div>
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=400&auto=format&fit=crop" alt="Damask Rose Petals" />
              <div className="editorial-overlay"><span>Harvesting at Dawn</span></div>
            </div>
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400&auto=format&fit=crop" alt="Perfume vial reflection" />
              <div className="editorial-overlay"><span>Wax Stamp Seal</span></div>
            </div>
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400&auto=format&fit=crop" alt="Pouring oil extract" />
              <div className="editorial-overlay"><span>Limousin Oak Cask</span></div>
            </div>
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=400&auto=format&fit=crop" alt="Citrus oils" />
              <div className="editorial-overlay"><span>Royal Bergamot</span></div>
            </div>
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=400&auto=format&fit=crop" alt="Premium laboratory setup" />
              <div className="editorial-overlay"><span>Extract Library</span></div>
            </div>

            {/* Set 2 (Duplicated for seamless loop) */}
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=400&auto=format&fit=crop" alt="Decant aesthetic" />
              <div className="editorial-overlay"><span>Oud Wood Maceration</span></div>
            </div>
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=400&auto=format&fit=crop" alt="Damask Rose Petals" />
              <div className="editorial-overlay"><span>Harvesting at Dawn</span></div>
            </div>
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400&auto=format&fit=crop" alt="Perfume vial reflection" />
              <div className="editorial-overlay"><span>Wax Stamp Seal</span></div>
            </div>
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400&auto=format&fit=crop" alt="Pouring oil extract" />
              <div className="editorial-overlay"><span>Limousin Oak Cask</span></div>
            </div>
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=400&auto=format&fit=crop" alt="Citrus oils" />
              <div className="editorial-overlay"><span>Royal Bergamot</span></div>
            </div>
            <div className="editorial-item glass-panel">
              <img src="https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=400&auto=format&fit=crop" alt="Premium laboratory setup" />
              <div className="editorial-overlay"><span>Extract Library</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Ingredient Split Showcase Banner */}
      <section className="editorial-split-banner">
        <div className="editorial-split-inner">
          <div className="split-image-side">
            <img src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop" alt="Haute alchemy distillation setup" />
            <div className="split-image-glow"></div>
          </div>
          <div className="split-content-side glass-panel">
            <span className="split-subtitle">THE CONNOISSEUR INVITATION</span>
            <h2>The Sample Coffret Registry</h2>
            <p>
              Unlock access to three of our house extracts matured for 180 days in Limousin oak. Each travel atomizer contains 10ml of pure alchemical compound—developed to morph uniquely with your skin cells.
            </p>
            <div className="split-details-accords">
              <div className="accord-bullet">
                <strong>Oud Élixir:</strong> <span>42% Cambodian Resin</span>
              </div>
              <div className="accord-bullet">
                <strong>Aurée Rose:</strong> <span>Turkish Rose Absolute</span>
              </div>
              <div className="accord-bullet">
                <strong>Noir Extrême:</strong> <span>Oakwood Saffron blend</span>
              </div>
            </div>
            <Link to="/shop" className="gold-button solid">Acquire Discovery Coffret</Link>
          </div>
        </div>
      </section>

      {/* 10. Newsletter Section */}
      <section className="newsletter-registry container">
        <div className="newsletter-box glass-panel">
          <div className="newsletter-content">
            <Sparkles className="gold-icon animate-pulse" size={28} />
            <h2>Join the Astraire Registry</h2>
            <p>
              Subscribe to secure priority access to private botanical reserves, bespoke compounding registry alerts, and invitations to private showroom maturations.
            </p>

            <AnimatePresence mode="wait">
              {!newsletterSubmitted ? (
                <motion.form
                  key="newsletter-form"
                  onSubmit={handleNewsletterSubmit}
                  className="registry-form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="registry-input"
                  />
                  <button type="submit" className="gold-button solid registry-btn">
                    Join Registry
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="newsletter-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="registry-success"
                >
                  <h4>Curation Registry Secured</h4>
                  <p>A secure invitation has been dispatched to your email address.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
