import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Award, 
  Boxes, 
  ShoppingCart, 
  Users, 
  Percent, 
  Printer, 
  FileText, 
  Image, 
  Layers, 
  Compass, 
  UserCheck, 
  BarChart3, 
  Settings, 
  History, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert 
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout, can } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Authorization Guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-right">
        <div className="bg-white rounded-3xl border border-red-200 shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto" />
          <h2 className="text-xl font-black text-gray-900">غير مصرح بالدخول</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            هذه المنطقة مخصصة حصرياً لفريق إدارة مول المصطفى. يرجى تسجيل الدخول بحساب مسؤول للمتابعة.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/account"
              className="w-full py-2.5 bg-mall-900 text-white rounded-xl text-xs font-bold"
            >
              تسجيل الدخول كمسؤول
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
            >
              العودة للمتجر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  interface NavLinkItem {
    path: string;
    label: string;
    icon: React.ElementType;
    permission?: import('../../types').StaffPermission;
  }

  interface NavGroup {
    title: string;
    links: NavLinkItem[];
  }

  const rawNavGroups: NavGroup[] = [
    {
      title: 'الرئيسية والمؤشرات',
      links: [
        { path: '/admin', label: 'لوحة المؤشرات العامة', icon: LayoutDashboard },
        { path: '/admin/analytics', label: 'التقارير والمبيعات', icon: BarChart3, permission: 'view_analytics' },
      ]
    },
    {
      title: 'الكتالوج والمخزون',
      links: [
        { path: '/admin/products', label: 'المنتجات والكتالوج', icon: Package, permission: 'manage_products' },
        { path: '/admin/categories', label: 'الأقسام والفئات', icon: FolderTree, permission: 'manage_categories' },
        { path: '/admin/inventory', label: 'المخزون وسجل الحركات', icon: Boxes, permission: 'manage_inventory' },
      ]
    },
    {
      title: 'المبيعات والعملاء',
      links: [
        { path: '/admin/orders', label: 'إدارة الطلبات والفواتير', icon: ShoppingCart, permission: 'manage_orders' },
        { path: '/admin/customers', label: 'سجل العملاء', icon: Users, permission: 'manage_orders' },
      ]
    },
    {
      title: 'مركز الطباعة الرقمية',
      links: [
        { path: '/admin/printing/services', label: 'تسعير خدمات الطباعة', icon: Printer, permission: 'manage_printing' },
        { path: '/admin/printing/requests', label: 'طلبات الطباعة والمقايسات', icon: FileText, permission: 'manage_printing' },
      ]
    },
    {
      title: 'التسويق والمحتوى',
      links: [
        { path: '/admin/promotions', label: 'العروض وكوبونات الخصم', icon: Percent, permission: 'manage_discounts' },
        { path: '/admin/banners', label: 'البانرات الإعلانية', icon: Image, permission: 'manage_banners' },
        { path: '/admin/content', label: 'محتوى الصفحة الرئيسية', icon: Layers, permission: 'manage_content' },
        { path: '/admin/pages', label: 'الصفحات التعريفية (CMS)', icon: FileText, permission: 'manage_content' },
        { path: '/admin/navigation', label: 'قوائم التنقل', icon: Compass, permission: 'manage_settings' },
      ]
    },
    {
      title: 'النظام والإدارة',
      links: [
        { path: '/admin/staff', label: 'فريق العمل والصلاحيات', icon: UserCheck, permission: 'manage_staff' },
        { path: '/admin/settings', label: 'إعدادات المتجر', icon: Settings, permission: 'manage_settings' },
        { path: '/admin/activity-logs', label: 'سجل النشاط والأمان', icon: History, permission: 'view_analytics' },
      ]
    }
  ];

  const visibleNavGroups = rawNavGroups.map(group => ({
    ...group,
    links: group.links.filter(link => !link.permission || can(link.permission))
  })).filter(group => group.links.length > 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex text-right font-arabic">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-mall-950 text-gray-300 border-s border-mall-900 shrink-0 print:hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-mall-900 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/brand-logo-transparent.webp" alt="مول المصطفى" className="h-9 w-9 object-contain drop-shadow" />
            <div>
              <span className="font-cairo font-black text-sm text-white block leading-tight">مول المصطفى</span>
              <span className="text-[9px] text-gold-400 font-semibold tracking-wider">لوحة الإدارة والتحكم</span>
            </div>
          </Link>
          <span className="text-[10px] bg-gold-500 text-mall-950 font-black px-1.5 py-0.5 rounded">
            ERP
          </span>
        </div>

        {/* User Info Bar */}
        <div className="p-3 bg-mall-900/60 border-b border-mall-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold-500 text-mall-950 flex items-center justify-center font-black text-xs">
              {currentUser?.name?.charAt(0) || 'أ'}
            </div>
            <div>
              <span className="font-bold text-white block text-[11px] leading-tight">{currentUser?.name}</span>
              <span className="text-[10px] text-gold-400 font-semibold">{currentUser?.role}</span>
            </div>
          </div>
          <Link to="/" target="_blank" className="p-1.5 text-gray-400 hover:text-white hover:bg-mall-800 rounded-lg transition-colors" title="معاينة المتجر">
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Nav list with semantic grouping */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {visibleNavGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
                {group.title}
              </h3>
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-colors ${
                      isActive 
                        ? 'bg-gold-500 text-mall-950 shadow-sm' 
                        : 'text-gray-300 hover:text-white hover:bg-mall-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-mall-950' : 'text-gold-400/80'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-mall-900">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="القائمة الجانبية"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-gray-800">
              نظام إدارة وتشغيل مول المصطفى (Al Mostafa Mall ERP)
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-mall-900 hover:text-gold-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>واجهة المتجر</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto print:p-0 print:overflow-visible">
          <React.Suspense fallback={
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-3 text-center">
              <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500 font-bold">جاري تحميل لوحة التحكم...</span>
            </div>
          }>
            <Outlet />
          </React.Suspense>
        </main>
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="fixed inset-y-0 start-0 max-w-xs w-full bg-mall-950 text-white shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-mall-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/brand-logo-transparent.webp" alt="مول المصطفى" className="h-8 w-8 object-contain" />
                <span className="font-cairo font-black text-sm text-white">مول المصطفى - الإدارة</span>
              </div>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)} 
                className="text-gray-400 hover:text-white"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              {visibleNavGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
                    {group.title}
                  </h3>
                  {group.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-colors ${
                          isActive ? 'bg-gold-500 text-mall-950 font-black' : 'text-gray-300 hover:bg-mall-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
