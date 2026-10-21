// c:\Users\Raven\final-projects\yadakchi-front\yadakchi\src\components\composites\AddressMapModal\AddressMapModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Search,
  LocateFixed,
  Loader2,
  Check,
  Building2,
  Navigation,
  Store,
  Compass,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

// =============================================================================
// پیکربندی سرور نقشه
// =============================================================================
const MAP_API_URL =
  process.env.NEXT_PUBLIC_MAP_API_URL || 'https://spatijob.com/map-api';

const IRAN_BOUNDS: [[number, number], [number, number]] = [
  [44.0, 25.0], // جنوب غربی
  [63.5, 39.8], // شمال شرقی
];

interface PlaceSearchItem {
  id: string;
  coordinates: [number, number]; // [lng, lat]
  address_summary: string | null;
  display_name: string | null;
  precision: string;
  source: string;
  place_type: string;
  score: number;
  distance_meters: number | null;
}

interface PlaceSearchResponse {
  items: PlaceSearchItem[];
  next_cursor: string | null;
  has_more: boolean;
  total_fetched: number;
  took_ms: number;
  from_cache: boolean;
}

interface ReverseGeocodeStructured {
  province?: string;
  county?: string;
  district?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  alley?: string;
  highway?: string;
}

interface ReverseGeocodeResponse {
  formatted_address: string;
  structured: ReverseGeocodeStructured;
  coordinates: [number, number];
  country_code: string;
  confidence: number;
  took_ms: number;
}

function buildAddressFromReverse(data: ReverseGeocodeResponse): string {
  if (data.formatted_address && data.formatted_address.trim().length > 0) {
    return data.formatted_address;
  }
  const parts: string[] = [];
  const s = data.structured || {};
  if (s.province) parts.push(`استان ${s.province}`);
  if (s.city && s.city !== s.province) parts.push(s.city);
  if (s.neighborhood && s.neighborhood !== s.city) parts.push(`محله ${s.neighborhood}`);
  if (s.highway && !parts.includes(s.highway)) parts.push(s.highway);
  if (s.street && !parts.includes(s.street)) parts.push(s.street);
  if (s.alley && !parts.includes(s.alley)) parts.push(`کوچه ${s.alley}`);
  return parts.length > 0 ? parts.join('، ') : 'موقعیت در ایران';
}

function extractProvinceCity(data: ReverseGeocodeResponse): {
  province: string;
  city: string;
} {
  const s = data.structured || {};
  return {
    province: s.province || '',
    city: s.city || s.county || '',
  };
}

function getPlaceBadge(type?: string) {
  const t = (type || '').toLowerCase();
  switch (t) {
    case 'street':
    case 'highway':
    case 'road':
      return {
        label: 'خیابان',
        icon: <Navigation className="w-3.5 h-3.5 text-sky-500" />,
        className: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
      };
    case 'neighborhood':
    case 'suburb':
    case 'quarter':
      return {
        label: 'محله',
        icon: <Compass className="w-3.5 h-3.5 text-indigo-500" />,
        className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
      };
    case 'city':
    case 'town':
      return {
        label: 'شهر',
        icon: <Building2 className="w-3.5 h-3.5 text-amber-500" />,
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      };
    case 'poi':
      return {
        label: 'مکان شاخص',
        icon: <Store className="w-3.5 h-3.5 text-emerald-500" />,
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      };
    default:
      return {
        label: 'مکان',
        icon: <MapPin className="w-3.5 h-3.5 text-muted-foreground" />,
        className: 'bg-muted text-foreground dark:bg-muted dark:text-muted-foreground',
      };
  }
}

function formatDistance(meters?: number | null) {
  if (meters === undefined || meters === null) return null;
  if (meters < 1000) return `${Math.round(meters)} متر`;
  return `${(meters / 1000).toFixed(1)} کیلومتر`;
}

