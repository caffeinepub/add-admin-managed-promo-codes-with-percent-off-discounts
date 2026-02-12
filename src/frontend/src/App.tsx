import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useEnsureUserRole } from './hooks/useEnsureUserRole';
import { useProfileGate } from './hooks/useProfileGate';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
import PricesPage from './pages/PricesPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailsPage from './pages/admin/AdminOrderDetailsPage';
import LoginButton from './components/LoginButton';
import PrincipalIdFooterBlock from './components/PrincipalIdFooterBlock';
import { useCheckAdminAccess } from './hooks/useAdmin';
import { Menu, X, User } from 'lucide-react';
import { getAssetUrl, getDocumentUrl } from './utils/assetPaths';

type Route = 'home' | 'order' | 'prices' | 'order-confirmation' | 'my-orders' | 'profile' | 'admin' | 'admin-order-details';

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [orderId, setOrderId] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { isAdmin, isLoading: adminCheckLoading, isFetched: adminCheckFetched } = useCheckAdminAccess();
  const { mustSetupProfile, isCheckingProfile } = useProfileGate();
  const queryClient = useQueryClient();

  // Automatically ensure user role after authentication
  useEnsureUserRole();

  // Simple hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('/confirmation/')) {
        setCurrentRoute('order-confirmation');
        setOrderId(hash.split('/')[2] || '');
      } else if (hash.startsWith('/my-orders/')) {
        setCurrentRoute('my-orders');
        setOrderId(hash.split('/')[2] || '');
      } else if (hash === '/my-orders') {
        setCurrentRoute('my-orders');
        setOrderId('');
      } else if (hash === '/profile') {
        setCurrentRoute('profile');
      } else if (hash.startsWith('/admin/orders/')) {
        setCurrentRoute('admin-order-details');
        setOrderId(hash.split('/')[3] || '');
      } else if (hash === '/admin') {
        setCurrentRoute('admin');
      } else if (hash === '/order') {
        setCurrentRoute('order');
      } else if (hash === '/prices') {
        setCurrentRoute('prices');
      } else {
        setCurrentRoute('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Profile gate: redirect to profile if authenticated user has no profile
  useEffect(() => {
    if (!isCheckingProfile && mustSetupProfile) {
      // Only redirect if trying to access protected routes
      const protectedRoutes: Route[] = ['order', 'my-orders', 'admin', 'admin-order-details'];
      if (protectedRoutes.includes(currentRoute)) {
        window.location.hash = '/profile';
      }
    }
  }, [mustSetupProfile, isCheckingProfile, currentRoute]);

  const navigate = (path: string) => {
    window.location.hash = path;
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    queryClient.clear();
  };

  const isAuthenticated = !!identity;
  
  // Show admin link ONLY when:
  // 1. User is authenticated AND
  // 2. Admin check has completed (isFetched) AND
  // 3. User is confirmed admin
  // This prevents the flash for non-admin users
  const showAdminLink = isAuthenticated && adminCheckFetched && isAdmin;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 md:flex-initial">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0"
            >
              <img
                src={getAssetUrl('assets/generated/falcon-ids-logo-light.dim_512x512.png')}
                alt="Falcon IDs"
                className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 dark:hidden"
              />
              <img
                src={getAssetUrl('assets/generated/falcon-ids-logo-dark.dim_512x512.png')}
                alt="Falcon IDs"
                className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 hidden dark:block"
              />
              <span className="text-lg sm:text-xl font-bold tracking-tight truncate">Falcon IDs</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/order')}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Order
            </button>
            <button
              onClick={() => navigate('/prices')}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Prices
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate('/my-orders')}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  My Orders
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Profile
                </button>
              </>
            )}
            {showAdminLink && (
              <button
                onClick={() => navigate('/admin')}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Admin Panel
              </button>
            )}
            <LoginButton onLogout={handleLogout} />
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 touch-manipulation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background">
            <nav className="container py-4 flex flex-col gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-sm font-medium transition-colors hover:text-primary text-left py-2 touch-manipulation"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/order')}
                className="text-sm font-medium transition-colors hover:text-primary text-left py-2 touch-manipulation"
              >
                Order
              </button>
              <button
                onClick={() => navigate('/prices')}
                className="text-sm font-medium transition-colors hover:text-primary text-left py-2 touch-manipulation"
              >
                Prices
              </button>
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="text-sm font-medium transition-colors hover:text-primary text-left py-2 touch-manipulation"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-sm font-medium transition-colors hover:text-primary text-left py-2 touch-manipulation flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                </>
              )}
              {showAdminLink && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-sm font-medium transition-colors hover:text-primary text-left py-2 touch-manipulation bg-primary/10 px-3 rounded-md"
                >
                  Admin Panel
                </button>
              )}
              <div className="pt-2 border-t border-border/40">
                <LoginButton onLogout={handleLogout} />
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {currentRoute === 'home' && <HomePage />}
        {currentRoute === 'order' && <OrderPage onOrderSubmitted={(id) => navigate(`/confirmation/${id}`)} />}
        {currentRoute === 'prices' && <PricesPage />}
        {currentRoute === 'order-confirmation' && <OrderConfirmationPage orderId={orderId} />}
        {currentRoute === 'my-orders' && <MyOrdersPage />}
        {currentRoute === 'profile' && <ProfilePage />}
        {currentRoute === 'admin' && <AdminOrdersPage onOrderClick={(id) => navigate(`/admin/orders/${id}`)} />}
        {currentRoute === 'admin-order-details' && (
          <AdminOrderDetailsPage orderId={orderId} onBack={() => navigate('/admin')} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Falcon IDs. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2 text-center md:text-left flex-wrap justify-center">
              Built with <span className="text-red-500">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname || 'falcon-ids'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <a
              href={getDocumentUrl('DEPLOYMENT.md')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Deployment Guide
            </a>
          </div>
          
          {/* Principal ID Display - Only on Home route */}
          {currentRoute === 'home' && <PrincipalIdFooterBlock />}
        </div>
      </footer>
    </div>
  );
}

export default App;
