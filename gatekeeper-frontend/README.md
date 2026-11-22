# GateKeeper Control Plane · React Frontend

A production-grade, state-of-the-art React frontend for the GateKeeper API Management & Smart Gateway platform.

Designed to replace legacy static assets with a modular, responsive, and aesthetically stunning control-plane interface.

---

## 🌟 Key Highlights & Design System

- **Design Aesthetic**: Premium dark emerald theme (`#183e32`) paired with vibrant lime accent (`#c9f66f`) and warm paper surfaces (`#f6f4ed`), inspired by world-class infrastructure tools like Linear, Stripe, and Cloudflare.
- **Micro-Animations & Smooth States**: Subtle hover micro-animations, glowing status indicators, modal transitions, and non-blocking toast notifications.
- **Zero Third-Party CSS Bloat**: Built with vanilla CSS design tokens, custom responsive layouts, and standard accessible HTML5 semantics.
- **Iconography**: Clean, crisp SVG vector icons via `lucide-react`.
- **Integrated Reverse Proxy**: Vite configured to proxy `/api/*` requests directly to Spring Boot `api-management-service` at `http://localhost:8081`.

---

## 👥 Role-Based Workspaces

### 1. Platform Administrator (`PLATFORM_ADMIN`)
- **Control Plane Overview**: Real-time KPI counters for Total Tenants, Active Tenants, and Tenants Awaiting Action (Pending + Suspended).
- **Tenant Directory**:
  - Live search across organization names, URL slugs, and IDs.
  - In-place lifecycle status updater (`PENDING`, `ACTIVE`, `SUSPENDED`) via `PATCH /api/platform/organizations/{id}/status`.
  - Provision new organizations with automatic hyphenated slug generators.
  - Edit organization metadata.
  - Soft-delete organizations.
- **Tenant Administrator Management**:
  - Provision or update dedicated tenant admin management accounts per organization.
  - Configure initial or updated passwords.
  - Enable / disable accounts to guard access boundaries.
  - Delete tenant administrators.

### 2. Tenant Administrator (`TENANT_ADMIN`)
- **Tenant Control Plane Overview**: Metrics for Total Routes, Active Routes on Data Plane, and Policy-Protected Routes.
- **Route Management**:
  - Filter and search routes by route ID, display name, or public path pattern.
  - Quick single-click activate / deactivate toggle switch calling `PATCH /api/tenant/route/{id}/status`.
  - Comprehensive Route Builder & Editor:
    - Route Identity: Route ID, Display Name, Public Path Pattern, Target Base URL, Target Path Prefix.
    - Traffic Policies: Rate Limiting (req/min), Response Timeout (ms), Allowed HTTP Methods chip selector (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD), Idempotency protection toggle, Active switch.
    - Dynamic Header Transformation Repeater: Direction (`REQUEST` / `RESPONSE`), Action (`ADD` / `REMOVE`), Header Name, and Header Value.
- **Configuration Version History**:
  - Chronological timeline of route revisions from `GET /api/tenant/route-versions/{routeId}`.
  - Expandable JSON snapshot viewer with formatting and instant "Copy JSON" button.
- **My Organization Profile**:
  - Inspect tenant ID, URL prefix slug, lifecycle status, provisioned timestamp, and last updated timestamp.
  - Update public display name via `PUT /api/tenant/organization`.
- **Operator Audit Log**:
  - Searchable and chronological record of all tenant mutations from `GET /api/tenant/audit-records`.
  - Correlation ID tracking (`X-Correlation-ID`) across data and control planes.
  - Detailed modal inspector for execution duration (ms), actor, result, and raw payloads.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node `v24.16.0`)
- `api-management-service` running on `http://localhost:8081`

### Installation & Run

```bash
cd gatekeeper-frontend

# Install dependencies
npm install

# Start Vite dev server with proxy to backend
npm run dev
```

The application will be live at `http://localhost:5173/`.

### Demo Quick Logins

| Role | Username | Password |
|---|---|---|
| Platform Admin | `platform-admin` | `platform123` |
| FoodFast Admin | `foodfast-admin` | `foodfast123` |
| QuickShop Admin | `quickshop-admin` | `quickshop123` |

### Production Build

```bash
npm run build
```

Production bundle will be compiled to `dist/`.
