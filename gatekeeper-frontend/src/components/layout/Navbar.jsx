import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ currentSection, title, onToggleMobileMenu }) {
  const { role, isPlatformAdmin } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <Menu size={20} />
        </button>
        <div className="topbar-titles">
          <p className="eyebrow">
            GATEKEEPER / {isPlatformAdmin ? 'PLATFORM' : 'TENANT'}
          </p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="topbar-meta">
        <span className="live-indicator">
          <i aria-hidden="true" />
          <span>API connected</span>
        </span>
        <span className="role-badge">{role}</span>
      </div>
    </header>
  );
}
