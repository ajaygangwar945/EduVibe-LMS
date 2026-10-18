import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="ambient-background" aria-hidden="true">
      <div className="ambient-orb orb-crimson" />
      <div className="ambient-orb orb-azure" />
      <div className="ambient-orb orb-violet" />
      <div className="ambient-orb orb-emerald" />
      <div className="ambient-orb orb-amber" />
      <div className="ambient-grid-overlay" />
    </div>
  );
}
