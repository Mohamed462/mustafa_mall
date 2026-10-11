# Al Mostafa Mall (مول المصطفى) — تقرير الحالة المرجعية والتشغيل (Baseline Notes)

> **تاريخ الفحص:** 11 أكتوبر 2026  
> **حالة الفحص:** فحص عملي وتشغيل فعلي للأوامر والـ build قبل أي تعديل على الكود.

---

## 1. البنية التقنية والإصدارات الفعلية (Tech Stack & Tooling)

من واقع ملفات `package.json` و `tsconfig.json` و `vite.config.ts`:

| العنصر | التقنية المستخدمة | الإصدار الفعلي | ملاحظات وتفاصيل |
|---|---|---|---|
| **Frontend Framework** | **React** | `19.0.0` | استخدام React 19 الحديث مع `react-dom@19.0.0` |
| **Language** | **TypeScript** | `5.7.3` | إعدادات `tsconfig.app.json` و `tsconfig.node.json` مع تفعيل وضع composite و tsbuildinfo |
| **Bundler & Dev Server** | **Vite** | `6.1.0` | إعداد منفذ التشغيل `port: 3000` و `host: true` والـ alias `@ -> ./src` |
| **Routing** | **React Router DOM** | `7.2.0` | Client-Side Routing كامل مع Code-Splitting عبر `React.lazy` |
| **Styling** | **Tailwind CSS** | `3.4.17` | مع `postcss@8.5.2` و `autoprefixer@10.4.20` ومكتبات دمج الأصناف `clsx@2.1.1` و `tailwind-merge@3.0.1` |
| **Iconography** | **Lucide React** | `0.475.0` | مكتبة أيقونات SVG شاملة مع تقسيم Vendor Chunk منفصل |
| **Database Client** | **@supabase/supabase-js** | `2.49.1` | مهيأ بوضع هجين (يعمل مع Supabase إذا توفرت المتغيرات، وإلا يعتمد كلياً على `dbStore` المحلي) |

---

## 2. أوامر التشغيل والفحص الموجودة فعلياً (Scripts Audit & Baseline Execution)

الأوامر المعرفة في `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "tsc -b",
  "preview": "vite preview"
}
```

### 2.1. أمر فحص الأنواع والـ Linting (`npm run lint`):
- **الأمر:** `npm run lint` (يُشغّل `tsc -b`)
- **حالة التنفيذ:** **ناجح بنسبة 100% (Exit Code: 0)**
- **المخرجات:**
  ```text
  > al-mostafa-mall@1.0.0 lint
  > tsc -b
  ```
  *(صفر أخطاء - لا توجد أي أخطاء نوعية في ملفات TypeScript بالمشروع)*

### 2.2. أمر البناء للإنتاج (`npm run build`):
- **الأمر:** `npm run build` (يُشغّل `tsc -b && vite build`)
- **حالة التنفيذ:** **ناجح بنسبة 100% (Exit Code: 0)**
- **زمن البناء:** `4.79 ثانية`
- **عدد الموديولات المحولة:** `1713 modules transformed`
- **المخرجات:**
  - `dist/index.html` (1.68 kB)
  - `dist/assets/index-SZNUaazN.css` (71.74 kB / gzip: 11.78 kB)
  - `dist/assets/vendor-icons-DTvuQKX6.js` (43.28 kB / gzip: 8.66 kB)
  - `dist/assets/vendor-react-C9FGXDyF.js` (52.20 kB / gzip: 18.40 kB)
  - `dist/assets/index-C41HJKpP.js` (656.39 kB / gzip: 178.00 kB)
  - صفحات ومكونات Lazy Chunks مستقلة (40+ ملف chunk منفصل).

---

## 3. الملاحظات والتحذيرات السابقة لأي تعديل (Pre-existing Baseline Warnings)

1. **تحذير حجم ملف الـ Bundle الرئيسي (Vite Warning):**
   - **الرسالة:**
     ```text
     (!) Some chunks are larger than 500 kB after minification:
     dist/assets/index-C41HJKpP.js (656.39 kB │ gzip: 178.00 kB)
     Consider: Using dynamic import() or adjusting build.rollupOptions.output.manualChunks
     ```
   - **السبب:** الملف الرئيسي `index.js` يضم المكونات المشتركة و `HomePage` ومحرك `dbStore` و `mockData`.
   - **التأثير:** مجرد تنبيه تحسيني من Rollup/Vite، والبناء ناجح تماماً بدون أي أعطال.

2. **عدم وجود إطار اختبارات وحدة آلي (No Automated Test Runner):**
   - لا يوجد أمر `npm test` أو `vitest` أو `jest` في `package.json`.
   - آلية الفحص المؤكدة المتاحة دون تثبيت حزم خارجية هي `npm run lint` (`tsc -b`) و `npm run build`.

3. **وضع التخزين والباك إند (Hybrid Fallback Mode):**
   - المتغيرات `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` غير مفعلة افتراضياً، والنظام مصمم بذكاء ليعمل تلقائياً وبسلاسة عبر `dbStore.ts` في المتصفح باستخدام `localStorage` ومصفوفات `mockData.ts` مع دعم الحفظ والتعديل الدائم.

4. **المكونات المعطلة قصداً في الوضع الحالي:**
   - `BrandShopRow` و `InstallmentCalculator` يعيدان `null` في الكود ومصممان للبقاء معطلين لعدم تفعيل التقسيط أو شريط الماركات الشكلي.
