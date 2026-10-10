import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, StaffMember, StaffPermission } from '../../types';
import { dbStore } from '../../services/dbStore';
import { 
  UserCheck, 
  Shield, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  Clock, 
  Edit2, 
  Trash2, 
  Sparkles, 
  X, 
  Check, 
  RotateCcw,
  KeyRound,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const ALL_PERMISSIONS: { key: StaffPermission; label: string; desc: string }[] = [
  { key: 'manage_products', label: 'المنتجات والكتالوج', desc: 'إضافة وتعديل وحذف المنتجات وتحديد الأسعار' },
  { key: 'manage_categories', label: 'الأقسام والفئات', desc: 'إنشاء وتعديل الفئات وتوزيع المنتجات عليها' },
  { key: 'manage_inventory', label: 'المخزون وسجل الحركات', desc: 'متابعة الأرصدة وتعديل الكميات وسجلات الجرد' },
  { key: 'manage_orders', label: 'إدارة الطلبات والشحن', desc: 'معالجة وتأكيد الطلبات وطباعة الفواتير والإلغاء' },
  { key: 'manage_discounts', label: 'التخفيضات والكوبونات', desc: 'حملات التخفيضات الذكية وأكواد الخصم الترويجية' },
  { key: 'manage_banners', label: 'البانرات الإعلانية', desc: 'تحديث صور الإعلانات والروابط ونصوص البانر' },
  { key: 'manage_content', label: 'محتوى المتجر وCMS', desc: 'أقسام الصفحة الرئيسية وصفحات السياسات' },
  { key: 'manage_printing', label: 'مركز الطباعة الرقمية', desc: 'تسعير خدمات الطباعة ومعالجة طلبات العملاء' },
  { key: 'manage_staff', label: 'فريق العمل والموظفين', desc: 'إضافة حسابات الموظفين وتعيين الصلاحيات' },
  { key: 'manage_settings', label: 'إعدادات المتجر', desc: 'بيانات المتجر وسياسات الشحن والنسخ الاحتياطي' },
  { key: 'view_analytics', label: 'التقارير والمؤشرات', desc: 'متابعة أرقام المبيعات وأداء المنتجات وسجلات النظام' },
];

const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, StaffPermission[]> = {
  super_admin: [
    'manage_products',
    'manage_categories',
    'manage_inventory',
    'manage_orders',
    'manage_discounts',
    'manage_banners',
    'manage_content',
    'manage_printing',
    'manage_staff',
    'manage_settings',
    'view_analytics'
  ],
  catalog_manager: ['manage_products', 'manage_categories', 'manage_inventory', 'manage_discounts'],
  order_manager: ['manage_orders', 'manage_inventory'],
  printing_staff: ['manage_printing', 'manage_orders'],
  content_manager: ['manage_content', 'manage_banners', 'manage_discounts'],
  customer: []
};

export const AdminStaffPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>(() => dbStore.getStaffMembers());

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('catalog_manager');
  const [selectedPermissions, setSelectedPermissions] = useState<StaffPermission[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const reloadData = () => {
    setStaff(dbStore.getStaffMembers());
  };

  useEffect(() => {
    const handleUpdate = () => {
      setStaff(dbStore.getStaffMembers());
    };
    window.addEventListener('al_mostafa_staff_updated', handleUpdate);
    window.addEventListener('al_mostafa_db_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('al_mostafa_staff_updated', handleUpdate);
      window.removeEventListener('al_mostafa_db_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const openCreateModal = () => {
    setEditingStaffId(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('staff123');
    setShowPassword(false);
    setRole('catalog_manager');
    setSelectedPermissions([...DEFAULT_ROLE_PERMISSIONS.catalog_manager]);
    setIsActive(true);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaffId(member.id);
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone);
    setPassword(member.password || '');
    setShowPassword(false);
    setRole(member.role);
    setSelectedPermissions(member.permissions || DEFAULT_ROLE_PERMISSIONS[member.role] || []);
    setIsActive(member.isActive);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaffId(null);
    setErrorMessage('');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Suggest default permissions for selected role
    setSelectedPermissions([...(DEFAULT_ROLE_PERMISSIONS[newRole] || [])]);
  };

  const togglePermission = (perm: StaffPermission) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(ALL_PERMISSIONS.map(p => p.key));
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسم الموظف');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setErrorMessage('يرجى إدخال رقم الهاتف أو البريد الإلكتروني للموظف');
      return;
    }

    if (!editingStaffId && (!password.trim() || password.trim().length < 6)) {
      setErrorMessage('يجب إدخال كلمة مرور للموظف الجديد لا تقل عن 6 خانات');
      return;
    }

    if (editingStaffId) {
      const updates: Partial<StaffMember> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        permissions: selectedPermissions,
        isActive
      };
      if (password.trim()) {
        updates.password = password.trim();
      }
      dbStore.updateStaffMember(editingStaffId, updates);
      showNotice('تم تحديث بيانات الموظف والصلاحيات بنجاح');
    } else {
      dbStore.createStaffMember({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim() || 'staff123',
        role,
        permissions: selectedPermissions,
        isActive,
        lastLogin: 'لم يسجل دخول بعد'
      });
      showNotice('تمت إضافة الموظف الجديد وتعيين صلاحياته بنجاح');
    }

    reloadData();
    closeModal();
  };

  const handleToggleActive = (member: StaffMember) => {
    const nextState = !member.isActive;
    dbStore.updateStaffMember(member.id, { isActive: nextState });
    reloadData();
    showNotice(nextState ? `تم تفعيل حساب ${member.name}` : `تم تعطيل حساب ${member.name}`);
  };

  const handleDelete = (member: StaffMember) => {
    if (member.id === 'usr-1' || member.role === 'super_admin') {
      if (!window.confirm(`تحذير: هذا الحساب مسؤول بصلاحية Super Admin. هل أنت متأكد تماماً من رغبتك في حذفه؟`)) {
        return;
      }
    } else {
      if (!window.confirm(`هل أنت متأكد من حذف الموظف "${member.name}" نهائياً من النظام؟`)) {
        return;
      }
    }

    const success = dbStore.deleteStaffMember(member.id);
    if (success) {
      reloadData();
      showNotice(`تم حذف الموظف ${member.name} بنجاح`);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل تريد استعادة قائمة فريق العمل والمشرفين الافتراضية؟')) {
      const defaults = dbStore.resetStaffToDefaults();
      setStaff(defaults);
      showNotice('تمت استعادة قائمة الموظفين الافتراضية بنجاح');
    }
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'super_admin': return 'المدير العام (Super Admin)';
      case 'catalog_manager': return 'مدير الكتالوج والمنتجات';
      case 'order_manager': return 'مدير الطلبات والشحن';
      case 'printing_staff': return 'مسؤول مركز الطباعة';
      case 'content_manager': return 'مدير المحتوى والواجهة';
      default: return 'مستخدم عادي';
    }
  };

  const getRoleBadgeColor = (r: UserRole) => {
    switch (r) {
      case 'super_admin': return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'catalog_manager': return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'order_manager': return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'printing_staff': return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'content_manager': return 'bg-pink-100 text-pink-900 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 text-right font-arabic">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-mall-900" />
            <span>فريق العمل والصلاحيات الدقيقة (RBAC)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            إضافة حسابات الموظفين وتعيين كلمات المرور وتحديد الصلاحيات التفصيلية لكل موظف
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {actionNotice && (
            <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>{actionNotice}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="استعادة فريق العمل الافتراضي"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-mall-950 rounded-xl text-xs font-black transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة موظف جديد</span>
          </button>
        </div>
      </div>

      {/* General Manager Security & RBAC Overview */}
      <div className="bg-gradient-to-r from-mall-950 via-mall-900 to-mall-950 p-5 sm:p-6 rounded-3xl text-white shadow-md border border-mall-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center border border-gold-400/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <span>نظام التحكم في صلاحيات فريق العمل (RBAC)</span>
                <span className="text-[10px] bg-gold-500 text-mall-950 font-black px-2 py-0.5 rounded-full">
                  إدارة المدير العام
                </span>
              </h3>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                الحساب النشط حالياً: <strong className="text-gold-400">{currentUser?.name}</strong> ({currentUser?.role === 'super_admin' ? 'المدير العام' : getRoleLabel(currentUser?.role || 'customer')}) — الصلاحيات مفعلة ومحمية بالكامل بكلمات المرور ولا يمكن التبديل إلا بتسجيل الدخول الرسمي.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-mall-900" />
            <span>الموظفون والمشرفون المعتمدون ({staff.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right divide-y divide-gray-100">
            <thead className="bg-gray-50 text-gray-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">الموظف</th>
                <th className="py-3.5 px-4">الدور الوظيفي</th>
                <th className="py-3.5 px-4">الصلاحيات الممنوحة</th>
                <th className="py-3.5 px-4">رقم الهاتف</th>
                <th className="py-3.5 px-4">البريد الإلكتروني</th>
                <th className="py-3.5 px-4 text-center">الحالة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <p className="font-bold text-xs mb-2">لا يوجد موظفون مسجلون حالياً</p>
                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-mall-900 text-white rounded-xl text-xs font-bold hover:bg-mall-800 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استعادة فريق العمل الافتراضي</span>
                    </button>
                  </td>
                </tr>
              ) : (
                staff.map((m) => {
                  const permCount = m.permissions ? m.permissions.length : (DEFAULT_ROLE_PERMISSIONS[m.role]?.length || 0);

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gold-100 text-mall-950 font-black flex items-center justify-center text-xs shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-black text-gray-900">{m.name}</span>
                            <span className="block text-[10px] text-gray-400 font-mono font-normal">{m.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getRoleBadgeColor(m.role)}`}>
                          {getRoleLabel(m.role)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {m.role === 'super_admin' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-bold text-[10px]">
                            صلاحيات كاملة مطلقة (Super Admin)
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[10px]">
                              {permCount} صلاحيات محددة
                            </span>
                            <span className="text-[10px] text-gray-400">انقر تعديل للاطلاع</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-700 font-semibold dir-ltr text-right">
                        {m.phone}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-600 dir-ltr text-right">
                        {m.email || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(m)}
                          title="انقر لتغيير حالة التفعيل"
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            m.isActive
                              ? 'text-green-700 bg-green-50 hover:bg-green-100'
                              : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {m.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>نشط</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>معطل</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(m)}
                            className="p-1.5 text-gray-600 hover:text-mall-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="تعديل الموظف والصلاحيات وكلمة المرور"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(m)}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الموظف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={closeModal} aria-hidden="true" />

          <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl p-6 sm:p-8 z-10 border border-gray-100 animate-scale-up space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-mall-900" />
                <span>{editingStaffId ? 'تعديل بيانات وصلاحيات الموظف' : 'إضافة موظف جديد وتحديد صلاحياته'}</span>
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold animate-fade-in">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">الاسم الكامل للموظف *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: حسام أحمد"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-mall-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-mall-900 font-mono dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">البريد الإلكتروني (لتسجيل الدخول)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@almostafamall.com"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-mall-900 font-mono dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {editingStaffId ? 'تغيير كلمة المرور (اتركه فارغاً للحالية)' : 'كلمة مرور الحساب *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editingStaffId ? 'أدخل كلمة مرور جديدة أو اتركه' : '6 خانات على الأقل (مثال: staff123)'}
                      className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-mall-900 font-mono dir-ltr text-left pe-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-2.5 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">الدور الوظيفي الأساسي *</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-mall-900 font-bold bg-white cursor-pointer"
                >
                  <option value="catalog_manager">مدير الكتالوج والمنتجات (Catalog Manager)</option>
                  <option value="order_manager">مدير الطلبات والشحن (Order & Shipping Manager)</option>
                  <option value="printing_staff">مسؤول مركز الطباعة الرقمية (Printing Staff)</option>
                  <option value="content_manager">مدير المحتوى والواجهة (Content & CMS Manager)</option>
                  <option value="super_admin">المدير العام (Super Admin - صلاحيات كاملة)</option>
                </select>
              </div>

              {/* Granular Modular Permissions Checkboxes */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-black text-gray-900">
                      الصلاحيات التفصيلية للموظف ({selectedPermissions.length} من {ALL_PERMISSIONS.length}):
                    </label>
                    <span className="text-[10px] text-gray-500">حدد ما يحق للموظف الوصول إليه وتعديله في لوحة التحكم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-[10px] text-mall-900 font-bold hover:underline cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={clearAllPermissions}
                      className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-56 overflow-y-auto">
                  {ALL_PERMISSIONS.map(perm => {
                    const isChecked = selectedPermissions.includes(perm.key) || role === 'super_admin';

                    return (
                      <label 
                        key={perm.key} 
                        className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-gold-50/80 border-gold-300 text-mall-950 font-bold' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={role === 'super_admin'}
                          onChange={() => togglePermission(perm.key)}
                          className="mt-0.5 rounded text-gold-600 focus:ring-gold-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs block font-bold leading-tight">{perm.label}</span>
                          <span className="text-[10px] text-gray-400 block truncate mt-0.5">{perm.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-mall-900 rounded border-gray-300 focus:ring-mall-900 cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="font-bold text-gray-700 cursor-pointer">
                  تفعيل الحساب والسماح بتسجيل الدخول الفوري
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 text-mall-950 font-black rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingStaffId ? 'حفظ التعديلات والصلاحيات' : 'إضافة الموظف وتثبيت الصلاحيات'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
