import React, { useState, useEffect } from 'react';
import './Preloader.css';

export default function Preloader() {
  const [loadingText, setLoadingText] = useState('Initiating Vault...');
  const [percent, setPercent] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Elegant text transitions
    const texts = [
      'Initiating Vault...',
      'Unlocking Reserve Accords...',
      'Maturing Extrait Formulations...',
      'Astraire Curation Secured.'
    ];
    
    let textIndex = 0;
    const textInterval = setInterval(() => {
      if (textIndex < texts.length - 1) {
        textIndex++;
        setLoadingText(texts[textIndex]);
      }
    }, 450);

    // Progressive loader percent
    const progressInterval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    // Fading and unmounting timeout
    const fadeTimeout = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    const removeTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 2550);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`preloader-overlay ${isFading ? 'fade-out' : ''}`}>
      <div className="preloader-content">
        <div className="luxury-logo-pulse">
          <div className="logo-ring ring-1"></div>
          <div className="logo-ring ring-2"></div>
          <div className="logo-center-gem"></div>
        </div>
        <h1 className="preloader-brand">ASTRAIRE</h1>
        <p className="preloader-subtitle">HAUTE PARFUMERIE</p>
        
        <div className="loader-line-wrapper">
          <div className="loader-line" style={{ width: `${percent}%` }}></div>
        </div>
        
        <span className="loader-text-status">{loadingText}</span>
      </div>
    </div>
  );
}
