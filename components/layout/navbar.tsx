"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  Laptop,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/explore", label: "Explore" },
  { href: "/deals", label: "Deals" },
];

interface NavbarProps {
  cartCount?: number;
}

export function Navbar({ cartCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/95 shadow-md backdrop-blur-md"
          : "bg-background"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy">
            <Laptop className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-navy">
            Laptops Official
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-navy text-white"
                  : "text-slate hover:bg-muted hover:text-navy"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Icons */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" className="text-slate hover:text-navy">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-slate hover:text-navy" asChild>
            <Link href="/account/wishlist">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate hover:text-navy"
            asChild
          >
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-electric-blue p-0 text-xs text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 border-navy text-navy hover:bg-navy hover:text-white"
            asChild
          >
            <Link href="/auth/login">
              <User className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate hover:text-navy"
            asChild
          >
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-electric-blue p-0 text-xs text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate hover:text-navy">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy">
                    <Laptop className="h-4 w-4 text-white" />
                  </div>
                  Laptops Official
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "rounded-lg px-4 py-3 text-base font-medium transition-colors",
                      pathname === link.href
                        ? "bg-navy text-white"
                        : "text-slate hover:bg-muted hover:text-navy"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 border-t pt-6">
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" className="justify-start text-slate hover:text-navy">
                    <Search className="mr-3 h-5 w-5" />
                    Search
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-slate hover:text-navy"
                    asChild
                  >
                    <Link href="/account/wishlist" onClick={() => setIsOpen(false)}>
                      <Heart className="mr-3 h-5 w-5" />
                      Wishlist
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-slate hover:text-navy"
                    asChild
                  >
                    <Link href="/account" onClick={() => setIsOpen(false)}>
                      <User className="mr-3 h-5 w-5" />
                      Account
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  className="w-full bg-navy text-white hover:bg-navy/90"
                  asChild
                >
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
