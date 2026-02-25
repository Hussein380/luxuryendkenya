import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Car, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const adminNavLinks = [{ href: '/admin', label: 'Admin Dashboard' }];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const clientNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/cars', label: 'Browse Cars' },
    ...(isAuthenticated ? [{ href: '/dashboard', label: 'My Dashboard' }] : []),
  ];
  const navLinks = isAdmin ? adminNavLinks : clientNavLinks;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-white/5 backdrop-blur-md">
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 sm:gap-3">
          <img src="/logo.png" alt="luxuryend" className="h-12 sm:h-16 w-auto object-contain" />
          <span className="font-display font-bold text-lg sm:text-xl text-white">luxuryend</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-accent',
                location.pathname === link.href
                  ? 'text-accent'
                  : 'text-slate-300'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-accent">Hi, {user?.name.split(' ')[0]}</span>
              <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-white/5" asChild>
                <Link to="/login">
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" className="gradient-accent text-accent-foreground border-0 shadow-accent" asChild>
                <Link to="/cars">Book Now</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a] border-t border-white/5 shadow-2xl"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'block py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === link.href
                      ? 'bg-accent/10 text-accent'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border space-y-2">
                {isAuthenticated ? (
                  <>
                    <p className="text-xs text-slate-500 px-3">Signed in as {user?.email}</p>
                    <Button variant="outline" className="w-full text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10" size="sm" onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full border-white/10 text-slate-300 hover:bg-white/5" size="sm" asChild onClick={() => setIsMenuOpen(false)}>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button className="w-full gradient-accent text-accent-foreground border-0" size="sm" asChild>
                      <Link to="/cars" onClick={() => setIsMenuOpen(false)}>Book Now</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
