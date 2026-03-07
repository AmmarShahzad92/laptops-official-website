import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { DealsBanner } from "@/components/home/deals-banner";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { PopularProducts } from "@/components/home/popular-products";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <DealsBanner />
      <WhyChooseUs />
      <PopularProducts />
    </>
  );
}
