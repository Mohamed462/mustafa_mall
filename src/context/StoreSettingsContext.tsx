import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, Banner, Category, GovernorateShippingRate } from '../types';
import { dbStore } from '../services/dbStore';

interface StoreSettingsContextType {
  settings: StoreSettings;
  banners: Banner[];
  categories: Category[];
  refreshData: () => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateShippingRates: (rates: GovernorateShippingRate[]) => void;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(() => dbStore.getSettings());
  const [banners, setBanners] = useState<Banner[]>(() => dbStore.getBanners());
  const [categories, setCategories] = useState<Category[]>(() => dbStore.getCategories());

  const refreshData = () => {
    setSettings(dbStore.getSettings());
    setBanners(dbStore.getBanners());
    setCategories(dbStore.getCategories());
  };

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('al_mostafa_db_updated', handleUpdate);
    window.addEventListener('al_mostafa_shipping_updated', handleUpdate);
    return () => {
      window.removeEventListener('al_mostafa_db_updated', handleUpdate);
      window.removeEventListener('al_mostafa_shipping_updated', handleUpdate);
    };
  }, []);

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const updated = dbStore.updateSettings(newSettings);
    setSettings({ ...updated });
  };

  const updateShippingRates = (rates: GovernorateShippingRate[]) => {
    const updated = dbStore.updateGovernorateShippingRates(rates);
    setSettings({ ...updated });
  };

  return (
    <StoreSettingsContext.Provider value={{
      settings,
      banners,
      categories,
      refreshData,
      updateSettings,
      updateShippingRates,
    }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
};
