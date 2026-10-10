import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    openAuthModal, 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle
  } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await loginWithEmail(emailOrPhone, password);
      if (!res.success) {
        setErrorMsg(res.error || 'فشل تسجيل الدخول');
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
      if (!res.success && (res as any)?.error) {
        setErrorMsg((res as any).error);
      }
    } catch {
      setErrorMsg('تعذر تسجيل الدخول بحساب Google، يرجى المحاولة لاحقاً');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-right animate-fade-in font-arabic">
      <div 
        className="fixed inset-0" 
        onClick={closeAuthModal} 
        aria-hidden="true" 
      />

      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden z-10 border border-gray-100">
        {/* Top Header Banner */}
        <div className="bg-mall-950 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 start-4 text-gray-400 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center bg-white p-2 rounded-2xl shadow-md mb-3">
            <img 
              src="/brand-logo-transparent.png" 
              alt="مول المصطفى" 
              className="h-10 w-auto object-contain"
            />
          </div>

          <h2 className="text-lg font-black tracking-tight text-white">
            {authModalTab === 'login' ? 'تسجيل الدخول إلى حسابك' : 'إنشاء حساب جديد في مول المصطفى'}
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            كل احتياجاتك تحت سقف واحد — عروض حصرية ومتابعة دقيقة لطلباتك
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-gray-100 bg-gray-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setErrorMsg(''); openAuthModal('login'); }}
            className={`flex-1 py-3 text-center transition-all ${
              authModalTab === 'login'
                ? 'bg-white text-mall-900 border-b-2 border-mall-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setErrorMsg(''); openAuthModal('register'); }}
            className={`flex-1 py-3 text-center transition-all ${
              authModalTab === 'register'
                ? 'bg-white text-mall-900 border-b-2 border-mall-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            حساب جديد
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Error / Success Alerts */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Official Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-sm"
          >
            {/* Official Google Multicolor SVG Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>المتابعة باستخدام Google (تسجيل فوري)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-gray-200" />
            <span className="shrink mx-3 text-gray-400 text-[11px] font-semibold">أو بالبريد والهاتف</span>
            <div className="grow border-t border-gray-200" />
          </div>

          {/* TAB 1: Login Form */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">البريد الإلكتروني أو رقم الهاتف</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="example@mail.com أو 010xxxxxxxx"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full ps-9 pe-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full ps-9 pe-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                  <input type="checkbox" defaultChecked className="rounded text-mall-900 focus:ring-mall-900" />
                  <span>تذكرني على هذا الجهاز</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('لاستعادة كلمة المرور أو تحديثها، يرجى التواصل مع إدارة مول المصطفى عبر واتساب للتحقق وإعادة الضبط فوراً.')}
                  className="text-mall-900 hover:underline font-bold"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-mall-900 hover:bg-mall-800 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
              </button>
            </form>
          )}

          {/* TAB 2: Register Form */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">الاسم بالكامل *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="محمد مصطفى"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full ps-9 pe-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">رقم الهاتف (مصر) *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="01012345678"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="w-full ps-9 pe-3 py-2.5 border border-gray-300 rounded-xl font-mono dir-ltr text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">البريد الإلكتروني *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full ps-9 pe-3 py-2.5 border border-gray-300 rounded-xl font-mono dir-ltr text-left focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">كلمة المرور *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="6 أحرف على الأقل"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full ps-9 pe-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">تأكيد كلمة المرور *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full ps-9 pe-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mall-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 leading-normal pt-1">
                بإنشائك للحساب، فإنك توافق على <a href="/page/terms" target="_blank" rel="noopener noreferrer" className="text-mall-900 font-bold underline">شروط وأحكام</a> و <a href="/page/privacy" target="_blank" rel="noopener noreferrer" className="text-mall-900 font-bold underline">سياسة الخصوصية</a> لمول المصطفى.
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-mall-900 hover:bg-mall-800 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-gray-500">
            <span>هل تواجه مشكلة في الدخول؟ </span>
            <a href="https://wa.me/201023456789" target="_blank" rel="noopener noreferrer" className="text-mall-900 font-bold hover:underline">
              تواصل مع الدعم الفني
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
