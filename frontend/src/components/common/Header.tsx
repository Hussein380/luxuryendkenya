import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Car, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/cars', label: 'Browse Cars' },
  { href: '/admin', label: 'Admin' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
            <Car className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="hidden sm:block">DriveEase</span>
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
                  : 'text-muted-foreground'
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
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive" onClick={logout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <Link to="/login">
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" className="gradient-accent text-accent-foreground border-0 shadow-accent">
                Book Now
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
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
            className="md:hidden glass border-t border-border/50"
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
                      : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border space-y-2">
                {isAuthenticated ? (
                  <>
                    <p className="text-xs text-muted-foreground px-3">Signed in as {user?.email}</p>
                    <Button variant="outline" className="w-full text-destructive" size="sm" onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" size="sm" asChild onClick={() => setIsMenuOpen(false)}>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button className="w-full gradient-accent text-accent-foreground border-0" size="sm">
                      Book Now
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
