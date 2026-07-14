'use client';

import { useState, useEffect } from 'react';
import { useGetBrandsName } from '@/domains/front/reference/brand/hooks/brand.hooks';
import { useGetCarsName } from '@/domains/front/reference/car/hooks/car.hooks';
import { useGetPartCategoriesFlat } from '@/domains/front/part/hooks/part.hooks';
import { Accordion } from '@/components/composites/Accordion/Accordion';
import { Switch } from '@/components/primitives/Switch/Switch';
import { Checkbox } from '@/components/primitives/Checkbox/Checkbox';
import { PriceSlider } from '@/components/composites/PriceSlider/PriceSlider';
import { Typography } from '@/components/primitives/Typography';
import { X, Filter, ArrowRight } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { SearchProductsRequest } from '@/domains/front/product/types/view.types';
import { Modal } from '@/components/composites/Modal/Modal';

interface SearchSidebarProps {
  filters: SearchProductsRequest;
  onFilterChange: (name: string, value: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchSidebar({
  filters,
  onFilterChange,
  isOpen,
  onClose,
}: SearchSidebarProps) {
  const { data: brands = [] } = useGetBrandsName();
  const { data: carsData } = useGetCarsName({ pageNumber: 1, pageSize: 50 });
  const { data: categories = [] } = useGetPartCategoriesFlat();

  const cars = carsData?.items || [];

  const [priceRange, setPriceRange] = useState<[number, number]>([500000, 100000000]);

  useEffect(() => {
    setPriceRange([
      filters.fromPrice || 500000,
      filters.toPrice || 100000000
    ]);
  }, [filters.fromPrice, filters.toPrice]);

  const handleCheckboxChange = (name: string, id: string, checked: boolean) => {
    const currentList = (filters[name as keyof SearchProductsRequest] as string[]) || [];
    let updatedList = [...currentList];

    if (checked) {
      if (!updatedList.includes(id)) {
        updatedList.push(id);
      }
    } else {
      updatedList = updatedList.filter(item => item !== id);
    }

    onFilterChange(name, updatedList.length ? updatedList : undefined);
  };

  const handleTypeChange = (type: 'New' | 'Stock' | 'TakeOff', checked: boolean) => {
    const currentTypes = (filters.types as string[]) || [];
    let updatedTypes = [...currentTypes];

    if (checked) {
      if (!updatedTypes.includes(type)) {
        updatedTypes.push(type);
      }
    } else {
      updatedTypes = updatedTypes.filter(t => t !== type);
    }

    onFilterChange('types', updatedTypes.length ? updatedTypes : undefined);
  };

  const renderFilterContent = () => (
    <div className="w-full flex flex-col gap-5 text-right">
      <div className="flex flex-col gap-4 border-b pb-4">
        <div className="flex items-center justify-between w-full select-none">
          <span className="text-xs font-bold font-iran-sans text-foreground">فقط کالاهای موجود</span>
          <Switch
            checked={!!filters.isProductInStock}
            onChange={(checked) => onFilterChange('inStock', checked ? true : undefined)}
          />
        </div>

        <div className="flex items-center justify-between w-full select-none">
          <span className="text-xs font-bold font-iran-sans text-foreground">فقط فروشنده‌های شهر من</span>
          <Switch
            checked={!!filters.isSellerInUserCity}
            onChange={(checked) => onFilterChange('userCity', checked ? true : undefined)}
          />
        </div>

        <div className="flex items-center justify-between w-full select-none">
          <span className="text-xs font-bold font-iran-sans text-foreground">دارای تخفیف ویژه</span>
          <Switch
            checked={!!filters.hasDiscount}
            onChange={(checked) => onFilterChange('discount', checked ? true : undefined)}
          />
        </div>
      </div>

      <Accordion title="نوع قطعه">
        <div className="flex flex-col gap-2 pt-1 pr-1">
          <Checkbox
            label="همه قطعات"
            checked={!filters.types || filters.types.length === 0}
            onChange={(checked) => checked && onFilterChange('types', undefined)}
          />
          <Checkbox
            label="نو"
            checked={((filters.types as string[]) || []).includes('New')}
            onChange={(checked) => handleTypeChange('New', checked)}
          />
          <Checkbox
            label="استوک"
            checked={((filters.types as string[]) || []).includes('Stock')}
            onChange={(checked) => handleTypeChange('Stock', checked)}
          />
          <Checkbox
            label="زیرصفری"
            checked={((filters.types as string[]) || []).includes('TakeOff')}
            onChange={(checked) => handleTypeChange('TakeOff', checked)}
          />
        </div>
      </Accordion>

      {categories.length > 0 && (
        <Accordion title="قطعه">
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar pt-1 pr-1">
            {categories.map((cat: any) => (
              <Checkbox
                key={cat.id}
                label={cat.name}
                checked={((filters.partCategoryIds as string[]) || []).includes(cat.id)}
                onChange={(checked) => handleCheckboxChange('partCategoryIds', cat.id, checked)}
              />
            ))}
          </div>
        </Accordion>
      )}

      {brands.length > 0 && (
        <Accordion title="برند قطعه">
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar pt-1 pr-1">
            {brands.map((brand: any) => (
              <Checkbox
                key={brand.id}
                label={brand.name}
                checked={((filters.brandIds as string[]) || []).includes(brand.id)}
                onChange={(checked) => handleCheckboxChange('brandIds', brand.id, checked)}
              />
            ))}
          </div>
        </Accordion>
      )}

      {cars.length > 0 && (
        <Accordion title="مدل خودرو">
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar pt-1 pr-1">
            {cars.map((car: any) => (
              <Checkbox
                key={car.id}
                label={car.displayName || car.model}
                checked={((filters.carIds as string[]) || []).includes(car.id)}
                onChange={(checked) => handleCheckboxChange('carIds', car.id, checked)}
              />
            ))}
          </div>
        </Accordion>
      )}

      <Accordion title="محدوده قیمت">
        <PriceSlider
          min={500000}
          max={100000000}
          value={priceRange}
          onChange={(val) => setPriceRange(val)}
          onApply={() => {
            onFilterChange('fromPrice', priceRange[0]);
            onFilterChange('toPrice', priceRange[1]);
          }}
        />
      </Accordion>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex flex-col w-[280px] shrink-0 border rounded-xl p-5 bg-background shadow-sm h-fit">
        <div className="flex items-center gap-2 border-b pb-3 mb-4 select-none text-right">
          <Filter className="h-4.5 w-4.5 text-primary" />
          <Typography variant="h5" className="font-iran-yekan font-extrabold text-foreground">فیلترها</Typography>
        </div>
        {renderFilterContent()}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="w-full h-full max-h-full max-w-none p-0 rounded-none flex flex-col fixed inset-0 z-[80] bg-background"
        overlayClassName="bg-black/40 backdrop-blur-md"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-1 -mr-1 hover:bg-muted rounded-full"
              aria-label="Back"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold font-iran-yekan flex items-center gap-1.5 text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              فیلترها
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-full flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {renderFilterContent()}
        </div>
      </Modal>
    </>
  );
}