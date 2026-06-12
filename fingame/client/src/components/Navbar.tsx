import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface NavbarProps { isLanding?: boolean; }

const Navbar: React.FC<NavbarProps> = ({ isLanding = false }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const handleCTA = () => navigate(user ? "/dashboard" : "/login");
  const logoTo = isLanding || !user ? "/" : "/dashboard";

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-container-margin py-4 bg-surface/70 backdrop-blur-md border-b border-white/10 shadow-[0_0_20px_rgba(192,193,255,0.2)]">
      <Link id="tour-logo" to={logoTo} className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-full border-2 border-secondary flex items-center justify-center bg-surface-container shadow-[0_0_15px_rgba(78,222,163,0.4)] group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
        </div>
        <span className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tighter select-none">FinGame</span>
      </Link>

      <div className="flex items-center gap-3">
        {isLanding && (
          <div className="hidden md:flex items-center gap-6 mr-2">
            <a href="#features" className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">The Quest</a>
            <a href="#leaderboard" className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">Leaderboard</a>
            <a href="#testimonials" className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-colors cursor-pointer">Reviews</a>
          </div>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-9 h-9 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="bg-surface-container-high px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-inner">
              <span className="text-[18px]">🔥</span>
              <span className="font-label-caps text-label-caps text-on-surface font-semibold">{user.streak}</span>
            </div>

            <div className="relative" ref={menuRef}>
              <button type="button" onClick={() => setMenuOpen((o) => !o)}
                className="relative group cursor-pointer flex items-center gap-2"
                aria-expanded={menuOpen} aria-haspopup="true" aria-label="Account menu">
                <div className="relative w-10 h-10 rounded-full border-2 border-primary p-0.5 glow-shadow-primary active:scale-95 transition-transform">
                  {avatarError ? (
                    <div className="w-full h-full rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <img alt="Avatar" className="w-full h-full rounded-full bg-surface-container object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiI0o_WZG0NKn0em8P1BXRN30RBc3PCbe-nvFIOtE_Bq2E3LvfNSZO0NuoR_GGFDU_KMkwwls1qe3kY1yPnikHi_Ma0ORigWURhLtYBbDvqheoOFOVMUt8Pjo0OWh4JHbOj56Hj8G4EbdwAcZVmkDcoBLLqpjoIBzt0FmI4SxZKJRc8FrT5Iuu-s8_t_mKHRsz3EOf26SmxSYcfZZIYPoSQH1xmhfhbGzWLwCZc2DQcVMF7j82sKZn4XCsx-Eqz_4fjeD8zITyZpQ"
                      onError={() => setAvatarError(true)}
                    />
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-secondary text-[10px] font-bold px-1 rounded-full border border-surface text-on-secondary shadow">
                    LVL {user.level}
                  </div>
                </div>
              </button>

              <div className={`absolute right-0 top-12 w-48 bg-surface-container-high border border-white/10 rounded-xl shadow-xl py-2 z-50 transition-all duration-200 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
                <div className="px-4 py-2 border-b border-white/5">
                  <p className="text-xs text-on-surface-variant">Logged in as</p>
                  <p className="text-sm font-semibold truncate text-on-surface">{user.name}</p>
                </div>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-sm">grid_view</span> Dashboard
                </Link>
                <Link to="/quests" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-sm">military_tech</span> Quests
                </Link>
                <button type="button" onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors border-t border-white/5 mt-1 text-left">
                  <span className="material-symbols-outlined text-sm">logout</span> Log Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={handleCTA}
            className="btn-grad text-on-primary font-label-caps text-label-caps px-4 py-2 rounded-xl transition-all active:scale-95 hover:brightness-110">
            Start Quest
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
