import React, { useState, useEffect } from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { dbStore } from '../../services/dbStore';
import { HomepageSection } from '../../types';
import { HeroCarousel } from '../../components/home/HeroCarousel';
import { CategoryDiscoveryGrid } from '../../components/home/CategoryDiscoveryGrid';
import { CuratedProductRow } from '../../components/home/CuratedProductRow';
import { PrintCenterHighlight } from '../../components/home/PrintCenterHighlight';
import { DeliveryRadar } from '../../components/home/DeliveryRadar';
import { BrandStorySection } from '../../components/home/BrandStorySection';
import { CustomerReviewsSection } from '../../components/home/CustomerReviewsSection';

export const HomePage: React.FC = () => {
  const { banners, categories } = useStoreSettings();
  const [sections, setSections] = useState<HomepageSection[]>(() => dbStore.getHomepageSections());
  const [products, setProducts] = useState(() => dbStore.getProducts());

  const allProducts = products.filter(p => p.is_active);

  // Curated collections (First 6 products per shelf, then view all)
  const offersProducts = allProducts.filter(p => p.original_price_egp && p.original_price_egp > p.price_egp);
  const newestProducts = [...allProducts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);
  const bestSellers = [...allProducts].sort((a, b) => b.sales_count - a.sales_count).slice(0, 6);

  // Sync with live db changes immediately
  useEffect(() => {
    const handleUpdate = () => {
      setSections([...dbStore.getHomepageSections()]);
      setProducts([...dbStore.getProducts()]);
    };
    window.addEventListener('al_mostafa_content_updated', handleUpdate);
    window.addEventListener('al_mostafa_db_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('al_mostafa_content_updated', handleUpdate);
      window.removeEventListener('al_mostafa_db_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Filter by is_enabled and is_visible, sorted by sort_order
  const activeSections = sections
    .filter(sec => sec.is_visible !== false && sec.is_enabled !== false)
    .sort((a, b) => a.sort_order - b.sort_order);

  const renderSection = (sec: HomepageSection) => {
    switch (sec.section_key) {
      case 'hero_carousel':
        return <HeroCarousel key={sec.id} banners={banners} />;

      case 'category_grid':
        return <CategoryDiscoveryGrid key={sec.id} categories={categories} />;

      case 'offers_shelf':
        return (
          <CuratedProductRow 
            key={sec.id}
            title={sec.title_ar && sec.title_ar !== 'عروض وتخفيضات مميزة' && sec.title_ar !== 'عروض حصرية لفترة محدودة' ? sec.title_ar : "عروض متتفوتش"}
            subtitle={sec.subtitle_ar && !sec.subtitle_ar.includes('توفير حقيقي') ? sec.subtitle_ar : "أسعار نزلت على الأرض وخصومات لفترة محدودة!"}
            products={offersProducts.slice(0, 6)}
            viewAllLink="/offers"
            badge="توفير يفرق"
          />
        );

      case 'newest_shelf':
        return (
          <CuratedProductRow 
            key={sec.id}
            title={sec.title_ar && !sec.title_ar.includes('أحدث الإضافات') && !sec.title_ar.includes('أحدث المنتجات') ? sec.title_ar : "لسه واصل طازة"}
            subtitle={sec.subtitle_ar && !sec.subtitle_ar.includes('منتجات جديدة') && !sec.subtitle_ar.includes('تشكيلات جديدة') ? sec.subtitle_ar : "أحدث بضاعة نزلت الرفوف وجاهزة للطلب فوراً!"}
            products={newestProducts}
            viewAllLink="/shop"
            badge="جديد المول"
          />
        );

      case 'best_sellers_shelf':
        return (
          <CuratedProductRow 
            key={sec.id}
            title={sec.title_ar && !sec.title_ar.includes('اختيارات مول المصطفى') ? sec.title_ar : "الأكتر طلباً ومكسر الدنيا"}
            subtitle={sec.subtitle_ar && !sec.subtitle_ar.includes('الأعلى طلباً') ? sec.subtitle_ar : "المنتجات اللي الكل بيطلبها وعليها إقبال كبير!"}
            products={bestSellers}
            viewAllLink="/shop"
            badge="الأكتر مبيعاً"
          />
        );

      case 'brands_row':
        return null;

      case 'print_center':
        return <PrintCenterHighlight key={sec.id} />;

      case 'trust_badges':
        return <BrandStorySection key={sec.id} />;

      case 'reviews':
        return <CustomerReviewsSection key={sec.id} />;

      case 'delivery_radar':
        return <DeliveryRadar key={sec.id} />;

      default:
        // Fallback by section_type
        if (sec.section_type === 'hero_carousel') return <HeroCarousel key={sec.id} banners={banners} />;
        if (sec.section_type === 'category_grid') return <CategoryDiscoveryGrid key={sec.id} categories={categories} />;
        if (sec.section_type === 'print_center') return <PrintCenterHighlight key={sec.id} />;
        if (sec.section_type === 'trust_badges') return <BrandStorySection key={sec.id} />;
        if (sec.section_type === 'reviews') return <CustomerReviewsSection key={sec.id} />;
        if (sec.section_type === 'delivery_radar') return <DeliveryRadar key={sec.id} />;
        if (sec.section_type === 'product_shelf') {
          const prods = sec.collection_filter === 'offers' 
            ? offersProducts 
            : sec.collection_filter === 'newest' 
              ? newestProducts 
              : bestSellers;
          return (
            <CuratedProductRow
              key={sec.id}
              title={sec.title_ar}
              subtitle={sec.subtitle_ar}
              products={prods.slice(0, 5)}
              viewAllLink="/shop"
            />
          );
        }
        return null;
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {activeSections.map(renderSection)}
    </div>
  );
};

