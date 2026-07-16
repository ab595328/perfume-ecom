import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShoppingCart, RefreshCw, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './ScentQuiz.css';

const QUESTIONS = [
  {
    id: 1,
    text: "Select your ideal setting & mood:",
    options: [
      { text: "A crisp morning walk in a cedar & pine forest", category: "Woody" },
      { text: "A high-society floral garden party at dusk", category: "Floral" },
      { text: "Sunbathing on a yacht by the Amalfi coast", category: "Fresh" },
      { text: "A cozy, candlelit library with velvet armchairs", category: "Oriental" }
    ]
  },
  {
    id: 2,
    text: "Which olfactory tone speaks to your soul?",
    options: [
      { text: "Warm woods, resins, and leather", category: "Woody" },
      { text: "Turkish rose, delicate jasmine, and pink pepper", category: "Floral" },
      { text: "Bright citrus, sea salt, and herbal sage", category: "Fresh" },
      { text: "Exotic spices, ylang-ylang, and sweet vanilla", category: "Oriental" }
    ]
  },
  {
    id: 3,
    text: "What is your preference for fragrance presence?",
    options: [
      { text: "Subtle, intimate, and close to the skin", weight: 1 },
      { text: "Balanced, notable but never overpowering", weight: 2 },
      { text: "Rich, complex, and leaving a hypnotic trail", weight: 3 }
    ]
  }
];

export default function ScentQuiz({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [recommendedProduct, setRecommendedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
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
              return;
            }
          } catch (err) {
            console.error("Firestore read error in ScentQuiz:", err);
          }
        }

        // Mock Fallback
        const defaultMock = [
          { id: '1', name: 'Oud Élixir', brand: 'Astraire Private Blend', category: 'Woody', price: 24500, stock: 12, description: 'Compounded matured Cambodian Oud absolute resins. Maturing for 180 days in oak casks.', top_notes: 'Saffron, Rose', middle_notes: 'Patchouli, Jasmine', base_notes: 'Agarwood, Amberwood', image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop' },
          { id: '2', name: 'Aurée', brand: 'Astraire Private Blend', category: 'Floral', price: 18500, stock: 8, description: 'Bulgarian Rose Damascena blended with absolute Jasmine. A warm velvet hug.', top_notes: 'Bergamot, Saffron', middle_notes: 'Damask Rose, Night Jasmine', base_notes: 'Jasmine, Patchouli, Amber', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop' },
          { id: '3', name: 'Santal de Ciel', brand: 'Astraire Private Blend', category: 'Woody', price: 21000, stock: 15, description: 'Aged Mysore Sandalwood extract with ambergris fixatives. High longevity.', top_notes: 'Sandalwood, Cardamom', middle_notes: 'Amber, Vetiver', base_notes: 'Cedarwood, Vetiver', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop' },
          { id: '4', name: 'Noir Extrême', brand: 'Astraire Private Blend', category: 'Oriental', price: 26000, stock: 5, description: 'Black Vanilla beans macerated in Limousin oak barrels. Smoky and dark.', top_notes: 'Black Pepper, Vanilla', middle_notes: 'Oakwood, Tobacco', base_notes: 'Smoked Wood, Incense, Cedar', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop' }
        ];
        setAllProducts(defaultMock);
      };

      fetchProducts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOptionSelect = (option) => {
    const updatedAnswers = [...answers, option];
    setAnswers(updatedAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateRecommendation(updatedAnswers);
    }
  };

  const calculateRecommendation = (finalAnswers) => {
    setLoading(true);
    setTimeout(() => {
      // Find dominant category from first 2 questions
      const categories = finalAnswers.slice(0, 2).map(a => a.category).filter(Boolean);
      let targetCategory = "Woody"; // Default fallback

      if (categories.length > 0) {
        // Tally categories
        const counts = {};
        categories.forEach(cat => { counts[cat] = (counts[cat] || 0) + 1; });

        // Find maximum count category
        let maxCount = 0;
        for (const cat in counts) {
          if (counts[cat] > maxCount) {
            maxCount = counts[cat];
            targetCategory = cat;
          }
        }
      }

      // Filter all products by targetCategory
      const matchingProducts = allProducts.filter(
        p => p.category.toLowerCase() === targetCategory.toLowerCase()
      );

      if (matchingProducts.length > 0) {
        // Just pick the first or a random match
        setRecommendedProduct(matchingProducts[0]);
      } else {
        // Absolute fallback to first product if none match
        setRecommendedProduct(allProducts[0] || null);
      }
      setLoading(false);
      setCurrentStep(QUESTIONS.length);
    }, 1500); // Luxury delay for suspense
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setRecommendedProduct(null);
  };

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal glass-panel animate-fade">
        <button className="quiz-close" onClick={onClose} aria-label="Close Quiz">
          <X size={20} />
        </button>

        {currentStep < QUESTIONS.length && (
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress"
              style={{ width: `${(currentStep / QUESTIONS.length) * 100}%` }}
            ></div>
          </div>
        )}

        {currentStep < QUESTIONS.length ? (
          <div className="quiz-content">
            <div className="quiz-header">
              <Sparkles className="gold-icon" size={24} />
              <span>Scent Finder Quiz</span>
            </div>

            <h2 className="quiz-question-text">{QUESTIONS[currentStep].text}</h2>

            <div className="quiz-options">
              {QUESTIONS[currentStep].options.map((opt, idx) => (
                <button
                  key={idx}
                  className="quiz-option-btn"
                  onClick={() => handleOptionSelect(opt)}
                >
                  <span className="option-text">{opt.text}</span>
                  <ArrowRight className="option-arrow" size={16} />
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="quiz-loading">
            <div className="spinner"></div>
            <h3>Consulting our Master Perfumer...</h3>
            <p>Blending olfactory profiles & ingredients to find your signature match.</p>
          </div>
        ) : (
          <div className="quiz-result animate-fade">
            <div className="quiz-header">
              <Sparkles className="gold-icon" size={24} />
              <span>Your Olfactory Signature</span>
            </div>

            {recommendedProduct ? (
              <div className="result-container">
                <div className="result-image-wrapper">
                  <img src={recommendedProduct.image} alt={recommendedProduct.name} />
                </div>
                <div className="result-info">
                  <span className="result-badge">{recommendedProduct.category} Scent Family</span>
                  <h2>{recommendedProduct.name}</h2>
                  <p className="result-brand">{recommendedProduct.brand}</p>
                  <p className="result-desc">{recommendedProduct.description}</p>

                  <div className="result-notes">
                    <p><strong>Top Notes:</strong> {recommendedProduct.top_notes}</p>
                    <p><strong>Heart Notes:</strong> {recommendedProduct.middle_notes}</p>
                    <p><strong>Base Notes:</strong> {recommendedProduct.base_notes}</p>
                  </div>

                  <div className="result-actions">
                    <button
                      className="gold-button solid"
                      onClick={() => {
                        addToCart(recommendedProduct, 1);
                        onClose();
                      }}
                    >
                      <ShoppingCart size={16} /> Add Signature to Cart - ₹{recommendedProduct.price.toLocaleString('en-IN')}
                    </button>
                    <button className="quiz-reset-btn" onClick={handleReset}>
                      <RefreshCw size={14} /> Retake Quiz
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-result">
                <h3>Our cellars are empty...</h3>
                <p>We could not find a matching perfume at this time. Please browse our collections directly.</p>
                <button className="gold-button" onClick={handleReset}>Try Again</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
