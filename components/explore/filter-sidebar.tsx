"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-electric-blue transition-colors"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

const brands = ["Dell", "HP", "Lenovo", "Apple", "Acer", "Asus", "MSI"];
const productTypes = ["Laptop", "Desktop", "Tower"];
const screenSizes = ['13.3"', '14"', '15.6"', '17"'];
const processors = ["i3", "i5", "i7", "Ryzen 5", "Ryzen 7", "M1"];
const ramOptions = ["4GB", "8GB", "16GB", "32GB"];
const storageOptions = ["256GB", "512GB", "1TB"];
const colors = [
  { name: "Silver", value: "#C0C0C0" },
  { name: "Space Gray", value: "#4A4A4A" },
  { name: "Black", value: "#1a1a1a" },
  { name: "White", value: "#FFFFFF" },
  { name: "Blue", value: "#2563EB" },
  { name: "Rose Gold", value: "#B76E79" },
];

interface FilterSidebarProps {
  className?: string;
  onClose?: () => void;
}

export function FilterSidebar({ className, onClose }: FilterSidebarProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [productType, setProductType] = useState("Laptop");
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [selectedProcessors, setSelectedProcessors] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([50000, 500000]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckboxChange = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setProductType("Laptop");
    setSelectedScreens([]);
    setSelectedProcessors([]);
    setSelectedRam([]);
    setSelectedStorage([]);
    setPriceRange([50000, 500000]);
    setSelectedColor(null);
  };

  const activeFilterCount =
    selectedBrands.length +
    selectedScreens.length +
    selectedProcessors.length +
    selectedRam.length +
    selectedStorage.length +
    (selectedColor ? 1 : 0) +
    (priceRange[0] !== 50000 || priceRange[1] !== 500000 ? 1 : 0);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Filters</h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-electric-blue hover:text-electric-blue/80 h-auto p-0"
          >
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Scrollable Filter Content */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {/* Brand Filter */}
        <FilterSection title="Brand">
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() =>
                    handleCheckboxChange(brand, selectedBrands, setSelectedBrands)
                  }
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Product Type Filter */}
        <FilterSection title="Product Type">
          <RadioGroup value={productType} onValueChange={setProductType}>
            {productTypes.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <RadioGroupItem value={type} id={`type-${type}`} />
                <Label
                  htmlFor={`type-${type}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {type}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </FilterSection>

        {/* Screen Size Filter */}
        <FilterSection title="Screen Size">
          <div className="space-y-2">
            {screenSizes.map((size) => (
              <div key={size} className="flex items-center gap-2">
                <Checkbox
                  id={`screen-${size}`}
                  checked={selectedScreens.includes(size)}
                  onCheckedChange={() =>
                    handleCheckboxChange(size, selectedScreens, setSelectedScreens)
                  }
                />
                <Label
                  htmlFor={`screen-${size}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Processor Filter */}
        <FilterSection title="Processor">
          <div className="space-y-2">
            {processors.map((processor) => (
              <div key={processor} className="flex items-center gap-2">
                <Checkbox
                  id={`processor-${processor}`}
                  checked={selectedProcessors.includes(processor)}
                  onCheckedChange={() =>
                    handleCheckboxChange(
                      processor,
                      selectedProcessors,
                      setSelectedProcessors
                    )
                  }
                />
                <Label
                  htmlFor={`processor-${processor}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {processor}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* RAM Filter */}
        <FilterSection title="RAM">
          <div className="space-y-2">
            {ramOptions.map((ram) => (
              <div key={ram} className="flex items-center gap-2">
                <Checkbox
                  id={`ram-${ram}`}
                  checked={selectedRam.includes(ram)}
                  onCheckedChange={() =>
                    handleCheckboxChange(ram, selectedRam, setSelectedRam)
                  }
                />
                <Label
                  htmlFor={`ram-${ram}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {ram}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Storage Filter */}
        <FilterSection title="Storage">
          <div className="space-y-2">
            {storageOptions.map((storage) => (
              <div key={storage} className="flex items-center gap-2">
                <Checkbox
                  id={`storage-${storage}`}
                  checked={selectedStorage.includes(storage)}
                  onCheckedChange={() =>
                    handleCheckboxChange(storage, selectedStorage, setSelectedStorage)
                  }
                />
                <Label
                  htmlFor={`storage-${storage}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {storage}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection title="Price Range">
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={1000000}
              step={10000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </FilterSection>

        {/* Color Filter */}
        <FilterSection title="Color">
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() =>
                  setSelectedColor(selectedColor === color.value ? null : color.value)
                }
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
                  selectedColor === color.value
                    ? "border-electric-blue ring-2 ring-electric-blue ring-offset-2"
                    : "border-border"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Apply Button (Mobile) */}
      {onClose && (
        <div className="pt-4 border-t border-border">
          <Button
            onClick={onClose}
            className="w-full bg-navy text-white hover:bg-navy/90"
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
}
