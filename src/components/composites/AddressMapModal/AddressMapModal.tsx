'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/primitives/Input/Input';
import { Button } from '@/components/primitives/Button/Button';
import { MapPin, Search, X, Loader2, Navigation, ArrowRight } from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { useDebounce } from '@/shared/hooks/useDebounce';

interface AddressMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAddress: (addressData: {
    address: string;
    latitude: number;
    longitude: number;
    cityId: string;
    cityName: string;
    provinceName: string;
  }) => void;
  initialCoordinates?: { lat: number; lon: number } | null;
}

export function AddressMapModal({ 
  isOpen, 
  onClose, 
  onConfirmAddress,
  initialCoordinates = null
}: AddressMapModalProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [addressText, setAddressText] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>({ lat: 35.6892, lon: 51.3890 });
  const [resolvedLocation, setResolvedLocation] = useState<any>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialCoordinates) {
        setCoordinates(initialCoordinates);
      } else {
        setCoordinates({ lat: 35.6892, lon: 51.3890 });
      }
    }
  }, [isOpen, initialCoordinates]);

  useEffect(() => {
    if (!isOpen) return;

    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }

    const existingLink = document.getElementById('leaflet-css');
    if (!existingLink) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById('leaflet-js');
    if (existingScript) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      onClose();
    };

    window.history.pushState({ modalOpen: 'map-modal' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !isOpen) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = (window as any).L;
    const initialLat = coordinates.lat;
    const initialLon = coordinates.lon;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 15,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    const handleLocationUpdate = async (lat: number, lon: number) => {
      setCoordinates({ lat, lon });
      setIsGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fa`
        );
        const data = await response.json();
        if (data) {
          setAddressText(data.display_name || '');
          setResolvedLocation(data);
        }
      } catch (error) {
        showToast.error('خطا در تبدیل موقعیت به آدرس متنی');
      } finally {
        setIsGeocoding(false);
      }
    };

    handleLocationUpdate(initialLat, initialLon);

    map.on('moveend', () => {
      const center = map.getCenter();
      handleLocationUpdate(center.lat, center.lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, isOpen]);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedSearch)}&accept-language=fa&limit=5`
        );
        const data = await response.json();
        setSearchResults(data || []);
      } catch (error) {
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch]);

  const handleSelectSuggestion = async (item: any) => {
    if (!mapInstanceRef.current) return;
    const numericLat = Number(item.lat);
    const numericLon = Number(item.lon);

    mapInstanceRef.current.flyTo([numericLat, numericLon], 16);
    setCoordinates({ lat: numericLat, lon: numericLon });
    setAddressText(item.display_name || '');
    setSearchResults([]);
    setSearchQuery('');

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${numericLat}&lon=${numericLon}&accept-language=fa`
      );
      const data = await response.json();
      setResolvedLocation(data || item);
    } catch (error) {
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleConfirm = () => {
    if (!addressText.trim() || !resolvedLocation) {
      showToast.error('لطفا ابتدا یک موقعیت معتبر روی نقشه انتخاب کنید');
      return;
    }

    const addr = resolvedLocation.address || {};
    const cityName = addr.city || addr.town || addr.suburb || addr.village || '';
    const provinceName = addr.state || '';

    onConfirmAddress({
      address: addressText,
      latitude: coordinates.lat,
      longitude: coordinates.lon,
      cityId: resolvedLocation.place_id ? String(resolvedLocation.place_id).slice(0, 4) : '1262',
      cityName,
      provinceName,
    });
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center text-right" dir="rtl">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        />
      </AnimatePresence>

      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="relative z-10 w-full h-full max-h-full max-w-none md:max-w-2xl md:h-[580px] md:max-h-[90vh] md:rounded-xl p-0 overflow-hidden flex flex-col fixed inset-0 md:relative bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b shrink-0 bg-muted/20 text-right">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="md:hidden p-1 -mr-1 hover:bg-muted rounded-full"
              aria-label="Back"
            >
              <ArrowRight className="h-5 w-5 text-foreground" />
            </button>
            <span className="text-sm font-bold font-iran-yekan flex items-center gap-1.5 text-foreground">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              انتخاب موقعیت روی نقشه
            </span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="hidden md:flex rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 border-b shrink-0 bg-background flex flex-col gap-3 relative z-30">
          <div className="w-full flex gap-2 relative">
            <Input
              type="text"
              placeholder="جستجوی شهر، خیابان یا محله روی نقشه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={isSearching ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Search className="h-4 w-4 text-zinc-400" />}
              className="flex-1 text-xs font-iran-sans"
              dir="rtl"
            />
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-background border rounded-xl shadow-2xl max-h-48 overflow-y-auto mt-1 divide-y dark:divide-zinc-800">
                {searchResults.map((item: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full px-4 py-3 text-right text-xs font-medium font-iran-sans text-foreground transition-colors hover:bg-muted truncate block"
                  >
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 relative w-full bg-muted/10">
          {!mapLoaded && (
            <div className="absolute inset-0 z-50 bg-background/80 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="text-xs font-iran-sans text-muted-foreground">در حال بارگذاری نقشه...</span>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
            <MapPin className="h-9 w-9 text-primary filter drop-shadow-md" />
          </div>
        </div>

        <div className="border-t bg-background p-4 pb-safe flex flex-col gap-4 text-right z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-8 md:pb-5">
          <div className="w-full flex items-start gap-2.5">
            <Navigation className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold font-iran-yekan text-muted-foreground block mb-0.5">آدرس یاب شده بر اساس موقعیت انتخابی</span>
              {isGeocoding ? (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                  <span className="text-xs font-iran-sans">در حال استخراج آدرس پستی...</span>
                </div>
              ) : (
                <p className="text-xs font-bold font-iran-sans text-foreground leading-relaxed truncate">{addressText || 'نقشه را جابه جا کنید تا آدرس استخراج شود.'}</p>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            onClick={handleConfirm}
            disabled={!addressText.trim() || isGeocoding}
            className="rounded-xl font-iran-sans font-bold text-xs h-11 shadow-md px-5 py-2.5"
          >
            تایید موقعیت و ادامه
          </Button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}