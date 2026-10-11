import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { StorefrontLayout } from './components/layout/StorefrontLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Core Storefront Landing Page (Immediate Bundle for Instant Initial Render & LCP)
import { HomePage } from './pages/storefront/HomePage';

// Lazy Loaded Secondary Storefront Pages (Code-Split per Route)
const ShopPage = lazy(() => import('./pages/storefront/ShopPage').then(m => ({ default: m.ShopPage })));
const CategoryPage = lazy(() => import('./pages/storefront/CategoryPage').then(m => ({ default: m.CategoryPage })));
const ProductDetailPage = lazy(() => import('./pages/storefront/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const SearchResultsPage = lazy(() => import('./pages/storefront/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));
const OffersPage = lazy(() => import('./pages/storefront/OffersPage').then(m => ({ default: m.OffersPage })));
const WishlistPage = lazy(() => import('./pages/storefront/WishlistPage').then(m => ({ default: m.WishlistPage })));
const CartPage = lazy(() => import('./pages/storefront/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/storefront/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./pages/storefront/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const PrintCenterPage = lazy(() => import('./pages/storefront/PrintCenterPage').then(m => ({ default: m.PrintCenterPage })));
const PrintServiceDetailPage = lazy(() => import('./pages/storefront/PrintServiceDetailPage').then(m => ({ default: m.PrintServiceDetailPage })));
const CmsPage = lazy(() => import('./pages/storefront/CmsPage').then(m => ({ default: m.CmsPage })));
const AccountPage = lazy(() => import('./pages/storefront/AccountPage').then(m => ({ default: m.AccountPage })));
const CustomerOrdersPage = lazy(() => import('./pages/storefront/CustomerOrdersPage').then(m => ({ default: m.CustomerOrdersPage })));
const LoginPage = lazy(() => import('./pages/storefront/LoginPage').then(m => ({ default: m.LoginPage })));
const NotFoundPage = lazy(() => import('./pages/storefront/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy Loaded Admin Pages (Code-Split: Only fetched on /admin navigation)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage').then(m => ({ default: m.AdminProductFormPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminBrandsPage = lazy(() => import('./pages/admin/AdminBrandsPage').then(m => ({ default: m.AdminBrandsPage })));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage').then(m => ({ default: m.AdminInventoryPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage').then(m => ({ default: m.AdminOrderDetailPage })));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage').then(m => ({ default: m.AdminCustomersPage })));
const AdminPromotionsPage = lazy(() => import('./pages/admin/AdminPromotionsPage').then(m => ({ default: m.AdminPromotionsPage })));
const AdminPrintServicesPage = lazy(() => import('./pages/admin/AdminPrintServicesPage').then(m => ({ default: m.AdminPrintServicesPage })));
const AdminPrintRequestsPage = lazy(() => import('./pages/admin/AdminPrintRequestsPage').then(m => ({ default: m.AdminPrintRequestsPage })));
const AdminPrintRequestDetailPage = lazy(() => import('./pages/admin/AdminPrintRequestDetailPage').then(m => ({ default: m.AdminPrintRequestDetailPage })));
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBannersPage').then(m => ({ default: m.AdminBannersPage })));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage').then(m => ({ default: m.AdminContentPage })));
const AdminPagesPage = lazy(() => import('./pages/admin/AdminPagesPage').then(m => ({ default: m.AdminPagesPage })));
const AdminNavigationPage = lazy(() => import('./pages/admin/AdminNavigationPage').then(m => ({ default: m.AdminNavigationPage })));
const AdminStaffPage = lazy(() => import('./pages/admin/AdminStaffPage').then(m => ({ default: m.AdminStaffPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminActivityLogsPage = lazy(() => import('./pages/admin/AdminActivityLogsPage').then(m => ({ default: m.AdminActivityLogsPage })));
import { ScrollToTop } from './components/common/ScrollToTop';

export const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Storefront Layout & Routes */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        {/* Category Legacy Alias */}
        <Route
          path="/category/electronics-and-mobile-accessories"
          element={<Navigate to="/category/electronics-and-mobile" replace />}
        />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        
        {/* Unified Order Confirmation & Tracking Routes */}
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
        <Route path="/track-order" element={<Navigate to="/order-confirmation" replace />} />

        {/* Print Center & Detailed Services */}
        <Route path="/print-center" element={<PrintCenterPage />} />
        <Route path="/print-service/:slug" element={<PrintServiceDetailPage />} />
        <Route path="/print-center/service/:slug" element={<PrintServiceDetailPage />} />

        {/* CMS Information Pages */}
        <Route path="/page/:slug" element={<CmsPage />} />
        <Route path="/pages/:slug" element={<CmsPage />} />

        {/* Account & Orders & Authentication */}
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/orders" element={<CustomerOrdersPage />} />
        <Route path="/login" element={<LoginPage initialTab="login" />} />
        <Route path="/register" element={<LoginPage initialTab="register" />} />

        {/* 404 Not Found within Storefront Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Dashboard Protected Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="brands" element={<Navigate to="/admin/products" replace />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="promotions" element={<AdminPromotionsPage />} />
        <Route path="printing/services" element={<AdminPrintServicesPage />} />
        <Route path="printing/requests" element={<AdminPrintRequestsPage />} />
        <Route path="printing/requests/:id" element={<AdminPrintRequestDetailPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="content" element={<AdminContentPage />} />
        <Route path="pages" element={<AdminPagesPage />} />
        <Route path="navigation" element={<AdminNavigationPage />} />
        <Route path="staff" element={<AdminStaffPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="activity-logs" element={<AdminActivityLogsPage />} />
      </Route>
    </Routes>
    </>
  );
};
