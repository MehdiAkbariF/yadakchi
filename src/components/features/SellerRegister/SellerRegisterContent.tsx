'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Users, TrendingUp } from 'lucide-react';
import { useRef } from 'react';
import { Accordion } from '@/components/composites/Accordion/Accordion';

import { AnimatedBackground } from './components/AnimatedBackground';
import { CursorSpotlight } from './components/CursorSpotlight';
import { GlowTrail } from './components/GlowTrail';
import { ScrollProgress } from './components/ScrollProgress';
import { OrbitDiagram } from './components/OrbitDiagram';
import { FeatureCard } from './components/FeatureCard';
import { StepCard } from './components/StepCard';
import { TestimonialCard } from './components/TestimonialCard';
import { CTAButton } from './components/CTAButton';
import { AnimatedCounter } from './components/AnimatedCounter';
import { TextReveal } from './components/TextReveal';
import { AnimatedWaves } from './svgs/DecorativeShapes';

export function SellerRegisterContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // پارالاکس برای هیرو
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  const features = [
    { id: 'panel', title: 'پنل اختصاصی فروشگاه', desc: 'مدیریت ساده، کامل و یکپارچه فروشگاه آنلاین', color: 'text-primary bg-primary/10' },
    { id: 'accounting', title: 'مدیریت فروش و حسابداری', desc: 'گزارش دقیق فروش، تسویه و درآمد فروشنده', color: 'text-success-500 bg-success-500/10' },
    { id: 'inventory', title: 'مدیریت محصولات و موجودی', desc: 'کنترل کامل قطعات، قیمت‌ها و موجودی انبار', color: 'text-info-500 bg-info-500/10' },
    { id: 'shipping', title: 'مدیریت سفارش و ارسال', desc: 'پیگیری سریع سفارش‌ها و وضعیت ارسال آن‌ها', color: 'text-orange-500 bg-orange-500/10' },
    { id: 'ads', title: 'تبلیغات و افزایش فروش', desc: 'افزایش بازدید و جذب مشتریان با کمپین‌ها', color: 'text-warning-500 bg-warning-500/10' },
    { id: 'b2b', title: 'شبکه فروشندگان یدکچی (B2B)', desc: 'ارتباط مستقیم با فروشندگان و تأمین‌کنندگان', color: 'text-violet-500 bg-violet-500/10' },
  ];

  const steps = [
    { number: '۱', title: 'عضویت فروشنده', desc: 'ایجاد حساب فروشندگی و تکمیل اطلاعات اولیه مورد نیاز فروشگاه برای شروع همکاری' },
    { number: '۲', title: 'آموزش پنل', desc: 'آشنایی با امکانات پنل کاربری، روند ثبت موجودی، مدیریت سفارشات و روند ارسال آن‌ها' },
    { number: '۳', title: 'ثبت موجودی و قیمت', desc: 'ثبت قیمت و موجودی کالاهای موجود در یدکچی و یا درخواست افزودن قطعات موردنظر' },
    { number: '۴', title: 'آغاز فروش آنلاین', desc: 'دریافت سفارش‌های آنلاین و فروش به مشتریان سراسر ایران و ثبت کمپین‌های تبلیغاتی' },
  ];

  const testimonials = [
    { initial: 'ع', name: 'علی محمدی', shop: 'فروشگاه لوازم یدکی تهران', quote: 'بعد از عضویت در یدکچی، تعداد مشتریان ما چند برابر شد و مدیریت سفارش‌ها بسیار راحت‌تر از قبل انجام می‌شود.' },
    { initial: 'م', name: 'مهدی رضایی', shop: 'تامین‌کننده قطعات خودرو', quote: 'پشتیبانی عالی و فرآیند ثبت محصولات بسیار ساده است. توانستیم در مدت کوتاهی فروش آنلاین خود را گسترش دهیم.' },
    { initial: 'ح', name: 'حسین کریمی', shop: 'فروشنده قطعات بدنه', quote: 'بزرگ‌ترین مزیت یدکچی دسترسی به مشتریان سراسر کشور است. حالا سفارش‌هایی از شهرهای مختلف دریافت می‌کنیم.' },
  ];

  const faqs = [
    { q: 'آیا ثبت‌نام در یدکچی هزینه دارد؟', a: 'خیر، ثبت‌نام و ایجاد فروشگاه در یدکچی رایگان است.' },
    { q: 'برای فروش در یدکچی نیاز به سایت دارم؟', a: 'خیر، فروشگاه آنلاین شما داخل یدکچی فعال می‌شود و نیازی به سایت جداگانه ندارید.' },
    { q: 'چه فروشندگانی می‌توانند در یدکچی فعالیت کنند؟', a: 'تمام فروشندگان، فروشگاه‌ها، شرکت‌ها، تولیدکنندگان و فعالان حوزه قطعات یدکی خودرو می‌توانند در یدکچی فروش داشته باشند.' },
    { q: 'آیا کالاها از قبل در سایت وجود دارند؟', a: 'بله، بخش زیادی از قطعات و برندها از قبل در مارکت‌پلیس یدکچی ثبت شده‌اند.' },
    { q: 'آیا می‌توانم قطعه جدید ثبت کنم؟', a: 'بله، می‌توانید درخواست افزودن قطعات و برندهای موردنیاز خود را ثبت کنید.' },
    { q: 'چه مدارکی برای ثبت‌نام نیاز است؟', a: 'برای فروشندگان حقیقی، کارت ملی و شماره شبای بانکی نیاز است و در صورت داشتن، جواز کسب هم قابل ثبت است.' },
    { q: 'سفارش‌ها چگونه به فروشنده اعلام می‌شوند؟', a: 'تمام سفارش‌ها از طریق پنل فروشندگی و اعلان‌های سیستم به شما نمایش داده می‌شوند.' },
    { q: 'ارسال سفارش‌ها بر عهده چه کسی است؟', a: 'ارسال سفارش‌ها توسط فروشنده انجام می‌شود و وضعیت آن از طریق پنل قابل مدیریت است.' },
    { q: 'آیا امکان مدیریت چندین کالا و سفارش همزمان وجود دارد؟', a: 'بله، پنل فروشندگی برای مدیریت تعداد بالای کالاها و سفارش‌ها طراحی شده است.' },
    { q: 'تسویه حساب فروش‌ها چگونه انجام می‌شود؟', a: 'گزارش فروش و تسویه‌ها از طریق پنل فروشندگی قابل مشاهده و پیگیری است.' },
  ];

  const handleStartRegister = () => {
    window.location.href = '/login?redirect=/profile/settings';
  };

  return (
    <>
      {/* ═══════════ افکت‌های سراسری ═══════════ */}
      <ScrollProgress />
      <CursorSpotlight />
      <GlowTrail />

      <div ref={containerRef} className="relative w-full max-w-full overflow-x-clip" dir="rtl">
        {/* پس‌زمینه انیمیشن‌دار */}
        <AnimatedBackground />

        {/* خنثی‌سازی padding والد */}
        <div className="relative flex flex-col gap-24 md:gap-32 -mx-4 md:-mx-6 -mt-6">

          {/* ═══════════ HERO ═══════════ */}
          <motion.section
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative w-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative w-full max-w-[1840px] mx-auto px-4 sm:px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center min-h-[600px]">

              {/* ─── متون ─── */}
              <div className="lg:col-span-6 flex flex-col items-start gap-5 order-1">

                {/* بج بالا */}
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-2 text-label-sm font-bold text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  از بازار محلی به فروش در سراسر ایران
                </motion.span>

                {/* تیتر */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-display-md sm:text-display-lg md:text-display-xl font-black text-foreground leading-tight"
                >
                  در{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-gradient-brand">یدکچی</span>
                    <motion.svg
                      className="absolute -bottom-3 left-0 w-full h-4 text-primary/50"
                      viewBox="0 0 200 12"
                      preserveAspectRatio="none"
                    >
                      <motion.path
                        d="M0,6 Q50,0 100,6 T200,6"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
                      />
                    </motion.svg>
                  </span>{' '}
                  فروشنده شوید!
                </motion.h1>

                {/* پاراگراف با Text Reveal */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-body-md md:text-body-lg text-muted-foreground leading-loose text-justify max-w-xl"
                >
                  خریداران قطعات یدکی قبل از هر تماس یا مراجعه، اول آنلاین جستجو می‌کنند. اگر فروشگاه شما آنلاین نباشد، بخش بزرگی از مشتری‌ها را به رقبا واگذار می‌کنید. در یدکچی بدون نیاز به هزینه‌های سنگین ساخت سایت، فروشگاه رسمی خود را افتتاح کنید.
                </motion.p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="w-full sm:w-auto mt-3"
                >
                  <CTAButton onClick={handleStartRegister} label="ثبت‌نام رایگان فروشندگی" />
                </motion.div>

                {/* آمار با Animated Counter */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="flex flex-wrap items-center gap-8 mt-6 pt-6 border-t border-border/40 w-full"
                >
                  <div className="flex flex-col">
                    <AnimatedCounter
                      value={1000}
                      prefix="+"
                      className="text-heading-h4 font-black text-primary"
                    />
                    <span className="text-body-xs text-muted-foreground mt-1">فروشگاه فعال</span>
                  </div>
                  <div className="flex flex-col">
                    <AnimatedCounter
                      value={50000}
                      prefix="+"
                      className="text-heading-h4 font-black text-primary"
                    />
                    <span className="text-body-xs text-muted-foreground mt-1">کالای متنوع</span>
                  </div>
                  <div className="flex flex-col">
                    <AnimatedCounter
                      value={98}
                      suffix="٪"
                      className="text-heading-h4 font-black text-primary"
                    />
                    <span className="text-body-xs text-muted-foreground mt-1">رضایت فروشندگان</span>
                  </div>
                </motion.div>
              </div>

              {/* ─── مدار چرخان ─── */}
              <OrbitDiagram />
            </div>
          </motion.section>

          {/* ═══════════ FEATURES ═══════════ */}
          <section className="relative w-full">
            <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-12">
              <SectionHeader
                title="امکانات فروشندگان در یدکچی"
                subtitle="همه ابزارهایی که برای توسعه یک کسب‌وکار دیجیتال نیاز دارید"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {features.map((feat, i) => (
                  <FeatureCard key={feat.id} feat={feat} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ STEPS ═══════════ */}
          <section className="relative w-full">
            <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-12">
              <SectionHeader
                title="مسیر فروشنده شدن"
                subtitle="فقط در ۴ قدم ساده، فروشگاه آنلاین خود را راه‌اندازی کنید"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {steps.map((step, i) => (
                  <StepCard key={i} step={step} index={i} isLast={i === steps.length - 1} />
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ TESTIMONIALS ═══════════ */}
          <section className="relative w-full">
            <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-12">
              <SectionHeader
                title="فروشندگان درباره یدکچی چه می‌گویند؟"
                subtitle="تجربه همکاران واقعی فعال در سراسر کشور"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {testimonials.map((t, i) => (
                  <TestimonialCard key={i} testimonial={t} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════ FAQ ═══════════ */}
          <section className="relative w-full">
            <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-12">
              <SectionHeader
                title="پرسش و پاسخ"
                subtitle="پاسخ به سوالات متداول فروشندگان"
              />

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-3xl mx-auto"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 via-transparent to-primary/20 rounded-3xl blur-sm" />

                <div className="relative flex flex-col gap-1 bg-card border border-border/60 rounded-3xl p-4 sm:p-6 shadow-xl">
                  {faqs.map((faq, idx) => (
                    <Accordion key={idx} title={faq.q}>
                      <p className="text-body-sm leading-loose text-muted-foreground text-justify pr-1 pb-1">
                        {faq.a}
                      </p>
                    </Accordion>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ═══════════ FINAL CTA ═══════════ */}
          <section className="relative w-full mt-16">
            <div className="absolute inset-0 overflow-hidden">
              <AnimatedWaves className="opacity-50" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative w-full bg-gradient-to-br from-primary/15 via-primary/5 to-card border-y border-primary/30 py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 overflow-hidden shadow-2xl"
            >
              {/* آیکون تزئینی بزرگ */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Users className="absolute -left-12 -bottom-12 w-64 h-64 text-primary/5 pointer-events-none" />
              </motion.div>

              <div className="relative w-full max-w-[1840px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col text-right gap-4 z-10 max-w-lg mx-auto md:mx-0 md:mr-auto">
                  <motion.h3
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-display-md sm:text-display-lg md:text-display-xl font-black text-foreground"
                  >
                    آماده‌ی ورود به بازار آنلاین هستید؟
                  </motion.h3>
                  <p className="text-body-md md:text-body-lg text-muted-foreground leading-relaxed">
                    ثبت‌نام فروشگاه کمتر از ۵ دقیقه زمان می‌برد. همین امروز شعبه آنلاین کسب‌وکار خود را راه‌اندازی کنید.
                  </p>

                  {/* آمار زنده */}
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                      <span className="text-body-sm text-muted-foreground">
                        <AnimatedCounter value={1247} className="font-bold text-foreground" /> فروشنده فعال
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success-500" />
                      <span className="text-body-sm text-muted-foreground">
                        <AnimatedCounter value={384} prefix="+" className="font-bold text-foreground" /> امروز
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 shrink-0">
                  <CTAButton onClick={handleStartRegister} label="شروع ثبت‌نام فروشنده" size="lg" />
                </div>
              </div>
            </motion.div>
          </section>

        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════
// 📝 SECTION HEADER
// ═══════════════════════════════════════════════

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-display-sm sm:text-display-md md:text-display-lg font-black text-foreground relative"
      >
        <TextReveal text={title} staggerDelay={0.08} />

        <motion.svg
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-3 text-primary"
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,2 Q25,0 50,2 T100,2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </motion.svg>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-body-md text-muted-foreground max-w-md mt-3"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}