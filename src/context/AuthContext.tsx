import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile, UserAddress, StaffPermission } from '../types';
import { dbStore } from '../services/dbStore';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export type { UserRole, UserProfile, UserAddress, StaffPermission };

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  role: UserRole;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (initialTab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  loginWithEmail: (emailOrPhone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; profile?: UserProfile; error?: string }>;
  loginAsStaff: (role: UserRole) => void;
  loginAsCustomer: (name: string, phone: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addAddress: (address: Omit<UserAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  logout: () => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
  can: (permission: StaffPermission) => boolean;
}

const AUTH_STORAGE_KEY = 'al_mostafa_auth_v2';
const USERS_DB_KEY = 'al_mostafa_registered_users_v2';

const DEFAULT_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-1',
    title: 'المنزل (القاهرة)',
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    street_address: 'شارع عباس العقاد، تقاطع الطيران',
    building_number: '14',
    floor: '3',
    apartment: '6',
    notes: 'بجوار صيدلية العزبي',
    is_default: true,
  }
];

const DEFAULT_ADMIN: UserProfile = {
  id: 'usr-admin-1',
  name: 'أحمد مصطفى (المدير العام)',
  email: 'admin@almostafamall.com',
  phone: '01023456789',
  role: 'super_admin',
  permissions: [
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
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  governorate: 'القاهرة',
  city: 'المعادي',
  address: 'شارع النصر، المعادي الجديدة',
  addresses: DEFAULT_ADDRESSES,
  provider: 'email',
  created_at: '2026-01-01T00:00:00.000Z'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Failed to save auth state to localStorage', err);
    }
  }, [currentUser]);

  // Active RBAC Liveness Verification:
  // If an active session belongs to a staff member who gets deactivated or deleted,
  // immediately revoke the session and force logout.
  useEffect(() => {
    const verifyStaffSessionLiveness = () => {
      if (!currentUser) return;
      if (currentUser.role === 'customer' || currentUser.id === DEFAULT_ADMIN.id) {
        return;
      }

      const staffList = dbStore.getStaffMembers();
      const currentStaff = staffList.find(s => s.id === currentUser.id);

      if (!currentStaff || !currentStaff.isActive) {
        console.warn('Session terminated: Staff account was deactivated or removed.', currentUser.id);
        setCurrentUser(null);
        try {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch {}
        if (typeof window !== 'undefined') {
          alert('تنبيه أمني: تم تعطيل أو حذف هذا الحساب من قبل الإدارة. تم إنهاء الجلسة فوراً ومنع الوصول.');
        }
      }
    };

    verifyStaffSessionLiveness();

    const handleStaffUpdate = () => verifyStaffSessionLiveness();
    window.addEventListener('al_mostafa_staff_updated', handleStaffUpdate);
    window.addEventListener('al_mostafa_db_updated', handleStaffUpdate);
    window.addEventListener('storage', handleStaffUpdate);

    return () => {
      window.removeEventListener('al_mostafa_staff_updated', handleStaffUpdate);
      window.removeEventListener('al_mostafa_db_updated', handleStaffUpdate);
      window.removeEventListener('storage', handleStaffUpdate);
    };
  }, [currentUser]);

  const openAuthModal = (initialTab: 'login' | 'register' = 'login') => {
    setAuthModalTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const getStoredUsers = (): Array<UserProfile & { password?: string }> => {
    return dbStore.getRegisteredUsers();
  };

  const saveStoredUsers = (users: Array<UserProfile & { password?: string }>) => {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (err) {
      console.error('Failed to save users database', err);
    }
  };

  const loginWithEmail = async (emailOrPhone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanInput = emailOrPhone.trim().toLowerCase();
    
    // 1. Check General Manager (Super Admin)
    if ((cleanInput === 'admin@almostafamall.com' || cleanInput === '01023456789') && (password === 'admin123' || password === 'admin')) {
      setCurrentUser(DEFAULT_ADMIN);
      closeAuthModal();
      return { success: true };
    }

    // 2. Check Staff Accounts in dbStore
    const staffMembers = dbStore.getStaffMembers();
    const staffMatch = staffMembers.find(s => 
      (s.email.toLowerCase() === cleanInput || s.phone.trim() === cleanInput) &&
      (s.password === password)
    );

    if (staffMatch) {
      if (!staffMatch.isActive) {
        return { 
          success: false, 
          error: 'تم تعطيل هذا الحساب من قبل الإدارة. يرجى التواصل مع المدير العام لتفعيل الحساب.' 
        };
      }

      const staffProfile: UserProfile = {
        id: staffMatch.id,
        name: staffMatch.name,
        email: staffMatch.email,
        phone: staffMatch.phone,
        role: staffMatch.role,
        permissions: staffMatch.permissions,
        addresses: DEFAULT_ADDRESSES,
        provider: 'email',
        created_at: staffMatch.created_at || new Date().toISOString()
      };
      setCurrentUser(staffProfile);
      closeAuthModal();
      return { success: true };
    }

    // 3. Check registered Customer Accounts in dbStore
    const customerFound = dbStore.findRegisteredUser(cleanInput);
    if (customerFound && customerFound.password === password) {
      const { password: _, ...profile } = customerFound;
      setCurrentUser(profile);
      closeAuthModal();
      return { success: true };
    }

    return { success: false, error: 'البريد الإلكتروني أو الهاتف أو كلمة المرور غير صحيحة' };
  };

  const registerWithEmail = async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim() || name.trim().length < 3) {
      return { success: false, error: 'يرجى كتابة الاسم بالكامل (3 أحرف على الأقل)' };
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 11 || !/^(010|011|012|015)/.test(cleanPhone)) {
      return { success: false, error: 'يرجى إدخال رقم هاتف محمول مصري صحيح مكون من 11 رقماً (010, 011, 012, 015)' };
    }

    if (!email.includes('@') || !email.includes('.')) {
      return { success: false, error: 'يرجى إدخال عنوان بريد إلكتروني صحيح' };
    }

    if (password.length < 6) {
      return { success: false, error: 'يجب ألا تقل كلمة المرور عن 6 خانات' };
    }

    const existing = dbStore.findRegisteredUser(email.trim()) || dbStore.findRegisteredUser(cleanPhone);
    if (existing) {
      return { success: false, error: 'هذا الحساب (البريد أو رقم الهاتف) مسجل بالفعل لدينا، يمكنك تسجيل الدخول مباشرة' };
    }

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      role: 'customer',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0b2545`,
      addresses: [],
      provider: 'email',
      created_at: new Date().toISOString()
    };

    const saved = dbStore.saveRegisteredUser({ ...newProfile, password });
    setCurrentUser(saved);
    closeAuthModal();
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; profile?: UserProfile; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'تعذر تسجيل الدخول بحساب Google' };
      }
    }

    return {
      success: false,
      error: 'تسجيل الدخول التلقائي عبر Google يتطلب إعداد مفاتيح Google OAuth / Supabase في ملف .env. يمكنك التسجيل والدخول الفوري والآمن برقم الهاتف أو البريد وكلمة المرور.'
    };
  };

  const loginAsStaff = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      super_admin: 'المدير العام (أحمد مصطفى)',
      catalog_manager: 'مدير الكتالوج والمنتجات',
      order_manager: 'مدير المبيعات والطلبات',
      printing_staff: 'مسؤول مركز الطباعة المتخصص',
      content_manager: 'مدير المحتوى والواجهة',
      customer: 'عميل المتجر',
    };

    const staffUser: UserProfile = {
      id: `usr-${role}`,
      name: `موظف (${roleNames[role]})`,
      email: `${role}@almostafamall.com`,
      phone: '01000000000',
      role: role,
      addresses: DEFAULT_ADDRESSES,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      created_at: new Date().toISOString()
    };
    setCurrentUser(staffUser);
  };

  const loginAsCustomer = (name: string, phone: string) => {
    const custUser: UserProfile = {
      id: `usr-cust-${Date.now()}`,
      name,
      phone,
      email: `${phone}@client.almostafamall.com`,
      role: 'customer',
      addresses: DEFAULT_ADDRESSES,
      created_at: new Date().toISOString()
    };
    setCurrentUser(custUser);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates };
      saveStoredUsers(users);
    }
  };

  const addAddress = (addressData: Omit<UserAddress, 'id'>) => {
    if (!currentUser) return;
    const newAddr: UserAddress = {
      ...addressData,
      id: `addr-${Date.now()}`,
    };
    let updatedAddresses = currentUser.addresses ? [...currentUser.addresses] : [];
    if (newAddr.is_default) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, is_default: false }));
    }
    updatedAddresses.push(newAddr);
    updateProfile({ addresses: updatedAddresses });
  };

  const deleteAddress = (id: string) => {
    if (!currentUser || !currentUser.addresses) return;
    const updated = currentUser.addresses.filter(a => a.id !== id);
    if (updated.length > 0 && !updated.some(a => a.is_default)) {
      updated[0].is_default = true;
    }
    updateProfile({ addresses: updated });
  };

  const setDefaultAddress = (id: string) => {
    if (!currentUser || !currentUser.addresses) return;
    const updated = currentUser.addresses.map(a => ({
      ...a,
      is_default: a.id === id,
    }));
    updateProfile({ addresses: updated });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const role = currentUser?.role || 'customer';
  const isAdmin = currentUser !== null && currentUser.role !== 'customer';

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    return allowedRoles.includes(currentUser.role);
  };

  const can = (permission: StaffPermission): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    return Boolean(currentUser.permissions && currentUser.permissions.includes(permission));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: currentUser !== null,
      isAdmin,
      role,
      isAuthModalOpen,
      authModalTab,
      openAuthModal,
      closeAuthModal,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      loginAsStaff,
      loginAsCustomer,
      updateProfile,
      addAddress,
      deleteAddress,
      setDefaultAddress,
      logout,
      hasPermission,
      can,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
