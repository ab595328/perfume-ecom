import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import './FAQ.css';

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "What makes Astraire extraits different from commercial perfumes?",
      a: "Astraire crafts exclusively in Extrait de Parfum concentration—the highest tier in fine perfumery containing 20-30% pure essential oils. Unlike mass-market fragrances diluted with high concentrations of water and synthetic denatured alcohol, our formulations are hand-blended, organic-based, and matured in oak casks. This provides a deep, evolving skin transition and extreme longevity."
    },
    {
      q: "What is the Limousin oak cask maceration process?",
      a: "Before bottling, our compounded perfume oil concentrates mature inside vintage Limousin oak casks for a minimum of 180 days. This allows raw botanical elements to mature, softening harsh molecules while absorbing subtle warm wood details from the oak casks. This Cognac-like maturation guarantees Astraire's complex, rich depth."
    },
    {
      q: "Are your ingredients ethically and sustainably sourced?",
      a: "Yes. Astraire works directly with family estates and fair-trade cooperatives globally. Our Bulgarian Damask Rose is harvested at dawn in Grasse partner fields, and our Cambodian Agarwood (Oud) is sustainably drawn from wild resinous aquilaria wood in the Cardamom Mountains. We support biodiverse farming and refuse synthetic duplications."
    },
    {
      q: "How long will an Astraire perfume last on my skin?",
      a: "Due to our high Extrait oil density, Astraire fragrances average a longevity of 12 to 16 hours. The base notes (Oud, Amber, Oakmoss, Orris) often persist on fabric for days. Longevity varies slightly depending on skin hydration and warmth."
    },
    {
      q: "How do you handle secure shipping for these premium bottles?",
      a: "Each crystal bottle is sealed in custom velvet linings inside wax-stamped luxury boxes. We ship all orders inside armored carton transit packaging using fully insured, signature-required premium courier delivery services to guarantee safe arrival."
    },
    {
      q: "What is your returns policy for private curations?",
      a: "Due to the artisanal, limited-batch nature of Astraire Extraits, opened bottles cannot be returned. However, every order includes a complimentary 2ml sample vial of the purchased scent. We highly recommend testing the sample vial on your skin first. If the scent profile is not your signature, you can return the unopened 100ml crystal bottle within 14 days for a full refund or exchange."
    }
  ];

  return (
    <div className="faq-page container animate-fade">
      {/* Header */}
      <div className="faq-header reveal-item stagger-1">
        <span className="section-subtitle">CONCIERGE DESK</span>
        <h1>Olfactory FAQ & Cares</h1>
        <div className="title-underline"></div>
        <p className="faq-intro">
          Learn about our compounding values, delivery security, application advice, and private vault client returns.
        </p>
      </div>

      {/* Accordion List */}
      <div className="faq-accordion-container">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <div key={index} className={`faq-item glass-panel reveal-item stagger-${(index % 5) + 1} ${isOpen ? 'open' : ''}`}>
              <button className="faq-trigger" onClick={() => toggleAccordion(index)} aria-expanded={isOpen}>
                <div className="faq-question-row">
                  <HelpCircle size={18} className="gold-icon" />
                  <h3>{faq.q}</h3>
                </div>
                <div className="faq-icon-wrapper">
                  {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </div>
              </button>
              <div className="faq-answer-pane">
                <p>{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Care Box */}
      <div className="faq-concierge-footer glass-panel reveal-item stagger-4">
        <h3>Still seeking guidance?</h3>
        <p>Our olfactory experts are available to guide your fragrance selection or resolve custom requests.</p>
        <a href="/contact" className="gold-button">Contact Client Concierge</a>
      </div>
    </div>
  );
}
