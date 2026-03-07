import Link from "next/link";
import { Laptop, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  about: {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
  },
  quickLinks: {
    title: "Quick Links",
    links: [
      { label: "Shop Laptops", href: "/explore?category=laptops" },
      { label: "Shop Desktops", href: "/explore?category=desktops" },
      { label: "Deals & Offers", href: "/deals" },
      { label: "Support", href: "/support" },
      { label: "Track Order", href: "/account/orders" },
    ],
  },
  support: {
    title: "Customer Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Return Policy", href: "/returns" },
      { label: "Warranty", href: "/warranty" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-electric-blue">
                <Laptop className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Laptops Official</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Pakistan&apos;s trusted destination for laptops and desktops. Quality products,
              genuine warranties, and exceptional customer service since 2020.
            </p>
            <p className="mt-3 text-sm font-medium text-electric-blue">
              &quot;Know It. Test It. Own It.&quot;
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <MapPin className="h-4 w-4 text-electric-blue" />
                <span>Shop #123, Computer Market, Hafeez Center, Lahore</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone className="h-4 w-4 text-electric-blue" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail className="h-4 w-4 text-electric-blue" />
                <span>info@laptopsofficial.pk</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300 transition-colors hover:text-electric-blue"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-700 pt-8 md:flex-row">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Laptops Official. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700/50 text-slate-300 transition-colors hover:bg-electric-blue hover:text-white"
              >
                <social.icon className="h-4 w-4" />
                <span className="sr-only">{social.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
