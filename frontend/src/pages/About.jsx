import React from 'react';
import { Shield, Sparkles, Heart, Award } from 'lucide-react';
import './About.css';

export default function About() {
  return (
    <div className="about-page container animate-fade">
      {/* Hero Header */}
      <div className="about-header reveal-item stagger-1">
        <span className="section-subtitle">OUR HERITAGE</span>
        <h1>Astraire Maison de Parfum</h1>
        <div className="title-underline"></div>
        <p className="about-intro">
          We do not manufacture fragrances; we bottle memories, emotions, and sensory echoes in liquid form. Established with the vision of restoring pure artistry to olfactory curation, Astraire represents the pinnacle of contemporary haute parfumerie.
        </p>
      </div>

      {/* The Story Section */}
      <section className="about-section glass-panel reveal-item stagger-2">
        <div className="about-content">
          <h2>The Genesis of Astraire</h2>
          <p>
            Founded in the historic mist-covered valleys of Grasse and guided by master olfactory curators, Astraire was born out of a rebellion against mass-market synthetic duplication. We believe a signature scent should be intimate—designed for those who speak in whispers, not screams.
          </p>
          <p>
            Each formulation is an original piece of poetry developed over months of sensory experimentation. We search the globe to extract the rarest natural materials, creating private reserves that develop uniquely on each wearer's skin chemistry.
          </p>
        </div>
        <div className="about-image">
          <img src="https://images.unsplash.com/photo-1541443131876-44b03de101c5?q=80&w=800&auto=format&fit=crop" alt="Extraction and blending" />
        </div>
      </section>

      {/* The Maturation Vault */}
      <section className="about-section reverse glass-panel reveal-item stagger-3">
        <div className="about-image">
          <img src="https://images.unsplash.com/photo-1563170351-be82bc888aa4?q=80&w=800&auto=format&fit=crop" alt="Maceration Vault casks" />
        </div>
        <div className="about-content">
          <h2>Limousin Oak Cask Maceration</h2>
          <p>
            Unlike commercial scents that are chemical-diluted and instantly bottled, all Astraire Extraits de Parfum undergo a strict maturation process. Our concentrates are aged in historic Limousin oak casks for a minimum of 180 days.
          </p>
          <p>
            This ancient maceration method allow notes to soften, mature, and absorb subtle wood elements from the barrel walls, resulting in a rich, multi-tiered evolution on the skin and an unparalleled longevity exceeding 12 hours.
          </p>
        </div>
      </section>

      {/* Ingredients Section */}
      <section id="ingredients" className="ingredients-library-section">
        <div className="section-header">
          <span className="section-subtitle">THE PHARMACOPOEIA</span>
          <h2>The Noble Botanicals</h2>
          <div className="title-underline"></div>
          <p className="section-intro-desc">
            We ethically source raw materials directly from heritage estates, supporting sustainable harvesting and protecting local flora ecosystem.
          </p>
        </div>

        <div className="ingredients-narrative-grid">
          <div className="ingredient-card glass-panel reveal-item stagger-1">
            <h3>Cambodian Agarwood (Oud)</h3>
            <span className="ingredient-tag">Origin: Cardamom Mountains</span>
            <p>
              Harvested by hand from aquilaria trees. The wood produces a dark resin in response to a rare fungus. This produces a complex, dry, woody, and leathery absolute known as "liquid gold".
            </p>
          </div>

          <div className="ingredient-card glass-panel reveal-item stagger-2">
            <h3>Bulgarian Damask Rose</h3>
            <span className="ingredient-tag">Origin: Valley of Roses</span>
            <p>
              Harvested only at dawn when the petals contain the highest density of oil. It takes 4,000 kilograms of rose petals to produce just one single kilogram of our pure velvet absolute rose oil.
            </p>
          </div>

          <div className="ingredient-card glass-panel reveal-item stagger-3">
            <h3>Florentine Orris Root</h3>
            <span className="ingredient-tag">Origin: Tuscany, Italy</span>
            <p>
              Orris is extracted from the dried roots of the iris flower, which must age in dark wooden chambers for three full years before steam distillation. It yields a powdery, earthy, and warm finish.
            </p>
          </div>

          <div className="ingredient-card glass-panel reveal-item stagger-4">
            <h3>Haitian Vetiver</h3>
            <span className="ingredient-tag">Origin: Les Cayes, Haiti</span>
            <p>
              Woven from the complex roots of vetiver grass, providing a green, damp-earth aroma with rich smoky undertones. Sourced through certified fair-trade agricultural unions.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Values Info Grid */}
      <section className="about-values">
        <div className="value-box glass-panel reveal-item stagger-1">
          <Shield className="gold-icon" size={32} />
          <h3>100% Extrait Concentration</h3>
          <p>We craft exclusively in high-concentration perfume oils, avoiding generic alcohol dilutes for enduring longevity.</p>
        </div>
        <div className="value-box glass-panel reveal-item stagger-2">
          <Sparkles className="gold-icon" size={32} />
          <h3>Oak Cask Maturation</h3>
          <p>Matured in oak barrels, blending complex notes for a velvety, smooth profile that evolves continuously on skin.</p>
        </div>
        <div className="value-box glass-panel reveal-item stagger-3">
          <Heart className="gold-icon" size={32} />
          <h3>Cruelty Free & Vegan</h3>
          <p>Committed to zero animal derivatives or testing, choosing ethical botanical origins for our blends.</p>
        </div>
        <div className="value-box glass-panel reveal-item stagger-4">
          <Award className="gold-icon" size={32} />
          <h3>Certified Curation</h3>
          <p>Each decant is signed and sealed with a custom wax stamp, wrapped in our signature presentation boxes.</p>
        </div>
      </section>
    </div>
  );
}
