"use client";

import { useState } from "react";
import { SlidersHorizontal, Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/explore/filter-sidebar";
import { ProductCard, Product } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

// Sample products data
const products: Product[] = [
  {
    id: "1",
    name: "Dell Latitude 5540 Business Laptop",
    brand: "Dell",
    slug: "dell-latitude-5540",
    image: "/images/products/laptop-1.jpg",
    specs: { processor: "Intel i7-1365U", ram: "16GB DDR5", storage: "512GB SSD" },
    originalPrice: 285000,
    salePrice: 245000,
    isOnSale: true,
  },
  {
    id: "2",
    name: "HP EliteBook 840 G10 Ultrabook",
    brand: "HP",
    slug: "hp-elitebook-840-g10",
    image: "/images/products/laptop-2.jpg",
    specs: { processor: "Intel i5-1345U", ram: "16GB DDR5", storage: "512GB SSD" },
    originalPrice: 265000,
    salePrice: 235000,
    isOnSale: true,
  },
  {
    id: "3",
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    brand: "Lenovo",
    slug: "lenovo-thinkpad-x1-carbon-gen11",
    image: "/images/products/laptop-3.jpg",
    specs: { processor: "Intel i7-1365U", ram: "32GB DDR5", storage: "1TB SSD" },
    originalPrice: 385000,
    salePrice: 345000,
    isOnSale: true,
  },
  {
    id: "4",
    name: "ASUS ROG Strix G16 Gaming Laptop",
    brand: "Asus",
    slug: "asus-rog-strix-g16",
    image: "/images/products/laptop-4.jpg",
    specs: { processor: "Intel i9-13980HX", ram: "32GB DDR5", storage: "1TB SSD" },
    originalPrice: 425000,
    salePrice: 395000,
    isOnSale: true,
  },
  {
    id: "5",
    name: "MacBook Air M3 13-inch",
    brand: "Apple",
    slug: "macbook-air-m3-13",
    image: "/images/products/laptop-5.jpg",
    specs: { processor: "Apple M3", ram: "8GB", storage: "256GB SSD" },
    originalPrice: 325000,
    salePrice: 299000,
    isOnSale: true,
  },
  {
    id: "6",
    name: "Dell XPS 15 9530 Premium Laptop",
    brand: "Dell",
    slug: "dell-xps-15-9530",
    image: "/images/products/laptop-6.jpg",
    specs: { processor: "Intel i7-13700H", ram: "16GB DDR5", storage: "512GB SSD" },
    originalPrice: 365000,
    salePrice: 339000,
    isOnSale: true,
  },
  {
    id: "7",
    name: "HP Victus 16 Gaming Laptop",
    brand: "HP",
    slug: "hp-victus-16",
    image: "/images/products/laptop-7.jpg",
    specs: { processor: "Intel i5-13500H", ram: "16GB DDR5", storage: "512GB SSD" },
    originalPrice: 195000,
    salePrice: 175000,
    isOnSale: true,
  },
  {
    id: "8",
    name: "Lenovo IdeaPad Slim 5 14",
    brand: "Lenovo",
    slug: "lenovo-ideapad-slim-5",
    image: "/images/products/laptop-8.jpg",
    specs: { processor: "AMD Ryzen 7", ram: "16GB DDR5", storage: "512GB SSD" },
    originalPrice: 145000,
    salePrice: 125000,
    isOnSale: true,
  },
  {
    id: "9",
    name: "ASUS ZenBook 14 OLED",
    brand: "Asus",
    slug: "asus-zenbook-14-oled",
    image: "/images/products/laptop-9.jpg",
    specs: { processor: "Intel i7-1360P", ram: "16GB LPDDR5", storage: "512GB SSD" },
    originalPrice: 215000,
    salePrice: 189000,
    isOnSale: true,
  },
  {
    id: "10",
    name: "MSI Katana 15 Gaming Laptop",
    brand: "MSI",
    slug: "msi-katana-15",
    image: "/images/products/laptop-10.jpg",
    specs: { processor: "Intel i7-13620H", ram: "16GB DDR5", storage: "1TB SSD" },
    originalPrice: 245000,
    salePrice: 219000,
    isOnSale: true,
  },
  {
    id: "11",
    name: "Acer Aspire 5 15.6-inch",
    brand: "Acer",
    slug: "acer-aspire-5",
    image: "/images/products/laptop-1.jpg",
    specs: { processor: "Intel i5-1335U", ram: "8GB DDR4", storage: "512GB SSD" },
    originalPrice: 95000,
    salePrice: 85000,
    isOnSale: true,
  },
  {
    id: "12",
    name: "HP ProBook 450 G10",
    brand: "HP",
    slug: "hp-probook-450-g10",
    image: "/images/products/laptop-2.jpg",
    specs: { processor: "Intel i5-1335U", ram: "8GB DDR4", storage: "256GB SSD" },
    originalPrice: 125000,
    salePrice: 115000,
    isOnSale: true,
  },
];

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Explore Products
          </h1>
          <p className="mt-1 text-muted-foreground">
            Find the perfect laptop or desktop for your needs
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden"
                    >
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] p-0">
                    <SheetHeader className="p-4 pb-0">
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="h-[calc(100vh-80px)] overflow-y-auto px-4 pb-4">
                      <FilterSidebar onClose={() => setIsFilterOpen(false)} />
                    </div>
                  </SheetContent>
                </Sheet>

                <span className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {startIndex + 1}-{Math.min(endIndex, products.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {products.length}
                  </span>{" "}
                  results
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden items-center gap-1 rounded-lg border border-border p-1 sm:flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      viewMode === "grid" && "bg-muted"
                    )}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      viewMode === "list" && "bg-muted"
                    )}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div
              className={cn(
                "grid gap-4",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className={viewMode === "list" ? "flex-row" : ""}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "h-9 w-9 p-0",
                    currentPage === page && "bg-navy text-white hover:bg-navy/90"
                  )}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
