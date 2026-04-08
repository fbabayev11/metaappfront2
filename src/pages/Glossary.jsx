import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronRight, BookOpen, Globe } from 'lucide-react'
import Layout from '../components/Layout.jsx'

const GLOSSARY = [
  {
    category: { az: "Əsas Metrikler", en: "Core Metrics" },
    emoji: "📊",
    terms: [
      {
        term: "İmpressiya / Impressions",
        az: { short: "Reklamın göstərilmə sayı", detail: "Reklamınızın neçə dəfə göstərildiyini bildirir. Eyni şəxsə bir neçə dəfə göstərilə bilər. Əhatədən (Reach) fərqli olaraq unikal deyil." },
        en: { short: "Total number of times your ad was shown", detail: "Counts every time your ad appears on a screen, including multiple views by the same person. Always higher than Reach." },
      },
      {
        term: "Əhatə / Reach",
        az: { short: "Reklamı görən unikal insan sayı", detail: "Reklamınızı görən fərqli insanların sayıdır. Hər insan yalnız bir dəfə sayılır. Impressiyadan həmişə az və ya bərabərdir." },
        en: { short: "Unique people who saw your ad", detail: "Number of distinct individuals who saw your ad at least once. Always less than or equal to Impressions." },
      },
      {
        term: "Tezlik / Frequency",
        az: { short: "Bir insanın reklamı ortalama neçə dəfə gördüyü", detail: "Frequency = Impressiya / Əhatə.\n1.0-1.5 = Əla (təzə auditoriya)\n1.5-2.0 = Yaxşı\n2.0-3.0 = Normal (diqqətlə izlə)\n3.0+ = Reklam yorğunluğu riski — kreativinizi dərhal yeniləyin!" },
        en: { short: "Average times one person saw your ad", detail: "Frequency = Impressions / Reach.\n1.0-1.5 = Excellent (fresh audience)\n1.5-2.0 = Good\n2.0-3.0 = Acceptable (monitor closely)\n3.0+ = Ad fatigue risk — refresh your creative immediately!" },
      },
      {
        term: "ROAS",
        az: { short: "Reklam xərclərinin geri qayıdışı", detail: "ROAS = Satış Dəyəri / Xərc.\n5x+ = Əla\n3-5x = Yaxşı\n2-3x = Zərərsiz (marjından asılı)\n2x altı = Adətən zərərli\nQeyd: iOS 14+ problemi səbəbilə ROAS şişirdilmiş ola bilər. Həqiqi ROAS = Ümumi Gəlir / Ümumi Xərc (MER)." },
        en: { short: "Return on Ad Spend", detail: "ROAS = Purchase Value / Spend.\n5x+ = Excellent\n3-5x = Good\n2-3x = Break-even (depends on margins)\nBelow 2x = Usually unprofitable\nNote: iOS 14+ attribution issues may inflate ROAS. Use MER for true picture." },
      },
      {
        term: "MER (Marketing Efficiency Ratio)",
        az: { short: "Bütün kanallar üzrə həqiqi səmərəlilik", detail: "MER = Ümumi Gəlir / Ümumi Reklam Xərci. iOS 14+ atribusiya problemi olduğundan ROAS-dan daha etibarlıdır. Bütün reklam kanallarınızın real effektivliyini göstərir." },
        en: { short: "True efficiency across all ad channels", detail: "MER = Total Revenue / Total Ad Spend. More reliable than ROAS due to iOS 14+ attribution issues. Gives a true picture of your overall marketing performance." },
      },
      {
        term: "CPA (Cost Per Action)",
        az: { short: "Hər nəticə üçün ödənilən xərc", detail: "CPA = Xərc / Nəticələr. Qazanc marjanızdan aşağı olmalıdır. Breakeven ROAS = 1 / Qazanc Marjanı. Məsələn: 30% marja = minimum 3.33x ROAS lazımdır." },
        en: { short: "Cost for each conversion/result", detail: "CPA = Spend / Results. Must be below your profit margin to be profitable. Breakeven ROAS = 1 / Profit Margin. Example: 30% margin = need minimum 3.33x ROAS." },
      },
    ]
  },
  {
    category: { az: "Klik Metrikleri", en: "Click Metrics" },
    emoji: "🖱️",
    terms: [
      {
        term: "CTR (Click-Through Rate)",
        az: { short: "Klik nisbəti", detail: "CTR Ümumi = Bütün kliklər / Impressiya × 100\nCTR Link = Yalnız link klikləri / Impressiya × 100\n\n2%+ = Əla, 1-2% = Yaxşı, 1% altı = Zəif\n\nCTR Ümumi yüksək amma CTR Link aşağıdırsa: insanlar elanla əlaqə qurur amma kliklənmir (yanlış auditoriya və ya zəif təklif)." },
        en: { short: "Percentage of people who clicked your ad", detail: "CTR All = All clicks / Impressions × 100\nCTR Link = Link clicks only / Impressions × 100\n\n2%+ = Excellent, 1-2% = Good, Below 1% = Poor\n\nHigh CTR All but low CTR Link = People engage but don't click through (wrong audience or weak offer)." },
      },
      {
        term: "CPC (Cost Per Click)",
        az: { short: "Hər klik üçün ödənilən xərc", detail: "CPC = Xərc / Link Klikləri\n\nCPM aşağı + CPC aşağı = Mükəmməl\nCPM aşağı + CPC yüksək = Kreativ problemi\nCPM yüksək + CPC yüksək = Həm auditoriya həm kreativ problemi" },
        en: { short: "Cost for each link click", detail: "CPC = Spend / Link Clicks\n\nLow CPM + Low CPC = Perfect (right audience + right creative)\nLow CPM + High CPC = Creative problem (not compelling enough)\nHigh CPM + High CPC = Both audience and creative problems" },
      },
      {
        term: "LPV (Landing Page Views)",
        az: { short: "Açılış səhifəsi görüntüləmələri", detail: "Link Klikləri: linki klikləyən insanlar\nLPV: səhifəsi faktiki yüklənən insanlar\n\n100 klik amma 60 LPV = 40% saytın yavaş yüklənməsi səbəbilə itirilir!\nLPV/Klik nisbəti 70%+ olmalıdır." },
        en: { short: "People whose landing page actually loaded", detail: "Link Clicks: people who clicked the link\nLPV: people whose page actually loaded\n\n100 clicks but 60 LPV = 40% lost due to slow page load!\nLPV/Click ratio should be above 70%." },
      },
      {
        term: "Outbound CTR",
        az: { short: "Facebook/Instagramdan kənara gedən klik nisbəti", detail: "Outbound CTR = Outbound Kliklər / Impressiya × 100. Real trafik keyfiyyətini ölçmək üçün adi CTR-dən daha etibarlıdır. Yalnız saytınıza gedən klikləri sayır." },
        en: { short: "Clicks going outside Facebook/Instagram", detail: "Outbound CTR = Outbound Clicks / Impressions × 100. More reliable than regular CTR for measuring real traffic quality. Only counts clicks going to your website." },
      },
    ]
  },
  {
    category: { az: "Xərc Metrikleri", en: "Cost Metrics" },
    emoji: "💰",
    terms: [
      {
        term: "CPM (Cost Per Mille)",
        az: { short: "1000 göstərişə görə xərc", detail: "CPM = (Xərc / Impressiya) × 1000\n\nTÜRKİYƏ (TL):\n100 TL altı = Əla\n100-300 TL = Yaxşı/Normal\n300 TL+ = Zəif\n\nAB/ABŞ (USD):\n$5 altı = Əla\n$5-15 = Yaxşı/Normal\n$15-30 = Yüksək\n$30+ = Çox Yüksək\n\nYüksək CPM səbəbləri: Dar auditoriya, aşağı keyfiyyət balı, yüksək rəqabət, zəif kreativ." },
        en: { short: "Cost for 1000 impressions", detail: "CPM = (Spend / Impressions) × 1000\n\nTURKEY (TL):\nUnder 100 TL = Excellent\n100-300 TL = Good/Normal\n300 TL+ = Poor\n\nEU/US (USD):\nUnder $5 = Excellent\n$5-15 = Good/Normal\n$15-30 = High\n$30+ = Very High\n\nHigh CPM causes: Narrow audience, low quality score, high competition, poor creative." },
      },
      {
        term: "Büdcə vs Xərc / Budget vs Spend",
        az: { short: "Büdcənin nə qədərinin xərcləndiyi", detail: "Xərc ≥ Büdcə = Əla! Facebook alqoritmi inamlıdır.\nXərc < Büdcənin 70%i = DİQQƏT — öyrənmə mərhələsində ola bilər.\n3 ardıcıl gün Xərc ≥ Büdcə olarsa: büdcəni 20-30% artırın." },
        en: { short: "How much of budget is actually being spent", detail: "Spend ≥ Budget = Excellent! Facebook algorithm is confident.\nSpend < 70% of Budget = WARNING — may be in learning phase.\n3 consecutive days Spend ≥ Budget: Consider increasing budget by 20-30%." },
      },
      {
        term: "AOV (Average Order Value)",
        az: { short: "Ortalama sifariş dəyəri", detail: "AOV = Ümumi Gəlir / Sifariş Sayı. Yüksək AOV = daha yüksək CPA-ya imkan verir. Upsell/cross-sell strategiyaları ilə AOV-u artırın." },
        en: { short: "Average revenue per order", detail: "AOV = Total Revenue / Number of Orders. Higher AOV allows you to afford higher CPA. Use upsell and cross-sell strategies to increase AOV." },
      },
    ]
  },
  {
    category: { az: "Dönüşüm Metrikleri", en: "Conversion Metrics" },
    emoji: "🎯",
    terms: [
      {
        term: "CVR (Conversion Rate)",
        az: { short: "Kliklerin nə qədəri alışa çevrilir", detail: "CVR = Konversiyalar / Kliklər × 100\n\nE-ticarət üçün:\n2-5% = Yaxşı\n1% altı = Zəif (açılış səhifəsi problemi)\n\nYaxşı CTR + aşağı CVR = Trafik gəlir amma sayt çevirmir." },
        en: { short: "Percentage of clicks that convert", detail: "CVR = Conversions / Clicks × 100\n\nFor e-commerce:\n2-5% = Good\nBelow 1% = Poor (likely landing page problem)\n\nGood CTR + Low CVR = Traffic comes but site doesn't convert." },
      },
      {
        term: "Alış Hunisi / Purchase Funnel",
        az: { short: "ATC → Ödəniş → Alış mərhələləri", detail: "Səbətə Əlavə (ATC) → Ödənişə Başla → Alış\n\nATC-dən Alışa Nisbəti:\n30%+ = Yaxşı\n10% altı = Zəif (ödəniş sürtüşməsi)\n\nATC yüksək amma alış yoxdursa: Qiymət problemi, ödəniş problemi və ya etibar problemi." },
        en: { short: "ATC → Checkout → Purchase stages", detail: "Add to Cart (ATC) → Initiate Checkout → Purchase\n\nATC to Purchase Rate:\n30%+ = Good\nBelow 10% = Poor (checkout friction)\n\nHigh ATC but no purchases: Price too high/low, checkout problem, or trust issue." },
      },
      {
        term: "LTV (Lifetime Value)",
        az: { short: "Müştərinin ömür boyu dəyəri", detail: "Bir müştərinin sizinlə olan münasibəti boyu gətirdiyi ümumi gəlir. LTV yüksəkdirsə, daha yüksək CPA-ya imkan verə bilərsiniz. CAC həmişə LTV-dən az olmalıdır." },
        en: { short: "Total revenue from a customer over time", detail: "Total revenue a customer generates throughout their relationship with you. Higher LTV allows you to afford higher CPA. CAC must always be less than LTV." },
      },
    ]
  },
  {
    category: { az: "Video Metrikleri", en: "Video Metrics" },
    emoji: "🎬",
    terms: [
      {
        term: "Thumbstop Rate",
        az: { short: "Videonu dayandırıb baxanların nisbəti", detail: "Thumbstop Rate = Video Oynatmaları / Impressiya × 100\n\n15-25% = Yaxşı (insanlar axını dayandırır)\n10% altı = Zəif (thumbnail diqqət çəkmir)\n\nBu metrik reklamınızın lentdə fərqlənib-fərqlənmədiyini göstərir." },
        en: { short: "People who stopped scrolling to watch", detail: "Thumbstop Rate = Video Plays / Impressions × 100\n\n15-25% = Good (people stopping their scroll)\nBelow 10% = Poor (thumbnail not attention-grabbing)\n\nMeasures how well your ad stands out in the feed." },
      },
      {
        term: "Hook Rate",
        az: { short: "İlk saniyələrin tutma gücü", detail: "Hook Rate = Video 25% Görüntüləmələri / Video Oynatmaları × 100\n\n30%+ = Yaxşı\n15% altı = Zəif\n\nThumbstop yaxşı + Hook zəif = İlk kadr axını dayandırır amma ilk saniyələr məyus edir." },
        en: { short: "How engaging the first few seconds are", detail: "Hook Rate = Video 25% Views / Video Plays × 100\n\n30%+ = Good\nBelow 15% = Poor\n\nGood Thumbstop + Poor Hook = First frame stops scroll but first seconds disappoint." },
      },
      {
        term: "Hold Rate",
        az: { short: "Videonun sonuna qədər baxanların nisbəti", detail: "Hold Rate = 15 saniyəlik izləyicilər / Video Oynatmaları × 100\n\n25%+ = Yaxşı\n10% altı = Zəif\n\nHook yaxşı + Hold Rate zəif = İlk 25% əladır amma qalanı cansıxıcıdır." },
        en: { short: "People who watched to completion", detail: "Hold Rate = 15-second viewers / Video Plays × 100\n\n25%+ = Good\nBelow 10% = Poor\n\nGood Hook + Poor Hold Rate = First 25% is great but rest is boring." },
      },
      {
        term: "ThruPlay",
        az: { short: "Videonun 15 saniyəsini izləyənlər", detail: "15 saniyə və ya bütün video (hansı qısadırsa) izlənilir. Video görüntüləmələrinin 30%+ olmalıdır. Aşağı ThruPlay = İlk 15 saniyə cansıxıcıdır." },
        en: { short: "Watched 15 seconds or entire video", detail: "Whichever is shorter: 15 seconds or the full video. Should be 30%+ of video views. Low ThruPlay = First 15 seconds are not engaging enough." },
      },
    ]
  },
  {
    category: { az: "Auditoriya Metrikleri", en: "Audience Metrics" },
    emoji: "👥",
    terms: [
      {
        term: "Auditoriya Ölçüsü / Audience Size",
        az: { short: "Hədəf auditoriyasının böyüklüyü", detail: "100K - 2M = İdeal\n10K altı = Çox dar (yüksək CPM)\n10M+ = Çox geniş (aşağı relevantlıq)\n\n2024+ üçün ən yaxşı strategiya: Geniş hədəfləmə — Facebook AI-nin auditoriya tapmasına icazə verin." },
        en: { short: "Size of your target audience", detail: "100K - 2M = Ideal\nBelow 10K = Too narrow (high CPM)\nAbove 10M = Too broad (low relevance)\n\nBest 2024+ strategy: Broad targeting — let Facebook AI find the audience." },
      },
      {
        term: "Lookalike Audience (LLA)",
        az: { short: "Mövcud müştərilərə bənzər insanlar", detail: "Mövcud müştərilərinizə əsaslanaraq yaradılır.\n1% = Ən çox bənzəyənlər (ən güclü)\n5-10% = Daha geniş (daha az hədəflənmiş)\n\nRetargetingdən sonra ən yüksək ROAS-ı adətən LLA verir." },
        en: { short: "People similar to your existing customers", detail: "Created based on your existing customers.\n1% = Most similar (strongest)\n5-10% = Broader (less targeted)\n\nLLA typically delivers the highest ROAS after retargeting." },
      },
      {
        term: "Reklam Yorğunluğu / Ad Fatigue",
        az: { short: "Auditoriya reklamdan bezib", detail: "Tezlik 3.0+ olduqda baş verir.\nƏlamətlər: Artan CPM, azalan CTR, artan CPC.\nHəll: Yeni kreativlər əlavə edin, auditoriyaları genişləndirin." },
        en: { short: "Audience getting tired of seeing your ad", detail: "Occurs when Frequency exceeds 3.0.\nSigns: Rising CPM, falling CTR, rising CPC.\nFix: Add new creatives, expand audiences, temporarily pause ads." },
      },
    ]
  },
  {
    category: { az: "Huni (Funnel) Terminləri", en: "Funnel Terms" },
    emoji: "🔽",
    terms: [
      {
        term: "TOFU (Top of Funnel)",
        az: { short: "Sizi tanımayan soyuq auditoriya", detail: "Məqsəd: Marka bilinirliyi yaratmaq. Satışa zorlamayın. Video reklamlar, maraqlı məzmun istifadə edin. CPM aşağı, ROAS aşağı (normaldir)." },
        en: { short: "Cold audiences who don't know you", detail: "Goal: Build brand awareness. Don't push sales. Use video ads and engaging content. Expect lower CPM and lower ROAS (this is normal)." },
      },
      {
        term: "MOFU (Middle of Funnel)",
        az: { short: "Sizi tanıyan isti auditoriya", detail: "Sayt ziyarətçiləri, video izləyiciləri. Məqsəd: Faydaları və sosial sübutu göstərin. Müqayisə, rəylər, case study istifadə edin." },
        en: { short: "Warm audiences who know you", detail: "Site visitors, video viewers. Goal: Show benefits and social proof. Use comparisons, reviews, and case studies." },
      },
      {
        term: "BOFU (Bottom of Funnel)",
        az: { short: "Almağa hazır isti auditoriya", detail: "Səbəti tərk edənlər, ödənişə başlayanlar. Məqsəd: Satışı bağlamaq. Təcililik, endirim, pulsuz çatdırılma istifadə edin. Ən yüksək ROAS burada olur." },
        en: { short: "Hot audiences ready to buy", detail: "Cart abandoners, checkout initiators. Goal: Close the sale. Use urgency, discounts, free shipping. Highest ROAS comes from BOFU." },
      },
      {
        term: "CBO (Campaign Budget Optimization)",
        az: { short: "Büdcə kampaniya səviyyəsində", detail: "Büdcə kampaniya səviyyəsində təyin edilir, Facebook ən yaxşı reklam dəstlərinə avtomatik paylayır. Qalib reklam dəstlərini miqyaslandırmaq üçün yaxşıdır. Sınaq üçün ABO istifadə edin." },
        en: { short: "Budget set at campaign level", detail: "Budget set at campaign level, Facebook auto-distributes to best ad sets. Good for scaling winning ad sets. Use ABO for testing, switch to CBO when you find winners." },
      },
      {
        term: "ABO (Ad Set Budget Optimization)",
        az: { short: "Büdcə reklam dəsti səviyyəsində", detail: "Hər reklam dəstinin öz büdcəsi var, manual nəzarət. Sınaq və nəzarət üçün daha yaxşıdır. Qalib tapanda CBO-ya keçin." },
        en: { short: "Budget set at ad set level", detail: "Each ad set has its own budget, manual control. Better for testing and control. When you find winners, switch to CBO for scaling." },
      },
    ]
  },
  {
    category: { az: "Kampaniya Terminləri", en: "Campaign Terms" },
    emoji: "📢",
    terms: [
      {
        term: "Öyrənmə Mərhələsi / Learning Phase",
        az: { short: "Facebook alqoritminin optimallaşdırma dövrü", detail: "~50 konversiya lazımdır. Öyrənmə zamanı reklamı dəyişdirməyin — öyrənmə sıfırlanır! Bu mərhələdə nəticələr qeyri-sabit ola bilər. Sabir olun." },
        en: { short: "Facebook algorithm's optimization period", detail: "~50 conversions needed to exit learning phase. Don't edit the ad during learning — it resets! Results may be unstable during this phase. Be patient." },
      },
      {
        term: "Advantage+ Shopping (ASC)",
        az: { short: "AI ilə optimallaşdırılmış e-ticarət kampaniyası", detail: "Həftəlik 50+ satışı olan e-ticarət üçün çox güclüdür. Facebook AI həm auditoriyani həm kreativin ən yaxşı kombinasiyasını tapır. 2024-cü ildə ən effektiv kampaniya növüdür." },
        en: { short: "AI-optimized e-commerce campaign", detail: "Very powerful for e-commerce with 50+ weekly sales. Facebook AI finds both the best audience and best creative combination. Most effective campaign type in 2024." },
      },
      {
        term: "DPA (Dynamic Product Ads)",
        az: { short: "Dinamik məhsul reklamları", detail: "İstifadəçinin baxdığı/səbətə əlavə etdiyi məhsulları göstərir. Retargeting üçün vacibdir. Məhsul kataloqu lazımdır. Ən yüksək ROAS reklamlarından biridir." },
        en: { short: "Ads showing products user viewed/carted", detail: "Shows products the user viewed or added to cart. Essential for retargeting. Requires a product catalog. One of the highest ROAS ad types available." },
      },
      {
        term: "A/B Test",
        az: { short: "İki variantı müqayisə etmək", detail: "Həmişə YALNIZ BİR dəyişən sınayın. Eyni anda çoxlu dəyişən = nəyin işlədiyini bilmirsiniz. Minimum 7 gün, statistik əhəmiyyət üçün kifayət qədər büdcə ayırın." },
        en: { short: "Testing two variants against each other", detail: "Always test ONLY ONE variable at a time. Multiple variables = you won't know what worked. Run for minimum 7 days with sufficient budget for statistical significance." },
      },
    ]
  },
]

