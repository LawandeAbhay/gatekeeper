import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import LoginView from './components/auth/LoginView';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Platform Views
import PlatformOverview from './components/platform/PlatformOverview';
import OrganizationsList from './components/platform/OrganizationsList';
import { getOrganizations } from './api/platform';

// Tenant Views
import TenantOverview from './components/tenant/TenantOverview';
import RoutesList from './components/tenant/RoutesList';
import OrganizationProfile from './components/tenant/OrganizationProfile';
import AuditLog from './components/tenant/AuditLog';
import { getTenantOrganization, getTenantRoutes, getAuditRecords } from './api/tenant';

const TITLES = {
  overview: 'Overview',
  organizations: 'Organizations',
  routes: 'Routes',
  profile: 'My organization',
  audit: 'Audit records',
};

function getSectionFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  return hash || 'overview';
}

function MainWorkspace() {
  const { isPlatformAdmin, isTenantAdmin } = useAuth();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(getSectionFromHash);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Synchronize hash changes
  useEffect(() => {
    function handleHashChange() {
      const sec = getSectionFromHash();
      setCurrentSection(sec);
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = useCallback((section) => {
    window.location.hash = section;
    setCurrentSection(section);
  }, []);

  // Platform state
  const [organizations, setOrganizations] = useState([]);
  const [platformLoading, setPlatformLoading] = useState(false);

  // Tenant state
  const [tenantOrg, setTenantOrg] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [audits, setAudits] = useState([]);
  const [tenantLoading, setTenantLoading] = useState(false);

  // Load platform data
  const loadPlatformData = useCallback(async () => {
    setPlatformLoading(true);
    try {
      const data = await getOrganizations();
      setOrganizations(data || []);
    } catch (err) {
      toast('Failed to load organizations', err.message, true);
    } finally {
      setPlatformLoading(false);
    }
  }, [toast]);

  // Load tenant data
  const loadTenantData = useCallback(async () => {
    setTenantLoading(true);
    try {
      const [org, rts, aud] = await Promise.all([
        getTenantOrganization().catch(() => null),
        getTenantRoutes().catch(() => []),
        getAuditRecords().catch(() => []),
      ]);
      setTenantOrg(org);
      setRoutes(rts || []);
      setAudits(aud || []);
    } catch (err) {
      toast('Failed to load tenant data', err.message, true);
    } finally {
      setTenantLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isPlatformAdmin) {
      loadPlatformData();
    } else if (isTenantAdmin) {
      loadTenantData();
    }
  }, [isPlatformAdmin, isTenantAdmin, loadPlatformData, loadTenantData]);

  const pageTitle = TITLES[currentSection] || 'Control plane';

  return (
    <div className="app-shell">
      <Sidebar
        currentSection={currentSection}
        onNavigate={navigateTo}
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="workspace">
        <Navbar
          currentSection={currentSection}
          title={pageTitle}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />

        <main className="page-content">
          {isPlatformAdmin && (
            <>
              {currentSection === 'overview' && (
                <PlatformOverview
                  organizations={organizations}
                  onNavigate={navigateTo}
                />
              )}
              {currentSection === 'organizations' && (
                <OrganizationsList
                  organizations={organizations}
                  loading={platformLoading}
                  onRefresh={loadPlatformData}
                />
              )}
            </>
          )}

          {isTenantAdmin && (
            <>
              {currentSection === 'overview' && (
                <TenantOverview
                  routes={routes}
                  organization={tenantOrg}
                  audits={audits}
                  onNavigate={navigateTo}
                />
              )}
              {currentSection === 'routes' && (
                <RoutesList
                  routes={routes}
                  organization={tenantOrg}
                  loading={tenantLoading}
                  onRefresh={loadTenantData}
                />
              )}
              {currentSection === 'profile' && (
                <OrganizationProfile
                  organization={tenantOrg}
                  onRefresh={loadTenantData}
                />
              )}
              {currentSection === 'audit' && (
                <AuditLog
                  audits={audits}
                  loading={tenantLoading}
                  onRefresh={loadTenantData}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainWorkspace /> : <LoginView />;
}
