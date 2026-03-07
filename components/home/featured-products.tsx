"use client";

import Link from "next/link";
import { ProductCard, type Product } from "@/components/product/product-card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Dell Latitude 5540 Business Laptop",
    brand: "Dell",
    slug: "dell-latitude-5540",
    image: "/images/products/laptop-1.jpg",
    specs: {
      processor: "Intel i7-1365U",
      ram: "16GB DDR5",
      storage: "512GB SSD",
    },
    originalPrice: 285000,
    salePrice: 249000,
    isOnSale: true,
  },
  {
    id: "2",
    name: "HP EliteBook 840 G10 Notebook",
    brand: "HP",
    slug: "hp-elitebook-840-g10",
    image: "/images/products/laptop-2.jpg",
    specs: {
      processor: "Intel i5-1345U",
      ram: "16GB DDR5",
      storage: "256GB SSD",
    },
    originalPrice: 245000,
    salePrice: 219000,
    isOnSale: true,
  },
  {
    id: "3",
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    brand: "Lenovo",
    slug: "lenovo-thinkpad-x1-carbon-gen11",
    image: "/images/products/laptop-3.jpg",
    specs: {
      processor: "Intel i7-1365U",
      ram: "32GB DDR5",
      storage: "1TB SSD",
    },
    originalPrice: 420000,
    salePrice: 385000,
    isOnSale: true,
  },
  {
    id: "4",
    name: "ASUS ROG Strix G16 Gaming Laptop",
    brand: "ASUS",
    slug: "asus-rog-strix-g16",
    image: "/images/products/laptop-4.jpg",
    specs: {
      processor: "Intel i9-13980HX",
      ram: "32GB DDR5",
      storage: "1TB SSD",
    },
    originalPrice: 550000,
    salePrice: 499000,
    isOnSale: true,
  },
];

export function FeaturedProducts() {
  return (
    <section className="bg-muted/50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-1 text-muted-foreground">
              Handpicked laptops at the best prices
            </p>
          </div>
          <Button variant="ghost" className="w-fit text-electric-blue hover:text-electric-blue/80" asChild>
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
