import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface LoginPageProps {
  initialTab?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialTab = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentUser, 
    isAuthenticated, 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(() => {
    if (location.pathname.includes('register')) return 'register';
    return initialTab;
  });

  useEffect(() => {
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else if (location.pathname.includes('login')) {
      setActiveTab('login');
    }
  }, [location.pathname]);

  // Login form state
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already authenticated, allow navigating to account or dashboard
  if (isAuthenticated && currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-right font-arabic">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            أنت مسجل الدخول بالفعل
          </h2>
          <p className="text-xs text-slate-600">
            مرحباً بك، <strong className="text-slate-900 font-bold">{currentUser.name}</strong> ({currentUser.email || currentUser.phone})
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/account"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              الانتقال إلى لوحة حسابي
            </Link>
            {currentUser.role !== 'customer' && (
              <Link
                to="/admin"
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-slate-950 rounded-xl text-xs font-black transition-colors"
              >
                الدخول للوحة تحكم الإدارة
              </Link>
            )}
            <Link
              to="/shop"
              className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold"
            >
              متابعة التسوق في المتجر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await loginWithEmail(emailOrPhone, password);
      if (!res.success) {
        setErrorMsg(res.error || 'فشل تسجيل الدخول، يرجى التأكد من البيانات المدخلة');
      } else {
        navigate('/account');
      }
    } catch {
      setErrorMsg('حدث خطأ غير متوقع، يرجى المحاولة لاحقاً');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (registerPassword !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerWithEmail(name, registerEmail, registerPhone, registerPassword);
      if (!res.success) {
        setErrorMsg(res.error || 'فشل إنشاء الحساب');
      } else {
        setSuccessMsg('تم إنشاء الحساب بنجاح! جاري تحويلك...');
        setTimeout(() => navigate('/account'), 1500);
      }
    } catch {
      setErrorMsg('حدث خطأ غير متوقع أثناء التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    } catch {
      setErrorMsg('تعذر تسجيل الدخول بحساب Google، يرجى المحاولة لاحقاً');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6 text-right font-arabic">
      <Breadcrumbs items={[
        { label: activeTab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد' }
      ]} />

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img 
              src="/brand-logo-transparent.webp" 
              alt="مول المصطفى" 
              className="h-14 w-auto mx-auto object-contain"
            />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {activeTab === 'login' ? 'مرحباً بك مجدداً في مول المصطفى' : 'انضم لعائلة مول المصطفى'}
          </h1>
          <p className="text-xs text-slate-500">
            {activeTab === 'login'
              ? 'سجل دخولك لمتابعة شحناتك والاستفادة من العروض الخاصة'
              : 'أنشئ حسابك للاستمتاع بتجربة تسوق سريعة وموثوقة'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms */}
        {activeTab === 'login' ? (
          /* ==================== LOGIN FORM ==================== */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الهاتف أو البريد الإلكتروني *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="01XXXXXXXXX أو name@example.com"
                  className="w-full text-xs p-3 ps-10 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  كلمة المرور *
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-3 ps-10 pe-10 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ==================== REGISTER FORM ==================== */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الاسم بالكامل *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد أحمد الشافعي"
                  className="w-full text-xs p-2.5 ps-10 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                />
                <User className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الهاتف المحمول (مصر) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full text-xs p-2.5 ps-10 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                مطلوب مكون من 11 رقماً (010, 011, 012, 015)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                البريد الإلكتروني *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full text-xs p-2.5 ps-10 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-2.5 ps-9 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                    dir="ltr"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-2.5 ps-9 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                    dir="ltr"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-3" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>إنشاء الحساب فوراً</span>
              )}
            </button>
          </form>
        )}

        {/* Divider & Google OAuth */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400">أو من خلال</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>تسجيل دخول فوري بحساب Google</span>
        </button>

        {/* Security Assurance */}
        <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>بياناتك وحسابك مشفرة ومحمية بالكامل في مول المصطفى</span>
        </div>
      </div>
    </div>
  );
};
