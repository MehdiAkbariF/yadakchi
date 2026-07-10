// src/components/sections/Footer/Footer.tsx

import Link from 'next/link';
import { cn } from '@/design-system/utils/cn';
import { Typography } from '@/components/primitives/Typography';
import { Input } from '@/components/primitives/Input';
import { Button } from '@/components/primitives/Button';
import { 
  InspectionPanel, 
  Send, 
  Phone, 
  Mail, 
  MapPin 
} from 'lucide-react';

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('border-t bg-muted/30', className)}>
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <Typography variant="h5">درباره یادکچی</Typography>
            <Typography variant="small" color="muted">
              بزرگترین مارکت‌پلیس خودرو و قطعات یدکی در ایران
            </Typography>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <InspectionPanel className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Send className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <Typography variant="h5">دسترسی سریع</Typography>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  محصولات
                </Link>
              </li>
              <li>
                <Link href="/shops" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  فروشگاه‌ها
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <Typography variant="h5">اطلاعات تماس</Typography>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@yadakchi.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>تهران، خیابان ولیعصر</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <Typography variant="h5">خبرنامه</Typography>
            <Typography variant="small" color="muted">
              برای دریافت آخرین تخفیف‌ها عضو شوید
            </Typography>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="ایمیل شما" 
                className="flex-1"
              />
              <Button variant="primary" size="sm">
                عضویت
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-8 text-center">
          <Typography variant="small" color="muted">
            &copy; {new Date().getFullYear()} یادکچی. تمامی حقوق محفوظ است.
          </Typography>
        </div>
      </div>
    </footer>
  );
}