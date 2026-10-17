import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { SendoraCard } from '../components/SendoraCard.jsx';
import { ActivityPanel } from '../features/activity/ActivityPanel.jsx';
import { SponsorLogos } from '../components/SponsorLogos.jsx';
import leftHandImg from '../assets/left_hand-removebg-preview.png';
import rightHandImg from '../assets/right_hand-removebg-preview.png';

export function HomePage({ defaultMode }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial mode based on prop or URL path
  const [mode, setMode] = useState(() => {
    if (defaultMode) return defaultMode;
    if (location.pathname === '/receive') return 'receive';
    if (location.pathname === '/activity') return 'activity';
    return 'send';
  });

  useEffect(() => {
    if (location.pathname === '/receive') {
      setMode('receive');
    } else if (location.pathname === '/activity') {
      setMode('activity');
    } else if (location.pathname === '/send') {
      setMode('send');
    }
  }, [location.pathname]);

  function handleModeChange(newMode) {
    setMode(newMode);
    const target =
      newMode === 'receive'
        ? '/receive'
        : newMode === 'activity'
          ? '/activity'
          : '/send';
    if (location.pathname !== target) {
      navigate(target);
    }
  }

  return (
    <div className="sendora-landing">
      {/* Floating Sticky Header */}
      <Navbar activeMode={mode} onSwitchMode={handleModeChange} />

      {/* Screen-anchored Hands Layer (Adapts dynamically to all zoom levels & resolutions) */}
      <div className="hands-viewport-layer" aria-hidden="true">
        <div className="hand-container hand-container-left">
          <img
            src={leftHandImg}
            alt=""
            className="art-hand art-hand-left"
          />
        </div>
        <div className="hand-container hand-container-right">
          <img
            src={rightHandImg}
            alt=""
            className="art-hand art-hand-right"
          />
        </div>
      </div>

      {/* Hero Content Area */}
      <main className="hero-main">
        {/* Hero Headings */}
        <div className="hero-headings">
          <p className="eyebrow-badge">
            #1 LEADING FILE TRANSFER PLATFORM
          </p>
          <h1 className="hero-headline">
            {mode === 'send'
              ? 'Send large files – Free & secure'
              : mode === 'receive'
                ? 'Receive files fast – Secure & simple'
                : 'Your transfer activity'}
          </h1>
        </div>

        {/* Center Stage: Card */}
        <div className="hero-stage">
          <div className="center-card-container">
            {mode === 'activity' ? (
              <ActivityPanel />
            ) : (
              <SendoraCard mode={mode} onModeChange={handleModeChange} />
            )}
          </div>
        </div>
      </main>

      {/* Bottom Sponsor Logos */}
      <footer className="sendora-footer">
        <SponsorLogos />
      </footer>
    </div>
  );
}
