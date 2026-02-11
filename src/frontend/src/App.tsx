import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
import PricesPage from './pages/PricesPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailsPage from './pages/admin/AdminOrderDetailsPage';
import LoginButton from './components/LoginButton';
import { useCheckAdminAccess } from './hooks/useAdmin';
import { Menu, X } from 'lucide-react';
import { getAssetUrl, getDocumentUrl } from './utils/assetPaths';

type Route = 'home' | 'order' | 'prices' | 'order-confirmation' | 'my-orders' | 'admin' | 'admin-order-details';

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [orderId, setOrderId] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { isAdmin, isLoading: adminCheckLoading } = useCheckAdminAccess();
  const queryClient = useQueryClient();

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

  const navigate = (path: string) => {
    window.location.hash = path;
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    queryClient.clear();
  };

  const isAuthenticated = !!identity;
  const showAdminPanel = isAuthenticated && isAdmin && !adminCheckLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src={getAssetUrl('assets/generated/falcon-ids-logo-light.dim_512x512.png')}
                alt="Falcon IDs"
                className="h-10 w-10 dark:hidden"
              />
              <img
                src={getAssetUrl('assets/generated/falcon-ids-logo-dark.dim_512x512.png')}
                alt="Falcon IDs"
                className="h-10 w-10 hidden dark:block"
              />
              <span className="text-xl font-bold tracking-tight">Falcon IDs</span>
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
              <button
                onClick={() => navigate('/my-orders')}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                My Orders
              </button>
            )}
            {showAdminPanel && (
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
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                className="text-sm font-medium transition-colors hover:text-primary text-left"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/order')}
                className="text-sm font-medium transition-colors hover:text-primary text-left"
              >
                Order
              </button>
              <button
                onClick={() => navigate('/prices')}
                className="text-sm font-medium transition-colors hover:text-primary text-left"
              >
                Prices
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => navigate('/my-orders')}
                  className="text-sm font-medium transition-colors hover:text-primary text-left"
                >
                  My Orders
                </button>
              )}
              {showAdminPanel && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-sm font-medium transition-colors hover:text-primary text-left"
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
        {currentRoute === 'admin' && <AdminOrdersPage onOrderClick={(id) => navigate(`/admin/orders/${id}`)} />}
        {currentRoute === 'admin-order-details' && (
          <AdminOrderDetailsPage orderId={orderId} onBack={() => navigate('/admin')} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Falcon IDs. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
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
        </div>
      </footer>
    </div>
  );
}

export default App;