function maxLabelsForZoom(zoom: number): number {
  if (zoom < 8) return 30;
  if (zoom < 10) return 55;
  if (zoom < 12) return 85;
  if (zoom < 14) return 80;
  if (zoom < 16) return 110;
  return 160;
}

function shouldRenderPlace(placeType: string, zoom: number): boolean {
  const type = (placeType || '').toLowerCase();
  switch (type) {
    case 'province':
      return zoom >= 6 && zoom <= 8.5;
    case 'county':
      return zoom >= 7 && zoom <= 12;
    case 'city':
      return zoom >= 7.5 && zoom <= 13.5;
    case 'suburb':
    case 'district':
    case 'city_district':
    case 'quarter':
      return zoom >= 9 && zoom <= 15;
    case 'town':
      return zoom >= 8.5 && zoom <= 14;
    case 'neighborhood':
    case 'neighbourhood':
    case 'locality':
      return zoom >= 10.5;
    case 'square':
      return zoom >= 12;
    case 'street':
    case 'highway':
    case 'road':
    case 'avenue':
      return zoom >= 14.5;
    case 'poi':
      return zoom >= 15;
    default:
      return zoom >= 12;
  }
}

const RANK_ORDER: Record<string, number> = {
  province: 100,
  county: 95,
  city: 90,
  town: 80,
  district: 75,
  city_district: 75,
  suburb: 70,
  quarter: 65,
  neighborhood: 60,
  neighbourhood: 60,
  locality: 55,
  village: 50,
  square: 40,
  street: 30,
  poi: 15,
};

function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

function checkDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark'
  );
}

