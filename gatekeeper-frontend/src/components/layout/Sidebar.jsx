import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Route,
  Building,
  History,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function getInitials(name) {
  if (!name) return 'GK';
  return name
    .split(/[-_.\s]+/)
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function humanRole(role) {
  return role === 'PLATFORM_ADMIN' ? 'Platform admin' : 'Tenant admin';
}

export default function Sidebar({ currentSection, onNavigate, isOpen, onCloseMobile }) {
  const { username, role, isPlatformAdmin, logout } = useAuth();

  const navItems = isPlatformAdmin
    ? [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'organizations', label: 'Organizations', icon: Building2 },
      ]
    : [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'routes', label: 'Routes', icon: Route },
        { id: 'profile', label: 'My organization', icon: Building },
        { id: 'audit', label: 'Audit records', icon: History },
      ];

  const handleNavClick = (e, id) => {
    e.preventDefault();
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <a
          className="brand"
          href="#overview"
          onClick={(e) => handleNavClick(e, 'overview')}
        >
          <span className="brand-mark" aria-hidden="true">GK</span>
          <span>GateKeeper</span>
        </a>

        <nav className="navigation" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, item.id)}
              >
                <span className="nav-icon">
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="avatar" aria-hidden="true">
            {getInitials(username)}
          </div>
          <div className="user-meta">
            <strong>{username}</strong>
            <span>{humanRole(role)}</span>
          </div>
          <button
            type="button"
            className="signout-button"
            onClick={() => logout()}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
