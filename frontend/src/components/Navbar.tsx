/**
 * Navbar Component
 * Top navigation bar with login/logout and user menu
 */
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // CRITICAL: Wait for Privy to be ready before accessing wallets
  // Get Privy embedded wallet
  const privyWallet = ready ? wallets.find(w => w.walletClientType === 'privy') : undefined;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get user email or address
  const userDisplay = user?.email?.address || privyWallet?.address || 'User';

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-background/90 backdrop-blur-xl border-b border-primary/30 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono font-bold text-xl text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            MANTLEFORGE
          </motion.div>
        </Link>

        {/* Navigation Menu - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/"
            className={`font-mono text-sm px-3 py-2 rounded transition-colors ${
              isActive('/')
                ? 'text-primary bg-primary/10 border border-primary/30'
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            HOME
          </Link>
          <Link
            to="/about"
            className={`font-mono text-sm px-3 py-2 rounded transition-colors ${
              isActive('/about')
                ? 'text-primary bg-primary/10 border border-primary/30'
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            ABOUT
          </Link>
          <Link
            to="/features"
            className={`font-mono text-sm px-3 py-2 rounded transition-colors ${
              isActive('/features')
                ? 'text-primary bg-primary/10 border border-primary/30'
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            FEATURES
          </Link>
          <Link
            to="/assets"
            className={`font-mono text-sm px-3 py-2 rounded transition-colors ${
              isActive('/assets')
                ? 'text-primary bg-primary/10 border border-primary/30'
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            ASSETS
          </Link>
          <Link
            to="/history"
            className={`font-mono text-sm px-3 py-2 rounded transition-colors ${
              isActive('/history')
                ? 'text-primary bg-primary/10 border border-primary/30'
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            TX HISTORY
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden text-primary p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showMobileMenu ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Right side - Login/User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {!ready ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : !authenticated ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => login()}
              className="px-4 py-2 bg-primary text-background font-mono text-sm font-bold rounded hover:bg-primary/90 transition-colors"
            >
              LOGIN
            </motion.button>
          ) : (
            <div className="relative" ref={menuRef}>
              {/* User Info Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded font-mono text-sm hover:bg-primary/20 transition-colors"
              >
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-primary">
                  {user?.email?.address ? user.email.address : formatAddress(privyWallet?.address || '')}
                </span>
                <svg
                  className={`w-4 h-4 text-primary transition-transform ${showMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              {/* Dropdown Menu */}
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-background border border-primary/30 rounded shadow-lg overflow-hidden"
                >
                  {/* User Info */}
                  <div className="p-4 border-b border-primary/20">
                    <div className="text-xs text-gray-500 mb-1">Email</div>
                    <div className="text-sm text-primary font-mono">{user?.email?.address || 'N/A'}</div>
                    {privyWallet && (
                      <>
                        <div className="text-xs text-gray-500 mt-3 mb-1">Wallet Address</div>
                        <div className="text-xs text-gray-400 font-mono break-all">{privyWallet.address}</div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded font-mono transition-colors text-left"
                    >
                      LOGOUT
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-md"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className={`block font-mono text-sm px-3 py-2 rounded transition-colors ${
                isActive('/')
                  ? 'text-primary bg-primary/10 border border-primary/30'
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              HOME
            </Link>
            <Link
              to="/about"
              onClick={() => setShowMobileMenu(false)}
              className={`block font-mono text-sm px-3 py-2 rounded transition-colors ${
                isActive('/about')
                  ? 'text-primary bg-primary/10 border border-primary/30'
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              ABOUT
            </Link>
            <Link
              to="/features"
              onClick={() => setShowMobileMenu(false)}
              className={`block font-mono text-sm px-3 py-2 rounded transition-colors ${
                isActive('/features')
                  ? 'text-primary bg-primary/10 border border-primary/30'
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              FEATURES
            </Link>
            <Link
              to="/assets"
              onClick={() => setShowMobileMenu(false)}
              className={`block font-mono text-sm px-3 py-2 rounded transition-colors ${
                isActive('/assets')
                  ? 'text-primary bg-primary/10 border border-primary/30'
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              ASSETS
            </Link>
            <Link
              to="/history"
              onClick={() => setShowMobileMenu(false)}
              className={`block font-mono text-sm px-3 py-2 rounded transition-colors ${
                isActive('/history')
                  ? 'text-primary bg-primary/10 border border-primary/30'
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              TX HISTORY
            </Link>
            {!ready ? (
              <div className="text-sm text-gray-500 px-3 py-2">Loading...</div>
            ) : !authenticated ? (
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  login();
                }}
                className="w-full text-left px-4 py-2 bg-primary text-background font-mono text-sm font-bold rounded hover:bg-primary/90 transition-colors"
              >
                LOGIN
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-400/10 rounded font-mono text-sm transition-colors"
              >
                LOGOUT
              </button>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

