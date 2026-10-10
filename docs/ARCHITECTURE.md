# Al Mostafa Mall — Software Architecture & Technical Design

## 1. Executive Architecture Summary

**Al Mostafa Mall (مول المصطفى)** is an Arabic-first (RTL) retail e-commerce platform and management system inspired by the digital retail experience and information architecture of **B.TECH (`btech.com/ar`)**. The system unites a dynamic multi-category retail storefront with a dedicated industrial printing service center (**مركز الطباعة المتخصص**) and a comprehensive Admin ERP Dashboard.

---

## 2. Technology Stack & Key Decisions

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** + **TypeScript** | Strict component contracts, fast reconciliation, state ergonomics. |
| **Build & Dev Tooling** | **Vite 6** | Sub-second HMR, optimized Rollup bundling, pure ES modules. |
| **Styling & Design Tokens** | **Tailwind CSS 3** (Custom RTL Config) | Pure Arabic typography with Cairo & Noto Sans Arabic, logical flex/grid properties (`start`/`end`), B.TECH-inspired color harmony (`#0b2545` deep navy, `#f59e0b` warm gold). |
| **Iconography** | **Lucide Icons** | Semantic SVG icons with bidirectional RTL orientation. |
| **Routing & Navigation** | **React Router v7** | Client-side routing, nested layouts, role guards, parameter management. |
| **Data Layer (Hybrid)** | **Supabase PostgreSQL** + **Local Engine (`dbStore`)** | Production-ready SQL migrations with RLS policies, coupled with a full-fidelity client-side relational store backed by `localStorage` for frictionless evaluation and zero-latency demo capability. |

---

## 3. Structural Information Architecture

```
Al Mostafa Mall
├── Storefront (Client-Facing RTL Experience)
│   ├── Header
│   │   ├── Top Announcement Bar (Configurable with dismiss)
│   │   ├── Utility Row (Egypt Delivery Location Modal, Hot Deals, Order Tracking, Customer Service)
│   │   ├── Main Row (Official Mall Vector Logo, Arabic-Normalized Live Search, Account, Wishlist, Cart Drawer)
│   │   └── Category Navigation Bar (Mega-Menu Drawer with All 8 Departments + Subcategories)
│   ├── Homepage Merchandising
│   │   ├── Hero Carousel (3:1 Desktop / 1.5:1 Mobile Ratio)
│   │   ├── 8-Department Circular Quick-Discovery Grid
│   │   ├── Curated Flash Deals Shelf (Countdown, Stock Meter, Real Discounts)
│   │   ├── Dedicated Printing Center Banner & Service Highlights
│   │   ├── Curated Best Sellers & New Arrivals Shelves
│   │   ├── Official Brand Shop Slider (HP, Dell, Samsung, Dettol, Faber-Castell, etc.)
│   │   └── Trust & Warranty Badges
│   ├── Product Discovery & Catalog (Shop & Category Pages)
│   │   ├── Multivariate Sidebar (Price range, in-stock only, brands, subcategories, sort)
│   │   ├── Product Cards (Square 1:1 image, genuine discount pill, stock alert, quick view modal)
│   │   └── Breadcrumbs & Responsive Pagination
│   ├── Product Detail Page (PDP)
│   │   ├── High-Resolution Image Gallery & Thumbnail Selector
│   │   ├── Product Specifications Table & Arabic Normalized Attributes
│   │   ├── Variant Selector (Color, Size, Capacity, Pack)
│   │   ├── Real-time Inventory Status (< 5 units = Urgent Warning)
│   │   ├── WhatsApp Direct Inquiry Pre-populated Message
│   │   └── Add to Cart / Buy Now with Coupon Validation
│   ├── Specialized Printing Center
│   │   ├── 5 Dedicated Service Lines (Documents, Engineering Plans, Marketing Banners, Photo Albums, Business Cards)
│   │   ├── Dynamic Calculation Engine (Paper size, binding, orientation, copies, SQM)
│   │   ├── Secure File Attachment Interface (PDF, AI, PSD, DOCX, ZIP)
│   │   └── Honest Quotation Workflow with Immediate Confirmation Number
│   ├── Cart & Checkout
│   │   ├── Free Shipping Progress Meter (Threshold configurable in Admin)
│   │   ├── Active Promo Code Validator
│   │   ├── Egyptian Governorates & Phone Validation (010, 011, 012, 015)
│   │   └── Flexible Payment Methods (Cash on Delivery, InstaPay, Vodafone Cash)
│   └── Customer Portal
│       ├── Order History with Timeline Progress
│       ├── Print Quotation Tracker
│       └── Address Book & Contact Profiles
│
└── Admin ERP Dashboard (`/admin`)
    ├── Authorization & Role-Based Access Control (RBAC)
    ├── Dashboard Overview (Real KPIs, Low Stock Warnings, Today's Sales)
    ├── Catalog & Products CRUD (Full attribute, variant, image, and pricing control)
    ├── Categories Tree & Brand Management
    ├── Inventory Ledger & Stock Movement Audit (`InventoryMovement` tracking)
    ├── Orders Management & 7-Stage Lifecycle Timeline
    ├── Dedicated Print Services Configuration & Request Quotation Review
    ├── Customers Database & Spending History
    ├── Promotions & Discount Coupons Engine
    ├── Hero Banners & Homepage Layout Editor
    ├── CMS Pages (About, Terms, Privacy, Delivery, Print Guidelines)
    ├── Navigation Menus Customization
    ├── Staff Members & Privilege Assignment
    ├── Sales Analytics & Business Intelligence
    └── Store Settings (Flat rates, WhatsApp line, address, logo, database reset)
```

---

## 4. State Management & Data Flow

1. **`StoreSettingsContext`**: Holds dynamic store-level settings (shipping rates, free shipping threshold, customer support WhatsApp, logo URL, announcement banner).
2. **`CartContext`**: Maintains cart items in `localStorage`, verifies real-time stock levels, executes coupon discounts, and calculates Egyptian VAT and delivery fees.
3. **`WishlistContext`**: Stores saved items locally with instant toggle feedback.
4. **`AuthContext`**: Manages user session and role authorization (`super_admin`, `catalog_manager`, `order_manager`, `printing_staff`, `content_manager`, `customer`).
5. **`dbStore` (Relational Client Engine)**: Provides synchronized data access across all storefront and admin screens with persistence in `localStorage`.