function buildMapStyle(isDarkMode: boolean): any {
  const BASE_COLORS = isDarkMode
    ? {
        background: '#0D1117',
        boundary: '#1F2937',
        minorRoadCasing: '#111827',
        minorRoadCore: '#1E293B',
        primaryRoadCasing: '#1E293B',
        primaryRoadCore: '#334155',
        motorwayCasing: '#451A03',
        motorwayCore: '#D97706',
        roadLabel: '#94A3B8',
        roadHalo: '#0D1117',
      }
    : {
        background: '#F8FAFC',
        boundary: '#CBD5E1',
        minorRoadCasing: '#CBD5E1',
        minorRoadCore: '#FFFFFF',
        primaryRoadCasing: '#94A3B8',
        primaryRoadCore: '#E2E8F0',
        motorwayCasing: '#B45309',
        motorwayCore: '#F59E0B',
        roadLabel: '#475569',
        roadHalo: '#FFFFFF',
      };

  const PLACE_PALETTE = isDarkMode
    ? {
        province: '#FDE68A',
        county: '#FCD34D',
        city: '#FFFFFF',
        town: '#E2E8F0',
        district: '#93C5FD',
        suburb: '#7DD3FC',
        neighborhood: '#E2E8F0',
        square: '#94A3B8',
        poi: '#38BDF8',
        default: '#94A3B8',
        halo: '#0D1117',
      }
    : {
        province: '#78350F',
        county: '#1E293B',
        city: '#0F172A',
        town: '#334155',
        district: '#1D4ED8',
        suburb: '#0284C7',
        neighborhood: '#1E293B',
        square: '#475569',
        poi: '#0369A1',
        default: '#475569',
        halo: '#FFFFFF',
      };

  return {
    version: 8,
    glyphs:
      'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    sources: {
      base_tiles: {
        type: 'vector',
        tiles: [`${MAP_API_URL}/api/v1/base-tiles/{z}/{x}/{y}.mvt`],
        minzoom: 6,
        maxzoom: 20,
      },
      places_data: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': BASE_COLORS.background },
      },
      {
        id: 'boundaries',
        type: 'line',
        source: 'base_tiles',
        'source-layer': 'boundaries',
        paint: {
          'line-color': BASE_COLORS.boundary,
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1, 15, 1.8],
          'line-dasharray': [3, 2],
        },
      },
      {
        id: 'roads_minor_casing',
        type: 'line',
        source: 'base_tiles',
        'source-layer': 'roads',
        filter: ['!in', 'highway', 'motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
        minzoom: 12,
        paint: {
          'line-color': BASE_COLORS.minorRoadCasing,
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2.2, 14, 4, 17, 7.5],
        },
      },
      {
        id: 'roads_minor_core',
        type: 'line',
        source: 'base_tiles',
        'source-layer': 'roads',
        filter: ['!in', 'highway', 'motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
        minzoom: 12,
        paint: {
          'line-color': BASE_COLORS.minorRoadCore,
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1.4, 14, 2.8, 17, 6],
        },
      },
      {
        id: 'roads_primary_casing',
        type: 'line',
        source: 'base_tiles',
        'source-layer': 'roads',
        filter: ['in', 'highway', 'primary', 'secondary', 'tertiary'],
        minzoom: 8,
        paint: {
          'line-color': BASE_COLORS.primaryRoadCasing,
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 2.5, 12, 5, 16, 9],
        },
      },
      {
        id: 'roads_primary_core',
        type: 'line',
        source: 'base_tiles',
        'source-layer': 'roads',
        filter: ['in', 'highway', 'primary', 'secondary', 'tertiary'],
        minzoom: 8,
        paint: {
          'line-color': BASE_COLORS.primaryRoadCore,
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.8, 12, 3.8, 16, 7.5],
        },
      },
      {
        id: 'roads_motorway_casing',
        type: 'line',
        source: 'base_tiles',
        'source-layer': 'roads',
        filter: ['in', 'highway', 'motorway', 'trunk'],
        minzoom: 6,
        paint: {
          'line-color': BASE_COLORS.motorwayCasing,
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 3, 11, 6, 15, 10.5],
        },
      },
      {
        id: 'roads_motorway_core',
        type: 'line',
        source: 'base_tiles',
        'source-layer': 'roads',
        filter: ['in', 'highway', 'motorway', 'trunk'],
        minzoom: 6,
        paint: {
          'line-color': BASE_COLORS.motorwayCore,
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 2.2, 11, 4.5, 15, 8.5],
        },
      },
      {
        id: 'places_labels',
        type: 'symbol',
        source: 'places_data',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9,
            ['match', ['get', 'place_type'], 'province', 15, 'county', 14, 'city', 13, 11],
            11,
            ['match', ['get', 'place_type'], 'city', 14, 'county', 13.5, ['suburb', 'district', 'city_district'], 12, ['neighborhood', 'neighbourhood'], 11, 10.5],
            13,
            ['match', ['get', 'place_type'], 'city', 14, ['suburb', 'district', 'city_district'], 12.5, ['neighborhood', 'neighbourhood'], 11.5, 'square', 11, 11],
            15,
            ['match', ['get', 'place_type'], ['neighborhood', 'neighbourhood'], 12, 'square', 11.5, 11],
          ],
          'symbol-sort-key': [
            'match',
            ['get', 'place_type'],
            'province', 1,
            'county', 2,
            'city', 3,
            ['district', 'city_district'], 4,
            'suburb', 5,
            ['neighborhood', 'neighbourhood'], 6,
            'square', 7,
            10,
          ],
          'text-variable-anchor': ['center', 'top', 'bottom', 'left', 'right'],
          'text-letter-spacing': ['match', ['get', 'place_type'], 'county', 0.08, 0],
          'text-padding': ['interpolate', ['linear'], ['zoom'], 9, 4, 11, 8, 13, 14, 15, 10],
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color': [
            'match',
            ['get', 'place_type'],
            'province', PLACE_PALETTE.province,
            'county', PLACE_PALETTE.county,
            'city', PLACE_PALETTE.city,
            'town', PLACE_PALETTE.town,
            ['district', 'city_district'], PLACE_PALETTE.district,
            'suburb', PLACE_PALETTE.suburb,
            ['neighborhood', 'neighbourhood', 'quarter'], PLACE_PALETTE.neighborhood,
            'square', PLACE_PALETTE.square,
            'poi', PLACE_PALETTE.poi,
            PLACE_PALETTE.default,
          ],
          'text-halo-color': PLACE_PALETTE.halo,
          'text-halo-width': 2.5,
          'text-halo-blur': 1,
        },
      },
      {
        id: 'roads_labels',
        type: 'symbol',
        source: 'base_tiles',
        'source-layer': 'roads',
        filter: ['has', 'name'],
        minzoom: 13,
        layout: {
          'symbol-placement': 'line',
          'text-field': ['get', 'name'],
          'text-size': 10.5,
          'text-font': ['Noto Sans Regular'],
          'symbol-sort-key': 50,
        },
        paint: {
          'text-color': BASE_COLORS.roadLabel,
          'text-halo-color': BASE_COLORS.roadHalo,
          'text-halo-width': 2.5,
          'text-halo-blur': 0.5,
        },
      },
    ],
  };
}

