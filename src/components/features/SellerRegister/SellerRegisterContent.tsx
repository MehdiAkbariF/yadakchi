'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowLeft, 
  Calculator, 
  Radio, 
  TrendingUp, 
  Store, 
  Warehouse, 
  Building2, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Wallet, 
  Package, 
  CreditCard, 
  FileBadge, 
  Upload, 
  Sliders, 
  BadgePercent, 
  Quote, 
  ChevronDown, 
  Headset 
} from 'lucide-react';

export function SellerRegisterContent() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleStartRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/login?redirect=/profile/settings';
  };

  return (
    <div className="flex flex-col w-full bg-background text-foreground antialiased overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full overflow-hidden bg-background pb-16 md:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[480px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute -top-32 right-12 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 md:px-10 lg:px-16 relative z-10 pt-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card border border-border text-foreground mb-6 shadow-xs"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-xs font-semibold text-muted-foreground ">
              شبکه سراسری تأمین‌کنندگان قطعات یدکی خودرو
            </span>
            <span className="text-border">|</span>
            <span className="text-xs text-muted-foreground  tracking-wider uppercase">
              B2B Auto Parts Network
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="lg:col-span-6 space-y-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                کسب‌وکار قطعات یدکی خود را در{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-hover to-primary-active">
                  سراسر کشور
                </span>{' '}
                گسترش دهید
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-reading max-w-xl">
                دسترسی مستقیم به بیش از ۱۵۰,۰۰۰ تعمیرگاه مجاز، فروشگاه خرده‌فروشی و نمایندگی رسمی در ۳۱ استان کشور؛ همراه با تسویه آنی پایا و سامانه یکپارچه انبارداری ابری یدک‌چی.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleStartRegister}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm sm:text-base hover:bg-primary-hover shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <span>افتتاح رایگان فروشگاه آنلاین قطعات</span>
                  <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                </button>
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted font-bold text-sm sm:text-base transition-all"
                >
                  <Calculator className="h-5 w-5 text-primary" />
                  <span>محاسبه‌گر آنلاین کارمزد و سود</span>
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
                <div className="space-y-1">
                  <div className="text-lg md:text-xl font-bold text-foreground ">۱,۲۵۰+</div>
                  <div className="text-xs text-muted-foreground">فروشگاه فعال و عمده</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg md:text-xl font-bold text-foreground ">۸۵,۰۰۰+</div>
                  <div className="text-xs text-muted-foreground">قطعه کدگذاری‌شده</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg md:text-xl font-bold text-success ">۹۸.۴٪</div>
                  <div className="text-xs text-muted-foreground">رضایت تأمین‌کنندگان</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg md:text-xl font-bold text-primary ">۲۴ ساعته</div>
                  <div className="text-xs text-muted-foreground">چرخه تسویه شبا</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 w-full"
            >
              <div className="relative rounded-2xl bg-card border border-border shadow-lg overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                
                <div className="p-4 bg-muted/50 flex flex-wrap items-center justify-between gap-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-bold text-foreground">داشبورد زنده پنل تأمین‌کننده</span>
                    <span className="text-xs  text-muted-foreground">LIVE-TELEMETRY</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background border border-border text-xs  text-success">
                    <Radio className="h-3.5 w-3.5" />
                    <span>آنلاین - انبار مرکزی تهران</span>
                  </div>
                </div>

                <div className="p-5 md:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-background border border-border">
                      <div className="text-xs text-muted-foreground mb-1">فروش ماه جاری</div>
                      <div className="text-sm sm:text-base font-bold text-foreground ">۴,۸۵۰,۰۰۰,۰۰۰</div>
                      <div className="text-xs text-success mt-1 flex items-center gap-1 ">
                        <TrendingUp className="h-3 w-3" />
                        <span>+۳۴.۲٪ رشد</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-background border border-border">
                      <div className="text-xs text-muted-foreground mb-1">در حال پردازش</div>
                      <div className="text-sm sm:text-base font-bold text-primary ">۴۸ سفارش</div>
                      <div className="text-xs text-muted-foreground mt-1">موتوری و بدنه</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-background border border-border">
                      <div className="text-xs text-muted-foreground mb-1">اقلام فعال</div>
                      <div className="text-sm sm:text-base font-bold text-foreground ">۱,۴۲۰ قلم</div>
                      <div className="text-xs text-success mt-1">همگام‌سازی ابری</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background border border-border">
                    <div className="flex items-center justify-between mb-2 text-xs  text-muted-foreground">
                      <span>روند حجم حواله‌ها (۷ روز اخیر)</span>
                      <span className="text-primary">+۱۸.۶٪ روزانه</span>
                    </div>
                    <div className="w-full h-16 flex items-end">
                      <svg className="w-full h-full stroke-primary fill-none" preserveAspectRatio="none" viewBox="0 0 500 80">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,65 L45,55 L90,60 L140,42 L190,48 L240,30 L290,38 L340,20 L390,26 L440,12 L500,6 L500,80 L0,80 Z" fill="url(#chartGrad)" stroke="none" />
                        <path d="M0,65 L45,55 L90,60 L140,42 L190,48 L240,30 L290,38 L340,20 L390,26 L440,12 L500,6" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                        <circle cx="240" cy="30" fill="currentColor" r="3.5" />
                        <circle cx="440" cy="12" fill="currentColor" r="3.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs  text-muted-foreground flex items-center justify-between">
                      <span>آخرین وضعیت قطعات در لجستیک</span>
                      <span className="text-success">SYNCED</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background flex items-center justify-between text-xs border-r-2 border-primary">
                      <span className=" text-muted-foreground">OEM-206-BRK</span>
                      <span className="text-foreground font-medium truncate px-2">لنت ترمز پژو ۲۰۶ - تکستار</span>
                      <span className="text-success  bg-success/10 px-2 py-0.5 rounded">آماده بارگیری</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background flex items-center justify-between text-xs border-r-2 border-success">
                      <span className=" text-muted-foreground">OEM-L90-SHK</span>
                      <span className="text-foreground font-medium truncate px-2">کمک‌فنر جلو رنو تندر ۹۰</span>
                      <span className="text-primary  bg-primary/10 px-2 py-0.5 rounded">صدور بارنامه</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CONNECTED B2B ECOSYSTEM (ORBIT) ================= */}
      <section className="w-full bg-card py-20 md:py-28 border-y border-border relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 md:px-10 lg:px-16">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded bg-muted border border-border text-primary  text-xs mb-3">
              HIGH-FREQUENCY AUTO LOGISTICS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              اکوسیستم متصل زنجیره تأمین یدک‌چی
            </h2>
            <p className="text-base text-muted-foreground mt-3">
              پلتفرم یدک‌چی فاصله میان کارخانجات، واردکنندگان قطعات اصلی و شبکه خرده‌فروشی را با کمترین تأخیر به صفر می‌رساند.
            </p>
          </div>

          <div className="relative w-full max-w-5xl mx-auto p-6 md:p-12 rounded-2xl bg-background border border-border">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/60 transition-all text-right group">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Store className="h-6 w-6" />
                </div>
                <span className="text-xs  text-primary uppercase">تقاضای مستقیم (RFQ)</span>
                <h3 className="text-lg font-bold text-foreground mt-1">خریداران عمده و تعمیرگاه‌ها</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  ثبت استعلام هوشمند قطعات نایاب، فاکتور رسمی سیستمی و خرید تجمیعی با پرداخت امن.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-gradient-to-b from-muted to-card border-2 border-primary shadow-lg text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground  text-xs font-bold">
                  هسته مرکزی تأمین (YOU)
                </div>
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary mb-4">
                  <Warehouse className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">فروشگاه یا انبار شما</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  پنل مدیریت هوشمند، اتصال درگاه اختصاصی و انتشار خودکار قیمت به سراسر کشور.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border hover:border-success/60 transition-all text-right group">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-success mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="text-xs  text-success uppercase">تأمین بالادستی OEM</span>
                <h3 className="text-lg font-bold text-foreground mt-1">واردکنندگان دست‌اول</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  شارژ آنی موجودی انبار شما، استعلام گمرکی و دریافت بچ‌نامبر رسمی قطعات استاندارد.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BENTO GRID FEATURES ================= */}
      <section className="w-full bg-background py-20 md:py-28">
        <div className="max-w-[1600px] mx-auto px-4 md:px-10 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs  text-primary uppercase">POWERFUL B2B INFRASTRUCTURE</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">
                ابزارهای تخصصی برای فروش بی‌وقفه قطعات
              </h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-md">
              همه امکاناتی که یک بنکدار یا پخش‌کننده قطعات یدکی برای مدیریت بدون خطای هزاران قلم کالا نیاز دارد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-8 rounded-2xl bg-card border border-border relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-muted text-primary  text-xs">
                  <RefreshCw className="h-4 w-4" />
                  <span>ERP & STOCK AUTOMATION</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold">سیستم همگام‌سازی خودکار و لحظه‌ای انبارداری</h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
                  بدون نیاز به ثبت دستی قیمت و موجودی، سیستم انبار یدک‌چی مستقیماً به نرم‌افزارهای مالی و حسابداری شما متصل شده و موجودی فروشگاه آنلاین را به‌روزرسانی می‌کند.
                </p>
                <div className="pt-2">
                  <div className="text-xs  text-muted-foreground mb-3">پشتیبانی یکپارچه از استانداردهای نرم‌افزاری:</div>
                  <div className="flex flex-wrap gap-2.5">
                    {['نرم‌افزار حسابداری هلو', 'سپیدار همکاران سیستم', 'راهکار نوین پارت', 'اکسل و CSV انبارداری', 'REST API WEBHOOK'].map((sw, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-medium">
                        {sw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 p-8 rounded-2xl bg-card border border-border flex flex-col justify-between" id="calculator">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-success/10 text-success  text-xs">
                  <Wallet className="h-4 w-4" />
                  <span>SETTLEMENT SPEED</span>
                </div>
                <h3 className="text-xl font-bold">تسویه مستقیم و آنی به شماره شبا</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  بدون معطلی‌های اداری؛ مبلغ هر سفارش پس از تأیید سلامت توسط مشتری به شبای بانکی شما حواله می‌شود.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-background border border-border">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">حواله پایا متمرکز مرکزی</span>
                  <span className="text-success ">تأیید شد ✓</span>
                </div>
                <div className="text-lg font-bold ">
                  + ۱۲۸,۵۰۰,۰۰۰ <span className="text-xs font-sans text-muted-foreground">تومان</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-8 rounded-2xl bg-card border border-border flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-muted text-foreground  text-xs">
                  <Truck className="h-4 w-4" />
                  <span>HEAVY PARTS FREIGHT</span>
                </div>
                <h3 className="text-xl font-bold">لجستیک تخصصی حمل قطعات سنگین و حساس</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  قرارداد رسمی با پایانه‌های باربری و وانت‌های مجهز به بسته‌بندی ضدضربه فوم برای سرسیلندرها، رادیاتورها و اقلام شکننده.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 p-8 rounded-2xl bg-card border border-border flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-success/20 text-success  text-xs">
                  <CreditCard className="h-4 w-4" />
                  <span>B2B CREDIT & DIGITAL CHECKS</span>
                </div>
                <h3 className="text-xl font-bold">شبکه عمده‌فروشی بین‌همکاران و اعتبار صیادی</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  امکان فروش با چک دیجیتال صیادی و خط اعتباری بانکی یدک‌چی. شما وجه کالا را تضمین‌شده دریافت می‌کنید.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP ROADMAP ================= */}
      <section className="w-full bg-card py-20 md:py-28 border-t border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-10 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs  text-primary uppercase">SELLER ADOPTION TIMELINE</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">
              از ثبت‌نام تا اولین فروش در کمتر از ۴۸ ساعت
            </h2>
            <p className="text-base text-muted-foreground mt-3">
              فرایندی روان، بی‌دردسر و مهندسی‌شده برای اینکه بدون وقفه در فعالیت سنتی، شعبه آنلاین خود را افتتاح کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '۰۱', title: 'ثبت‌نام و احراز هویت صنفی', desc: 'تایید هویت هوشمند زیر ۵ دقیقه توسط سامانه اصناف.', time: 'مدت: ۵ دقیقه', icon: FileBadge },
              { num: '۰۲', title: 'بارگذاری گروهی موجودی', desc: 'آپلود اکسل یا اتصال وب‌سرویس پارت‌نامبرها.', time: 'فرمت: اکسل / API', icon: Upload },
              { num: '۰۳', title: 'نرخ‌گذاری خودکار', desc: 'تعیین حاشیه سود عمده‌فروشی و تخفیف همکاری.', time: 'مارک‌آپ هوشمند', icon: Sliders },
              { num: '۰۴', title: 'دریافت سفارش و تسویه', desc: 'تحویل به لجستیک و واریز اتوماتیک وجه به شبا.', time: 'تسویه شاپرک', icon: BadgePercent },
            ].map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-background border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-black  text-primary">{step.num}</span>
                      <span className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground">
                        <StepIcon className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border text-xs  text-muted-foreground">
                    {step.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="w-full bg-background py-20 md:py-28">
        <div className="max-w-[1600px] mx-auto px-4 md:px-10 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs  text-success uppercase">VERIFIED MERCHANT VOICES</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">روایت همکاران بازار از تجربه همکاری با یدک‌چی</h2>
            </div>
            <div className="text-xs  text-muted-foreground">بیش از ۱,۲۵۰ فروشگاه تاییدشده در صنف قطعات یدکی</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: 'فروش ماهانه مغازه ما در چراغ برق بعد از پیوستن به سامانه یدک‌چی بیش از سه برابر رشد داشت. دیگر دغدغه وصول چک شهرستانی را نداریم.', name: 'حاج اصغر میرزایی', shop: 'پخش قطعات موتوری (چراغ برق تهران)', growth: '+۳۲۰٪ رشد فروش' },
              { quote: 'اتصال انبار با فایل اکسل فقط ۱۰ دقیقه طول کشید. حالا روزانه بیش از ۶۰ مرسوله به اقصی نقاط ایران از زاهدان تا تبریز ارسال می‌کنیم.', name: 'مهندس کاویان', shop: 'بازرگانی کیا و هیوندای (اصفهان)', growth: '+۲۱۵٪ پوشش' },
              { quote: 'بسته‌بندی استاندارد و بیمه خسارت بار یدک‌چی خیال ما را از بابت آسیب ندیدن رادیاتور و پروانه فن کاملاً راحت کرد.', name: 'حاج رضا مرادی', shop: 'سیستم خنک‌کننده (تبریز)', growth: '۹۹.۸٪ سلامت بار' },
            ].map((t, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded bg-success/10 text-success text-xs ">{t.growth}</span>
                    <Quote className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm md:text-base text-foreground leading-relaxed">{t.quote}</p>
                </div>
                <div className="pt-4 border-t border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-primary font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.shop}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section className="w-full bg-card py-20 md:py-28 border-t border-border">
        <div className="max-w-[1000px] mx-auto px-4 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs  text-primary uppercase">QUESTIONS & ANSWERS</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">پرسش‌های متداول تأمین‌کنندگان</h2>
            <p className="text-sm text-muted-foreground mt-2">پاسخ شفاف به مهم‌ترین سوالات در زمینه نحوه شروع به کار و کارمزدها</p>
          </div>

          <div className="space-y-4">
            {[
              { q: 'کارمزد فروش قطعات در سامانه یدک‌چی چقدر است؟', a: 'کارمزد معاملات کاملاً پلکانی و شفاف بین ۱.۵٪ تا ۳٪ است. هیچ‌گونه هزینه عضویت ماهانه یا راه‌اندازی دریافت نمی‌شود.' },
              { q: 'روال تسویه حساب وجوه فروش به چه صورت انجام می‌شود؟', a: 'تسویه حساب کاملاً خودکار در پایان هر چرخه پایا (۲۴ ساعت کاری پس از تایید تحویل) مستقیماً به شبای ثبت‌شده واریز می‌گردد.' },
              { q: 'آیا برای فروشندگی حتماً نیاز به انبار فیزیکی بزرگ داریم؟', a: 'خیر؛ هر فعال صنفی با داشتن جواز کسب معتبر می‌تواند قطعات خود را تعریف کند و پیک‌های اکسپرس مرسوله را از درب مغازه تحویل می‌گیرند.' },
              { q: 'نحوه بسته‌بندی قطعات آسیب‌پذیر چگونه است؟', a: 'ناوگان لجستیک مجهز به لفاف‌های حباب‌دار چندلایه و بیمه رسمی است و در صورت بروز خسارت، ارزش قطعه بلافاصله پرداخت می‌گردد.' },
            ].map((faq, idx) => (
              <div key={idx} className="rounded-xl bg-background border border-border overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 flex items-center justify-between text-right font-bold text-base hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-6 pt-0 text-sm text-muted-foreground border-t border-border/40 mt-1 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONVERSION BANNER ================= */}
      <section className="w-full bg-background py-20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-10 lg:px-16">
          <div className="relative rounded-2xl bg-card border border-border p-8 md:p-14 overflow-hidden shadow-xl">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/25 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-success/20 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center lg:text-right max-w-2xl">
                <span className="inline-block px-3 py-1 rounded bg-muted text-success text-xs ">
                  ● ثبت‌نام آنلاین و رایگان در سراسر ایران
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                  همین امروز به بزرگ‌ترین شبکه تأمین قطعات یدکی کشور بپیوندید
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  بدون هزینه ورودی و تعهد فروش. فروشگاه قطعات خودروی خود را در کمتر از ۱۰ دقیقه دیجیتال کنید و به خریداران عمده ۳۱ استان متصل شوید.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleStartRegister}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary-hover shadow-md transition-all cursor-pointer"
                >
                  <span>شروع ثبت‌نام فروشگاه شما</span>
                  <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
                </button>
                <a
                  href="tel:02191002424"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-muted border border-border text-foreground hover:bg-card font-bold text-base transition-all"
                >
                  <Headset className="h-5 w-5 text-primary" />
                  <span>مشاوره تلفنی: ۰۲۱-۹۱۰۰۲۴۲۴</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}