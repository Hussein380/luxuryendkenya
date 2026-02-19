import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
              <img src="/logo.png" alt="Sol Travel Group" className="h-10 w-auto" />
              <span>Sol Travel Group</span>
            </Link>
            <p className="text-sm text-primary-foreground/70">
              Premium car rental experience with the best vehicles and exceptional service.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cars" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Browse Cars</Link></li>
              <li><Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Special Offers</Link></li>
              <li><Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Locations</Link></li>
              <li><Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Help Center</a></li>
              <li><Link to="/terms" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Terms of Service</Link></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <MapPin className="w-4 h-4" />
                Nairobi, Kenya
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Phone className="w-4 h-4" />
                <a href="tel:+254722235748" className="hover:text-primary-foreground transition-colors">+254 722 235 748</a>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Mail className="w-4 h-4" />
                <a href="mailto:soltravelgroupltd@gmail.com" className="hover:text-primary-foreground transition-colors">soltravelgroupltd@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Sol Travel Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