// لودر بدون خطای Worker مپ‌لیبره
function loadMapLibreInstance(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;
    if ((window as any).maplibregl) {
      resolve((window as any).maplibregl);
      return;
    }

    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById('maplibre-umd-script') as HTMLScriptElement;
    if (existingScript) {
      if ((window as any).maplibregl) {
        resolve((window as any).maplibregl);
      } else {
        existingScript.addEventListener('load', () => resolve((window as any).maplibregl));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'maplibre-umd-script';
    script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
    script.onload = () => {
      resolve((window as any).maplibregl);
    };
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });
}

// =============================================================================
// کامپوننت داخلی نقشه (MapLibre GL نقشه اختصاصی)
// =============================================================================
function InternalMapComponent({
  position,
  onPositionChange,
  onDragStart,
  onDragEnd,
  onMapRef,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onMapRef?: (map: any) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;

  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;

  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const isUserDraggingRef = useRef(false);

  const placesDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const positionDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const placesAbortRef = useRef<AbortController | null>(null);
  const lastPlacesBboxRef = useRef<string>('');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const updatePlaces = useCallback(async () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('places_data');
    if (!source) return;

    const zoom = map.getZoom();
    if (zoom < 6) {
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const bounds = map.getBounds();
    const bbox = `${bounds.getWest().toFixed(6)},${bounds.getSouth().toFixed(6)},${bounds.getEast().toFixed(6)},${bounds.getNorth().toFixed(6)}`;
    const z = Math.round(zoom);

    const cacheKey = `${z}|${bbox}`;
    if (cacheKey === lastPlacesBboxRef.current) return;

    if (placesAbortRef.current) {
      placesAbortRef.current.abort();
    }
    const controller = new AbortController();
    placesAbortRef.current = controller;

    const limit = maxLabelsForZoom(zoom);

    try {
      const res = await fetch(
        `${MAP_API_URL}/api/v1/places?bbox=${bbox}&zoom=${z}&limit=${limit}`,
        {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      const places: any[] = data.places || [];

      const seen = new Set<string>();
      const uniquePlaces = places.filter((p) => {
        if (!p.coordinates || p.coordinates.length !== 2) return false;
        const key = `${p.name.trim()}|${p.coordinates[0].toFixed(3)}|${p.coordinates[1].toFixed(3)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const hierarchyFiltered = uniquePlaces.filter((p) =>
        shouldRenderPlace(p.place_type, zoom)
      );

      hierarchyFiltered.sort((a, b) => {
        const typeA = (a.place_type || '').toLowerCase();
        const typeB = (b.place_type || '').toLowerCase();
        const rankA = a.rank ?? (RANK_ORDER[typeA] || 20);
        const rankB = b.rank ?? (RANK_ORDER[typeB] || 20);
        if (rankB !== rankA) return rankB - rankA;

        const popA = a.population || 0;
        const popB = b.population || 0;
        return popB - popA;
      });

      const selected = hierarchyFiltered.slice(0, limit);

      const featureCollection = {
        type: 'FeatureCollection',
        features: selected.map((place) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: place.coordinates,
          },
          properties: {
            name: place.name,
            place_type: (place.place_type || '').toLowerCase(),
          },
        })),
      };

      source.setData(featureCollection);
      lastPlacesBboxRef.current = cacheKey;
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }
  }, []);

  const scheduleUpdatePlaces = useCallback(() => {
    if (placesDebounceRef.current) {
      clearTimeout(placesDebounceRef.current);
    }
    placesDebounceRef.current = setTimeout(updatePlaces, 350);
  }, [updatePlaces]);

  useEffect(() => {
    const update = () => setIsDarkMode(checkDarkMode());
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    if (!isWebGLAvailable()) {
      setWebglError(true);
      return;
    }

    let isCancelled = false;

    const initMap = async () => {
      try {
        const maplibregl = await loadMapLibreInstance();

        if (isCancelled || !containerRef.current) return;

        try {
          if (maplibregl.getRTLTextPluginStatus() === 'unavailable') {
            maplibregl.setRTLTextPlugin(
              'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
              null,
              true
            );
          }
        } catch (_) {}

        if (mapRef.current) {
          mapRef.current.remove();
        }

        const map = new maplibregl.Map({
          container: containerRef.current,
          center: [position[1], position[0]],
          zoom: 14.5,
          minZoom: 6,
          maxZoom: 20,
          maxBounds: IRAN_BOUNDS,
          style: buildMapStyle(isDarkMode),
          attributionControl: false,
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: true,
        });

        mapRef.current = map;
        if (onMapRef) onMapRef(map);

        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          'bottom-left'
        );

        map.on('movestart', () => {
          isUserDraggingRef.current = true;
          onDragStartRef.current?.();
        });

        map.on('moveend', () => {
          onDragEndRef.current?.();

          if (positionDebounceRef.current) {
            clearTimeout(positionDebounceRef.current);
          }
          positionDebounceRef.current = setTimeout(() => {
            const center = map.getCenter();
            onPositionChangeRef.current?.(center.lat, center.lng);
            setTimeout(() => {
              isUserDraggingRef.current = false;
            }, 100);
          }, 300);

          scheduleUpdatePlaces();
        });

        map.on('load', () => {
          if (isCancelled) return;
          setIsReady(true);
          map.resize();
          updatePlaces();
        });

        map.on('error', (e: any) => {
          const errMsg = e?.error?.message || String(e);
          if (errMsg.toLowerCase().includes('webgl')) {
            setWebglError(true);
          }
        });
      } catch (err) {
        setWebglError(true);
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      if (placesDebounceRef.current) clearTimeout(placesDebounceRef.current);
      if (positionDebounceRef.current) clearTimeout(positionDebounceRef.current);
      if (placesAbortRef.current) placesAbortRef.current.abort();

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isDarkMode]);

  useEffect(() => {
    if (!mapRef.current || !position || isUserDraggingRef.current) return;
    const center = mapRef.current.getCenter();
    const [lat, lng] = position;
    if (
      Math.abs(center.lat - lat) > 0.0001 ||
      Math.abs(center.lng - lng) > 0.0001
    ) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: Math.max(mapRef.current.getZoom(), 14),
        essential: true,
      });
    }
  }, [position]);

  if (webglError) {
    return (
      <div className="relative flex h-full min-h-[420px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
        <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 ">
          مرورگر شما از شتاب‌دهنده گرافیکی WebGL پشتیبانی نمی‌کند
        </h4>
        <button
          onClick={() => {
            setWebglError(false);
            setIsReady(false);
          }}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-amber-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[420px] overflow-hidden">
      <div
        ref={containerRef}
        className={`w-full h-full min-h-[420px] transition-colors duration-500 ${
          isDarkMode ? 'bg-[#0D1117]' : 'bg-[#F8FAFC]'
        }`}
      />

      <div
        className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-300 ${
          isReady ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}
      >
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-card/85 backdrop-blur-md shadow-lg border border-border">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="text-[12px] font-semibold tracking-tight text-foreground">
            در حال بارگذاری نقشه...
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// کامپوننت اصلی AddressMapModal
// =============================================================================
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
  initialCoordinates?: { lat: number; lon?: number; lng?: number } | null;
}

export function AddressMapModal({
  isOpen,
  onClose,
  onConfirmAddress,
  initialCoordinates = null,
}: AddressMapModalProps) {
  const [mounted, setMounted] = useState(false);

  const initLat = initialCoordinates?.lat || 35.6892;
  const initLng = initialCoordinates?.lon ?? initialCoordinates?.lng ?? 51.389;

  const [position, setPosition] = useState<[number, number]>([initLat, initLng]);
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [isMapDragging, setIsMapDragging] = useState(false);

  const [searchResults, setSearchResults] = useState<PlaceSearchItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const isUserTypingRef = useRef(false);
  const positionRef = useRef<[number, number]>(position);
  positionRef.current = position;

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const reverseGeoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reverseGeoAbortRef = useRef<AbortController | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const lastReverseGeoKeyRef = useRef<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      isUserTypingRef.current = false;
      const lat = initialCoordinates?.lat || 35.6892;
      const lng = initialCoordinates?.lon ?? initialCoordinates?.lng ?? 51.389;
      setPosition([lat, lng]);
      setSearchQuery('');
      setSearchResults([]);
      setIsDropdownOpen(false);
      lastReverseGeoKeyRef.current = '';
    }
  }, [isOpen, initialCoordinates]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (reverseGeoTimerRef.current) clearTimeout(reverseGeoTimerRef.current);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (reverseGeoAbortRef.current) reverseGeoAbortRef.current.abort();
      if (searchAbortRef.current) searchAbortRef.current.abort();
    };
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    const key = `${lat.toFixed(5)}|${lng.toFixed(5)}`;
    if (key === lastReverseGeoKeyRef.current) return;

    if (reverseGeoAbortRef.current) {
      reverseGeoAbortRef.current.abort();
    }
    const controller = new AbortController();
    reverseGeoAbortRef.current = controller;

    setIsFetchingAddress(true);
    try {
      const url = `${MAP_API_URL}/api/v1/reverse-geocoding?lat=${lat}&lon=${lng}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) {
        setAddress(`موقعیت: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        setProvince('');
        setCity('');
        return;
      }

      const data: ReverseGeocodeResponse = await response.json();
      const finalAddress = buildAddressFromReverse(data);
      setAddress(finalAddress);

      const { province: prov, city: cty } = extractProvinceCity(data);
      setProvince(prov);
      setCity(cty);

      lastReverseGeoKeyRef.current = key;
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      setAddress(`موقعیت: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setProvince('');
      setCity('');
    } finally {
      if (reverseGeoAbortRef.current === controller) {
        setIsFetchingAddress(false);
      }
    }
  }, []);

  const handlePositionChange = useCallback(
    (lat: number, lng: number) => {
      setPosition([lat, lng]);

      if (reverseGeoTimerRef.current) {
        clearTimeout(reverseGeoTimerRef.current);
      }

      reverseGeoTimerRef.current = setTimeout(() => {
        reverseGeocode(lat, lng);
      }, 500);
    },
    [reverseGeocode]
  );

  // جستجوی زنده‌ی مکان‌ها
  useEffect(() => {
    if (!isUserTypingRef.current) return;

    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      setIsSearching(false);
      if (searchAbortRef.current) searchAbortRef.current.abort();
      return;
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    searchTimerRef.current = setTimeout(async () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      const controller = new AbortController();
      searchAbortRef.current = controller;

      setIsSearching(true);
      try {
        const zoom = mapInstanceRef.current
          ? Math.round(mapInstanceRef.current.getZoom())
          : 13;

        const currentPos = positionRef.current;

        const params = new URLSearchParams({
          q: searchQuery.trim(),
          lat: currentPos[0].toFixed(6),
          lon: currentPos[1].toFixed(6),
          zoom: zoom.toString(),
          radius: '45000',
          limit: '10',
          sort: 'relevance',
        });

        const url = `${MAP_API_URL}/api/v1/search?${params.toString()}`;
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (!response.ok) {
          setSearchResults([]);
          setIsDropdownOpen(false);
          return;
        }

        const data: PlaceSearchResponse = await response.json();
        const items = data.items || [];
        setSearchResults(items);

        if (isUserTypingRef.current) {
          setIsDropdownOpen(items.length > 0);
        }
        setSelectedIndex(-1);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setSearchResults([]);
        setIsDropdownOpen(false);
      } finally {
        if (searchAbortRef.current === controller) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  const handleSelectSearchResult = useCallback(
    (result: PlaceSearchItem) => {
      isUserTypingRef.current = false;
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (searchAbortRef.current) searchAbortRef.current.abort();

      setIsDropdownOpen(false);
      setSearchResults([]);

      const [lng, lat] = result.coordinates;
      const displayTitle = result.display_name || 'موقعیت انتخابی';
      setSearchQuery(displayTitle);

      let targetZoom = 15;
      const type = (result.place_type || '').toLowerCase();
      if (type === 'city' || type === 'county') targetZoom = 12;
      else if (type === 'district' || type === 'neighborhood') targetZoom = 14;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo({
          center: [lng, lat],
          zoom: targetZoom,
          essential: true,
          duration: 1200,
        });
      }

      setPosition([lat, lng]);

      if (reverseGeoTimerRef.current) {
        clearTimeout(reverseGeoTimerRef.current);
      }
      lastReverseGeoKeyRef.current = '';
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSearchResult(searchResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const getCurrentLocation = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!navigator.geolocation) {
        showToast.error('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند');
        return;
      }

      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude } = pos.coords;

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 15.5,
              essential: true,
              duration: 1000,
            });
          }

          setPosition([latitude, longitude]);

          if (reverseGeoTimerRef.current) {
            clearTimeout(reverseGeoTimerRef.current);
          }
          lastReverseGeoKeyRef.current = '';
          reverseGeocode(latitude, longitude);

          showToast.success('موقعیت شما دریافت شد');
        },
        () => {
          setIsLocating(false);
          showToast.error('دسترسی به موقعیت شما امکان‌پذیر نیست');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    },
    [reverseGeocode]
  );

  const handleConfirm = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!address.trim()) {
        showToast.error('لطفاً ابتدا یک موقعیت معتبر روی نقشه انتخاب کنید');
        return;
      }

      onConfirmAddress({
        address,
        latitude: position[0],
        longitude: position[1],
        cityId: '1262',
        cityName: city,
        provinceName: province,
      });

      onClose();
    },
    [address, city, province, position, onConfirmAddress, onClose]
  );

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'bg-card overflow-hidden flex flex-col z-10',
            'w-full h-full md:h-[85vh] md:max-h-[750px] md:max-w-4xl md:rounded-2xl shadow-2xl border border-border'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card/60 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-foreground">
                انتخاب موقعیت روی نقشه
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar & GPS */}
          <div
            ref={searchContainerRef}
            className="p-3.5 sm:p-4 bg-card/40 border-b border-border shrink-0 relative z-30"
          >
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    isUserTypingRef.current = true;
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchResults.length > 0) setIsDropdownOpen(true);
                  }}
                  placeholder="جستجوی نام خیابان، محله، شهر یا مکان شاخص..."
                  className="w-full h-11 pe-10 ps-9 rounded-2xl border border-border bg-card text-xs font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all shadow-sm"
                />

                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        isUserTypingRef.current = false;
                        setSearchQuery('');
                        setSearchResults([]);
                        setIsDropdownOpen(false);
                      }}
                      className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="p-2.5 h-11 px-3.5 rounded-2xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary transition-colors cursor-pointer shrink-0 shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                title="موقعیت فعلی من"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
                <span className="hidden sm:inline text-xs font-bold ">
                  {isLocating ? 'در حال دریافت...' : 'موقعیت من'}
                </span>
              </button>
            </div>

            {/* دراپ‌داون نتایج جستجو */}
            <AnimatePresence>
              {isDropdownOpen && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-3.5 right-3.5 sm:left-4 sm:right-4 mt-1.5 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto divide-y divide-border/60"
                >
                  {searchResults.map((result, idx) => {
                    const titleText = result.display_name || 'بدون نام';
                    const subtitleText = result.address_summary || '';
                    const badge = getPlaceBadge(result.place_type);
                    const isSelected = idx === selectedIndex;

                    return (
                      <div
                        key={result.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSearchResult(result);
                        }}
                        className={cn(
                          'p-3 cursor-pointer transition-colors flex items-center justify-between gap-3',
                          isSelected
                            ? 'bg-primary/10'
                            : 'hover:bg-muted/80'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-xl bg-card border border-border shrink-0">
                            {badge.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-foreground truncate">
                                {titleText}
                              </p>
                              <span
                                className={cn(
                                  'text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ',
                                  badge.className
                                )}
                              >
                                {badge.label}
                              </span>
                            </div>
                            {subtitleText && (
                              <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                                {subtitleText}
                              </p>
                            )}
                          </div>
                        </div>

                        {result.distance_meters !== null &&
                          result.distance_meters !== undefined && (
                            <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap bg-card border border-border px-2 py-0.5 rounded-lg shrink-0">
                              {formatDistance(result.distance_meters)}
                            </span>
                          )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* بدنه اصلی نقشه */}
          <div className="flex-1 relative w-full h-full min-h-[350px] sm:min-h-[450px] bg-card overflow-hidden">
            <InternalMapComponent
              position={position}
              onPositionChange={handlePositionChange}
              onDragStart={() => setIsMapDragging(true)}
              onDragEnd={() => setIsMapDragging(false)}
              onMapRef={(map) => {
                mapInstanceRef.current = map;
              }}
            />

            {/* مارکر مرکز نقشه با انیمیشن بلند شدن پین */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none flex flex-col items-center justify-end h-20 w-16">
              <motion.div
                animate={{ y: isMapDragging ? -18 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="relative flex flex-col items-center origin-bottom z-20"
              >
                <div className="w-7 h-7 rounded-full bg-primary shadow-md border-2 border-white flex items-center justify-center z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-card shadow-inner" />
                </div>
                <div className="w-1.5 h-6 bg-primary -mt-1 rounded-b-full shadow-sm" />
              </motion.div>
              <motion.div
                animate={{
                  scale: isMapDragging ? 1 : 0,
                  opacity: isMapDragging ? 0.3 : 0,
                }}
                transition={{ duration: 0.15 }}
                className="w-4 h-1.5 bg-black rounded-full blur-[1.5px] -mt-1 z-10"
              />
            </div>

            {/* کارت مشخصات پستی در پایین نقشه */}
            <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-3 sm:p-3.5 shadow-xl z-10">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {isFetchingAddress ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 ms-1 animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-foreground mb-1">
                    موقعیت جغرافیایی انتخابی:
                  </p>
                  <p className="text-xs font-bold text-muted-foreground truncate">
                    {isFetchingAddress
                      ? 'در حال استخراج نشانی پستی...'
                      : address || 'نقشه را حرکت دهید تا نشانی دریافت شود'}
                  </p>
                  {(province || city) && !isFetchingAddress && (
                    <p className="text-[10px] text-muted-foreground font-bold mt-1.5">
                      استان: <strong className="text-foreground">{province}</strong> | شهر:{' '}
                      <strong className="text-foreground">{city}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-4 border-t border-border bg-card/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground font-black text-xs transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isFetchingAddress || !address.trim()}
              className="flex-1 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>تایید این موقعیت مکانی</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
