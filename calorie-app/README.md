# 🔥 ক্যালোরি ডিটেক্টর AI

ছবি তুলুন → AI বিশ্লেষণ → ক্যালোরি জানুন

## ✨ ফিচারসমূহ

- 📸 মোবাইল ক্যামেরা দিয়ে সরাসরি ছবি তোলা
- 🤖 Claude AI দিয়ে তাৎক্ষণিক খাদ্য বিশ্লেষণ
- 🔢 ক্যালোরি + প্রোটিন + কার্ব + ফ্যাট তথ্য
- 📅 দৈনিক ক্যালোরি ট্র্যাকার (localStorage)
- 💡 বাংলায় স্বাস্থ্য পরামর্শ
- 🥗 স্বাস্থ্যকর বিকল্পের পরামর্শ
- 📱 PWA সাপোর্ট (মোবাইলে অ্যাপের মতো)

---

## 🚀 Vercel-এ Deploy করার নিয়ম

### ধাপ ১: API Key নিন
1. [console.anthropic.com](https://console.anthropic.com) যান
2. লগইন করুন → **API Keys** → **Create Key**
3. Key টি কপি করে রাখুন

### ধাপ ২: GitHub-এ Push করুন
```bash
# ZIP ফাইলটি আনজিপ করুন, তারপর:
cd calorie-app

# Git initialize করুন
git init
git add .
git commit -m "Initial commit: Calorie Detector AI"

# GitHub-এ নতুন repository খুলুন
# তারপর:
git remote add origin https://github.com/YOUR_USERNAME/calorie-app.git
git branch -M main
git push -u origin main
```

### ধাপ ৩: Vercel Deploy
1. [vercel.com](https://vercel.com) যান → **New Project**
2. GitHub repository সিলেক্ট করুন
3. **Environment Variables** সেকশনে যান
4. `ANTHROPIC_API_KEY` = `আপনার API Key` যোগ করুন
5. **Deploy** বাটনে চাপুন ✅

### ধাপ ৪: লোকালে টেস্ট করুন (ঐচ্ছিক)
```bash
# .env.local.example কে .env.local হিসেবে কপি করুন
cp .env.local.example .env.local

# .env.local ফাইলে API key দিন
# তারপর:
npm install
npm run dev

# http://localhost:3000 খুলুন
```

---

## 📁 ফাইল স্ট্রাকচার

```
calorie-app/
├── pages/
│   ├── index.js        # হোমপেজ (ক্যামেরা)
│   ├── result.js       # ফলাফল পেজ
│   ├── _app.js
│   └── api/
│       └── analyze.js  # Claude API route
├── styles/
│   └── globals.css
├── public/
│   └── manifest.json   # PWA
├── package.json
└── next.config.js
```

---

## ⚠️ সাধারণ সমস্যা

**"API key not configured"** → Vercel-এ Environment Variable যোগ করুন

**ক্যামেরা কাজ করছে না** → HTTPS লাগবে (Vercel deploy করলেই HTTPS হয়)

**বিশ্লেষণ ধীর** → স্বাভাবিক, Claude AI প্রতিটি ছবি মনোযোগ দিয়ে দেখে 🙂
