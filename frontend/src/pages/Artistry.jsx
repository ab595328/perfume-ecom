import React from 'react';
import { Compass, ShieldCheck, Sparkles, Heart } from 'lucide-react';
import './Artistry.css';

export default function Artistry() {
  return (
    <div className="artistry-page container animate-fade">
      <div className="artistry-header">
        <span className="section-subtitle">THE MAISON</span>
        <h1>Olfactory Artistry & Story</h1>
        <div className="title-underline"></div>
        <p className="artistry-intro">
          We do not manufacture perfumes; we capture moments in liquid form. Discover the methods, ingredients, and philosophies behind Astraire.
        </p>
      </div>

      {/* Philosophy Section */}
      <section className="philosophy-section glass-panel">
        <div className="philosophy-content">
          <h2>The Extraction Craft</h2>
          <p>
            Each perfume begins its life in the soil. We partner with multi-generational estates in Grasse, France for our Damask Rose and Jasmine, and sustainably harvest wild resinous wood from Cambodia for our premium Oud extracts.
          </p>
          <p>
            Our master perfumers utilize two primary extraction methods: steam distillation to capture the airy, clean top notes, and cold solvent extraction to preserve the dense, narcotic heart notes of delicate blossoms that would otherwise be destroyed by heat.
          </p>
        </div>
        <div className="philosophy-image">
          <img src="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=600&auto=format&fit=crop" alt="Extraction copper still" />
        </div>
      </section>

      {/* Rare Ingredients Dictionary */}
      <section className="ingredients-library">
        <div className="section-header">
          <span className="section-subtitle">THE PHARMACOPOEIA</span>
          <h2>Rare Ingredients Library</h2>
          <div className="title-underline"></div>
        </div>

        <div className="ingredients-grid">
          <div className="ingredient-card glass-panel">
            <h3>Cambodian Oud</h3>
            <span className="ingredient-origin">Origin: Cardamom Mountains, Cambodia</span>
            <p>Known as "liquid gold," agarwood resin is harvested only from trees infected with a specific pre-mould. Earthy, deep, animalic, and highly complex.</p>
          </div>

          <div className="ingredient-card glass-panel">
            <h3>Damask Rose</h3>
            <span className="ingredient-origin">Origin: Valley of Roses, Bulgaria & Grasse</span>
            <p>Picked only at dawn before the sun dries the essential oils in the petals. It takes approximately 4,000 kilograms of petals to yield just one kilogram of pure rose oil.</p>
          </div>

          <div className="ingredient-card glass-panel">
            <h3>Florentine Iris</h3>
            <span className="ingredient-origin">Origin: Tuscany, Italy</span>
            <p>The scent is extracted not from the flower, but from the root (orris). The rhizomes must be aged in dark rooms for three to five years before distillation. Powdery, violet-like, and warm.</p>
          </div>

          <div className="ingredient-card glass-panel">
            <h3>Haitian Vetiver</h3>
            <span className="ingredient-origin">Origin: Les Cayes, Haiti</span>
            <p>A perennial grass with complex root systems. It offers a smoky, woody, and slightly sweet aroma with green, damp earth nuances. Excellent fixative base note.</p>
          </div>
        </div>
      </section>

      {/* The Aging Vault */}
      <section className="vault-section glass-panel">
        <div className="vault-image">
          <img src="https://images.unsplash.com/photo-1563170351-be82bc888aa4?q=80&w=600&auto=format&fit=crop" alt="Maceration casks" />
        </div>
        <div className="vault-content">
          <h2>The Oak Cask Maceration</h2>
          <p>
            Unlike mass-market perfumes that are bottled immediately, all Astraire Extraits de Parfum undergo a minimum of 180 days of maturation.
          </p>
          <p>
            We age the fragrance oil concentrate in historic Limousin oak casks, allowing the complex notes to blend, soften, and develop a unique woody depth. This maceration process mimics the aging of fine cognacs, resulting in unparalleled skin longevity and a smooth olfactory profile.
          </p>
        </div>
      </section>
    </div>
  );
}
