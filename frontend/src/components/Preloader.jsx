import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.jpg';
import './Preloader.css';

export default function Preloader({ onComplete }) {
  const [percent, setPercent] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('☿ SECURING ROYAL VAULT...');
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [logoMoved, setLogoMoved] = useState(false);
  const [telemetry, setTelemetry] = useState({
    pressure: '1013.2 hPa',
    temp: '14.8°C',
    humidity: '42.6%'
  });

  useEffect(() => {
    // 1. Progress Counter (0 to 100 over 9 seconds)
    // 100 ticks * 90ms = 9,000ms
    const progressInterval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 90);

    // 2. Status Progression
    const statuses = [
      { trigger: 0, text: '☿ UNLOCKING ROYAL VAULT...' },
      { trigger: 18, text: '🜔 EXTRACTING OUD & SAFFRON RESINS...' },
      { trigger: 38, text: '🜂 FRACTIONAL DISTILLATION IN PROGRESS [GRASSE, FR]...' },
      { trigger: 58, text: '🜏 STABILIZING MACERATIONS IN OAK CASKS...' },
      { trigger: 78, text: '🜄 SEALING CRYSTALLINE FLASKS...' },
      { trigger: 94, text: '✦ SECURING ASTRAIRE VAULT CURATION.' }
    ];

    // 3. Telemetry values fluctuation simulation
    const telemetryInterval = setInterval(() => {
      setTelemetry({
        pressure: (1012.8 + Math.random() * 0.8).toFixed(1) + ' hPa',
        temp: (14.5 + Math.random() * 0.6).toFixed(1) + '°C',
        humidity: (42.0 + Math.random() * 1.2).toFixed(1) + '%'
      });
    }, 1200);

    // 4. Logo fly transition unmount sequence at 9s (9,000ms)
    const fadeTimeout = setTimeout(() => {
      setIsFading(true);
      setLogoMoved(true); // Triggers logo fly-in transition to Navbar
      if (onComplete) onComplete();
    }, 9000);

    // 5. Remove overlay completely at 11.8s to allow 2.8s slow transition to finish
    const removeTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 11800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(telemetryInterval);
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
    };
  }, [onComplete]);

  // Handle active status text based on percent
  useEffect(() => {
    const statuses = [
      { trigger: 94, text: '✦ SECURING ASTRAIRE VAULT CURATION.' },
      { trigger: 78, text: '🜄 SEALING CRYSTALLINE FLASKS...' },
      { trigger: 58, text: '🜏 STABILIZING MACERATIONS IN OAK CASKS...' },
      { trigger: 38, text: '🜂 FRACTIONAL DISTILLATION [GRASSE, FR]...' },
      { trigger: 18, text: '🜔 COMPONENT MACERATION: OUD & SAFFRON...' },
      { trigger: 0, text: '☿ UNLOCKING ROYAL VAULT SEALS...' }
    ];
    const match = statuses.find(s => percent >= s.trigger);
    if (match) setLoadingStatus(match.text);
  }, [percent]);

  if (!isVisible) return null;

  // Calculate mock ingredient levels based on load percentage
  const oudLevel = Math.min(100, Math.round(percent * 1.2));
  const saffronLevel = Math.min(100, Math.round(Math.max(0, (percent - 20) * 1.3)));
  const roseLevel = Math.min(100, Math.round(Math.max(0, (percent - 40) * 1.4)));
  const santalLevel = Math.min(100, Math.round(Math.max(0, (percent - 60) * 1.5)));

  return (
    <div className={`preloader-overlay ${isFading ? 'fade-out' : ''}`}>
      {/* Matrix Cryptographic Grid background overlays */}
      <div className="preloader-grid-overlay"></div>
      
      {/* Left Column: Coordinates & Security Telemetry */}
      <div className="preloader-side-telemetry left animate-fade-in">
        <div className="telemetry-block">
          <span className="telemetry-label">VAULT LATITUDE</span>
          <span className="telemetry-value">43.6961° N (Grasse)</span>
        </div>
        <div className="telemetry-block">
          <span className="telemetry-label">CLEARANCE LEVEL</span>
          <span className="telemetry-value">ROYAL PRIVÉ V</span>
        </div>
        <div className="telemetry-block">
          <span className="telemetry-label">TEMPERATURE / PRES</span>
          <span className="telemetry-value">{telemetry.temp} / {telemetry.pressure}</span>
        </div>
        <div className="telemetry-block">
          <span className="telemetry-label">ATMOSPHERIC MOISTURE</span>
          <span className="telemetry-value">{telemetry.humidity}</span>
        </div>
        <div className="telemetry-block">
          <span className="telemetry-label">ALCHEMICAL KEY</span>
          <span className="telemetry-value">🜔 ASTRAIRE-OAK-VIII</span>
        </div>
      </div>

      {/* Center Section: Rotating Circles, Logo, and Progress */}
      <div className="preloader-center-panel">
        <div className="rotating-rings-mesh">
          <div className="mesh-ring ring-outer"></div>
          <div className="mesh-ring ring-middle"></div>
          <div className="mesh-ring ring-inner"></div>
          
          <div className="logo-gem-container">
            {!logoMoved ? (
              <motion.div 
                layoutId="logo-image-wrap" 
                className="logo-center-gem-wrap"
                transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <img src={logoImg} className="preloader-logo-img" alt="Astraire Logo" />
              </motion.div>
            ) : (
              <div className="logo-center-gem-wrap-placeholder" />
            )}
          </div>
        </div>

        <h1 className="preloader-brand">ASTRAIRE</h1>
        <p className="preloader-subtitle">HAUTE PARFUMERIE</p>

        {/* Real-time ticks counter */}
        <div className="preloader-percent-counter">
          <span className="percent-num">{String(percent).padStart(3, '0')}</span>
          <span className="percent-symbol">%</span>
        </div>

        <div className="loader-line-wrapper">
          <div className="loader-line" style={{ width: `${percent}%` }}></div>
        </div>

        <span className="loader-text-status">{loadingStatus}</span>
      </div>

      {/* Right Column: Distillation ratios */}
      <div className="preloader-side-telemetry right animate-fade-in">
        <div className="telemetry-block">
          <span className="telemetry-label">ALCHEMICAL MATRIX BALANCE</span>
        </div>
        
        {/* Ingredient 1 */}
        <div className="ingredient-progress-bar">
          <div className="bar-labels">
            <span>🜏 Cambodian Oud Abs</span>
            <span>{oudLevel}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${oudLevel}%` }}></div>
          </div>
        </div>

        {/* Ingredient 2 */}
        <div className="ingredient-progress-bar">
          <div className="bar-labels">
            <span>🜔 Damascena Rose Abs</span>
            <span>{roseLevel}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${roseLevel}%` }}></div>
          </div>
        </div>

        {/* Ingredient 3 */}
        <div className="ingredient-progress-bar">
          <div className="bar-labels">
            <span>🜂 Kashmeran Saffron</span>
            <span>{saffronLevel}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${saffronLevel}%` }}></div>
          </div>
        </div>

        {/* Ingredient 4 */}
        <div className="ingredient-progress-bar">
          <div className="bar-labels">
            <span>🜄 Mysore Sandalwood</span>
            <span>{santalLevel}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${santalLevel}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
