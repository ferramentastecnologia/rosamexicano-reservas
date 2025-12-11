import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  List,
  BarChart3,
  QrCode,
  Users,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  currentPage: 'dashboard' | 'reservations' | 'voucher' | 'reports' | 'usuarios' | 'tables' | 'create-reservation';
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: 'primary' | 'secondary';
  }>;
}

export default function AdminLayout({
  children,
  title,
  subtitle,
  currentPage,
  actions,
}: AdminLayoutProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'reservations', label: 'Reservas', icon: List, href: '/admin/reservations' },
    { id: 'voucher', label: 'Voucher', icon: QrCode, href: '/admin/validar-voucher' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, href: '/admin/reports' },
    { id: 'usuarios', label: 'Usuários', icon: Users, href: '/admin/usuarios' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0f0f0f] to-black text-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/images/logo-rosa-mexicano.png"
                alt="Rosa Mexicano"
                className="h-12 w-auto drop-shadow-lg"
              />
              <div className="border-l border-white/20 pl-4">
                <h1 className="text-lg font-bold text-white">Rosa Mexicano</h1>
                <span className="text-xs text-[#FFD700]">Painel Administrativo</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C2185B] to-[#E53935] text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-[#C2185B]/50 transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Navigation */}
      <nav className="fixed top-20 left-0 right-0 z-30 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition ${
                    isActive
                      ? 'border-[#FFD700] text-white font-medium'
                      : 'border-transparent text-white/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-40 pb-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">{title}</h1>
              {subtitle && <p className="text-white/60">{subtitle}</p>}
            </div>
            {actions && actions.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.onClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                      action.variant === 'secondary'
                        ? 'bg-white/10 border border-white/20 text-white hover:border-white/40'
                        : 'bg-gradient-to-r from-[#C2185B] to-[#E53935] text-white hover:shadow-lg hover:shadow-[#C2185B]/50'
                    }`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