export default function Glossary() {
  const [lang, setLang] = useState('az')
  const [search, setSearch] = useState('')
  const [openCat, setOpenCat] = useState(null)
  const [openTerm, setOpenTerm] = useState(null)

  const totalTerms = GLOSSARY.reduce((a, c) => a + c.terms.length, 0)

  const filtered = search.trim()
    ? GLOSSARY.map(cat => ({
        ...cat,
        terms: cat.terms.filter(t =>
          t.term.toLowerCase().includes(search.toLowerCase()) ||
          t[lang].short.toLowerCase().includes(search.toLowerCase()) ||
          t[lang].detail.toLowerCase().includes(search.toLowerCase())
        )
      })).filter(cat => cat.terms.length > 0)
    : GLOSSARY

  return (
    <Layout>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconWrap}><BookOpen size={24} color="#fff" /></div>
          <div>
            <h1 style={styles.pageTitle}>
              {lang === 'az' ? 'Reklam Terminləri Sözlüyü' : 'Ad Terms Glossary'}
            </h1>
            <p style={styles.subtitle}>{totalTerms} {lang === 'az' ? 'terim' : 'terms'} • {GLOSSARY.length} {lang === 'az' ? 'kateqoriya' : 'categories'}</p>
          </div>
        </div>
        {/* Language Toggle */}
        <div style={styles.langToggle}>
          <Globe size={15} color="var(--text-muted)" />
          <button onClick={() => setLang('az')} style={{ ...styles.langBtn, ...(lang === 'az' ? styles.langActive : {}) }}>AZ</button>
          <button onClick={() => setLang('en')} style={{ ...styles.langBtn, ...(lang === 'en' ? styles.langActive : {}) }}>EN</button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={styles.searchWrap}>
        <Search size={18} color="var(--text-muted)" style={styles.searchIcon} />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setOpenCat(null) }}
          placeholder={lang === 'az' ? 'Terim axtar... (CTR, ROAS, CPM...)' : 'Search terms... (CTR, ROAS, CPM...)'}
          style={styles.searchInput}
        />
        {search && <button onClick={() => setSearch('')} style={styles.clearSearch}>✕</button>}
      </motion.div>

      {/* Categories */}
      <div style={styles.list}>
        {filtered.map((cat, ci) => (
          <motion.div key={ci} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.04 }} style={styles.catBlock}>
            <button onClick={() => setOpenCat(openCat === ci ? null : ci)} style={styles.catHeader}>
              <div style={styles.catLeft}>
                <span style={styles.catEmoji}>{cat.emoji}</span>
                <span style={styles.catName}>{cat.category[lang]}</span>
                <span style={styles.catCount}>{cat.terms.length}</span>
              </div>
              <motion.div animate={{ rotate: openCat === ci ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight size={18} color="var(--text-muted)" />
              </motion.div>
            </button>

            <AnimatePresence>
              {(openCat === ci || search) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                  <div style={styles.termsList}>
                    {cat.terms.map((t, ti) => {
                      const key = `${ci}-${ti}`
                      const isOpen = openTerm === key
                      return (
                        <div key={ti} style={styles.termBlock}>
                          <button onClick={() => setOpenTerm(isOpen ? null : key)} style={styles.termHeader}>
                            <div style={styles.termLeft}>
                              <span style={styles.termName}>{t.term}</span>
                              <span style={styles.termShort}>{t[lang].short}</span>
                            </div>
                            <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronRight size={14} color="var(--text-muted)" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                                <div style={styles.termDetail}>
                                  {t[lang].detail.split('\n').map((line, i) => (
                                    <p key={i} style={styles.detailLine}>{line}</p>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div style={styles.noResult}>
            <Search size={40} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)' }}>"{search}" {lang === 'az' ? 'üçün nəticə tapılmadı' : 'not found'}</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  iconWrap: { width: '48px', height: '48px', borderRadius: '14px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px var(--accent-glow)', flexShrink: 0 },
  pageTitle: { fontSize: '24px', fontWeight: '700', marginBottom: '4px' },
  subtitle: { color: 'var(--text-muted)', fontSize: '13px' },
  langToggle: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '6px 10px' },
  langBtn: { padding: '4px 12px', borderRadius: '7px', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  langActive: { background: 'var(--gradient)', color: '#fff' },
  searchWrap: { position: 'relative', marginBottom: '20px' },
  searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  searchInput: { width: '100%', padding: '14px 16px 14px 48px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '15px', outline: 'none' },
  clearSearch: { position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  catBlock: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' },
  catHeader: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
  catLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  catEmoji: { fontSize: '20px' },
  catName: { fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' },
  catCount: { padding: '2px 8px', borderRadius: '20px', background: 'rgba(108,99,255,0.15)', color: 'var(--accent)', fontSize: '12px', fontWeight: '600' },
  termsList: { padding: '0 12px 12px' },
  termBlock: { border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '6px', overflow: 'hidden', background: 'var(--bg-secondary)' },
  termHeader: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '12px' },
  termLeft: { flex: 1, minWidth: 0 },
  termName: { display: 'block', fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' },
  termShort: { display: 'block', fontSize: '12px', color: 'var(--text-muted)' },
  termDetail: { padding: '0 16px 14px', borderTop: '1px solid var(--border)' },
  detailLine: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: '8px 0 0 0' },
  noResult: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px' },
}
