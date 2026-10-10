import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dbStore } from '../../services/dbStore';
import { formatEGP, formatDateTime } from '../../utils/formatters';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { 
  User, 
  Package, 
  Heart, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Edit2,
  Phone,
  Mail,
  Sparkles,
  ShoppingBag,
  Printer
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { 
    currentUser, 
    isAuthenticated, 
    isAdmin, 
    logout, 
    openAuthModal, 
    loginWithGoogle,
    updateProfile,
    addAddress,
    deleteAddress,
    setDefaultAddress
  } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');

  // Add Address Modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressTitle, setAddressTitle] = useState('المنزل');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  // Recent user orders
  const orders = dbStore.getOrders().filter(o => 
    currentUser?.phone && o.customer_phone.includes(currentUser.phone)
  ).slice(0, 3);

  const printRequests = dbStore.getPrintRequests().filter(p => 
    currentUser?.phone && p.customer_phone.includes(currentUser.phone)
  ).slice(0, 3);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
    });
    setIsEditingProfile(false);
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !streetAddress.trim()) return;

    addAddress({
      title: addressTitle,
      governorate,
      city: city.trim(),
      street_address: streetAddress.trim(),
      building_number: buildingNumber.trim(),
      notes: notes.trim(),
      is_default: isDefault,
    });

    setIsAddressModalOpen(false);
    setCity('');
    setStreetAddress('');
    setBuildingNumber('');
    setNotes('');
  };

  // If user is not authenticated, show welcoming B.TECH style sign-in / registration screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-right font-arabic">
        <Breadcrumbs items={[{ label: 'حسابي' }]} />

        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex p-4 rounded-3xl bg-mall-50 border border-mall-100 shadow-xs mb-2">
            <img 
              src="/brand-logo-transparent.png" 
              alt="مول المصطفى" 
              className="h-16 w-auto object-contain"
            />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-mall-950">
              أهلاً بك في مول المصطفى
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              سجل دخولك أو أنشئ حساباً جديداً للاستمتاع بعروض حصرية، متابعة فورية لحالة الشحنات، وإدارة سريعة لطلبات ومقايسات الطباعة.
            </p>
          </div>

          <div className="max-w-xs mx-auto flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full py-3 bg-mall-900 hover:bg-mall-800 text-white rounded-2xl font-black text-xs transition-colors shadow-sm"
            >
              تسجيل الدخول إلى حسابك
            </button>

            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold text-xs transition-colors"
            >
              إنشاء حساب جديد
            </button>

            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>تسجيل دخول فوري بحساب Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-right font-arabic">
      <Breadcrumbs items={[{ label: 'حسابي' }]} />

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              {currentUser?.avatar_url ? (
                <img 
                  src={currentUser.avatar_url} 
                  alt={currentUser.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-gold-400 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-mall-900 text-gold-400 flex items-center justify-center font-black text-2xl">
                  {currentUser?.name.charAt(0)}
                </div>
              )}
              {currentUser?.provider === 'google' && (
                <span className="absolute -bottom-1 -start-1 bg-white p-1 rounded-full shadow-xs border border-gray-200" title="تم تسجيل الدخول بواسطة Google">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-mall-900">{currentUser?.name}</h1>
                <button
                  type="button"
                  onClick={() => {
                    setEditName(currentUser?.name || '');
                    setEditPhone(currentUser?.phone || '');
                    setEditEmail(currentUser?.email || '');
                    setIsEditingProfile(!isEditingProfile);
                  }}
                  className="text-gray-400 hover:text-mall-900 p-1"
                  title="تعديل البيانات الشخصية"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1 font-mono dir-ltr">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{currentUser?.phone}</span>
                </span>
                {currentUser?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{currentUser.email}</span>
                  </span>
                )}
              </div>

              {isAdmin && (
                <span className="inline-block mt-2 text-[10px] bg-gold-100 text-gold-900 font-bold px-2 py-0.5 rounded-full">
                  صلاحية إدارة معتمدة: {currentUser?.role}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="py-2.5 px-5 bg-gold-500 hover:bg-gold-600 text-mall-950 rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>لوحة التحكم الإدارية</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}

            <button
              type="button"
              onClick={logout}
              className="py-2.5 px-4 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Profile Inline Editor Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-3">
            <h3 className="font-bold text-gray-900">تحديث البيانات الشخصية</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-mall-900"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-xl bg-white font-mono dir-ltr focus:outline-hidden focus:ring-2 focus:ring-mall-900"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-xl bg-white font-mono dir-ltr focus:outline-hidden focus:ring-2 focus:ring-mall-900"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 bg-mall-900 text-white rounded-lg font-bold hover:bg-mall-800"
              >
                حفظ التعديلات
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-bold"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <Link
            to="/account/orders"
            className="p-4 rounded-2xl border border-gray-100 hover:border-gold-300 bg-gray-50/60 hover:bg-white transition-all space-y-2 group"
          >
            <Package className="w-6 h-6 text-mall-900 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-gray-900">طلباتي السابقة</h3>
            <p className="text-[11px] text-gray-500">تتبع مشترياتك السابقة وحالة التوصيل الفورية</p>
          </Link>

          <Link
            to="/wishlist"
            className="p-4 rounded-2xl border border-gray-100 hover:border-gold-300 bg-gray-50/60 hover:bg-white transition-all space-y-2 group"
          >
            <Heart className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-gray-900">قائمة المفضلة</h3>
            <p className="text-[11px] text-gray-500">المنتجات التي قمت بحفظها للشراء لاحقاً</p>
          </Link>

          <Link
            to="/print-center"
            className="p-4 rounded-2xl border border-gray-100 hover:border-gold-300 bg-gray-50/60 hover:bg-white transition-all space-y-2 group"
          >
            <Printer className="w-6 h-6 text-cyan-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-gray-900">مركز الطباعة والمقايسات</h3>
            <p className="text-[11px] text-gray-500">متابعة ملفات الأبحاث والطباعة والمقايسات</p>
          </Link>
        </div>
      </div>

      {/* Address Book Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-black text-mall-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-mall-900" />
              <span>دفتر العناوين المحفوظة للشحن السريع</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              احفظ عناوينك المفضلة (المنزل، العمل) لتسريع عملية الشحن في الطلبات القادمة
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddressModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-mall-900 text-white rounded-xl text-xs font-bold hover:bg-mall-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عنوان جديد</span>
          </button>
        </div>

        {(!currentUser?.addresses || currentUser.addresses.length === 0) ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl text-xs text-gray-500 space-y-2">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto" />
            <p>لم تقم بإضافة عناوين حتى الآن. أضف عنوانك لإنهاء الطلبات بسرعة دون إعادة ملء البيانات.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {currentUser.addresses.map((addr) => (
              <div 
                key={addr.id}
                className={`p-4 rounded-2xl border transition-all text-xs space-y-2 ${
                  addr.is_default ? 'border-mall-900 bg-mall-50/20' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{addr.title}</span>
                    {addr.is_default && (
                      <span className="text-[10px] bg-mall-900 text-white px-2 py-0.5 rounded-full font-bold">
                        العنوان الافتراضي
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteAddress(addr.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="حذف العنوان"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {addr.governorate} — {addr.city}، {addr.street_address}
                  {addr.building_number && `، عمارة ${addr.building_number}`}
                </p>

                {addr.notes && (
                  <p className="text-[10px] text-gray-400">ملاحظات: {addr.notes}</p>
                )}

                {!addr.is_default && (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-[11px] font-bold text-mall-900 hover:underline pt-1 block"
                  >
                    تعيين كعنوان افتراضي
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders Snapshot */}
      {orders.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-base font-black text-mall-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-mall-900" />
              <span>آخر الطلبات المسجلة بحسابك</span>
            </h3>
            <Link to="/account/orders" className="text-xs text-mall-900 font-bold hover:underline">
              عرض جميع الطلبات &larr;
            </Link>
          </div>

          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between text-xs hover:bg-gray-50/70 transition-colors">
                <div>
                  <span className="font-mono font-bold text-mall-900 text-sm block">{o.order_number}</span>
                  <span className="text-[10px] text-gray-400">{formatDateTime(o.created_at)}</span>
                  <span className="text-gray-600 block mt-1">{o.items.length} منتج — إجمالي: <strong className="text-green-700">{formatEGP(o.total_egp)}</strong></span>
                </div>
                <div className="text-left space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
                    {o.order_status}
                  </span>
                  <Link to={`/order-confirmation/${o.order_number}`} className="block text-[11px] text-mall-900 font-bold hover:underline">
                    تفاصيل الفاتورة &larr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for adding address */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 text-xs">
            <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-2">
              إضافة عنوان شحن جديد
            </h3>

            <form onSubmit={handleAddAddressSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">تسمية العنوان *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: المنزل، العمل، الشاليه"
                  value={addressTitle}
                  onChange={(e) => setAddressTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">المحافظة *</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
                  >
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                    <option value="القليوبية">القليوبية</option>
                    <option value="الشرقية">الشرقية</option>
                    <option value="الدقهلية">الدقهلية</option>
                    <option value="الغربية">الغربية</option>
                    <option value="المنوفية">المنوفية</option>
                    <option value="البحيرة">البحيرة</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">المدينة / المنطقة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مدينة نصر"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">الشارع والحي *</label>
                <input
                  type="text"
                  required
                  placeholder="اسم الشارع والحي بالتفصيل"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">رقم العمارة / المبنى</label>
                  <input
                    type="text"
                    placeholder="مثال: 14"
                    value={buildingNumber}
                    onChange={(e) => setBuildingNumber(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">علامة مميزة (اختياري)</label>
                  <input
                    type="text"
                    placeholder="بجوار..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-mall-900 focus:ring-mall-900"
                />
                <span className="font-bold text-gray-800">تعيين هذا العنوان كعنوان شحن افتراضي</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-mall-900 text-white rounded-xl font-bold hover:bg-mall-800"
                >
                  حفظ العنوان
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold"
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
