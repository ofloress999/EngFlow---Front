import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  FolderCheck,
  Archive,
  Users,
  Settings,
  HardHat,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  CircleUserRound,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("engflow-theme") === "dark");
  React.useEffect(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("engflow-theme", dark ? "dark" : "light"); }, [dark]);

  const signOut = async () => {
    try {
      setLeaving(true);
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLeaving(false);
      setSettingsOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Projetos", icon: Folder, path: "/projetos" },
    { label: "Encerrados", icon: FolderCheck, path: "/projetos/encerrados" },
    { label: "Arquivados", icon: Archive, path: "/projetos/arquivados" },
    { label: "Clientes", icon: Users, path: "/clientes" },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f9] font-sans text-slate-800 lg:flex">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-slate-950 p-1.5 text-white">
            <HardHat size={20} />
          </div>
          <span className="font-bold tracking-tight text-slate-950">
            EngFlow
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fechar menu"
          />
          <aside className="relative flex h-full w-72 flex-col justify-between bg-white p-5 shadow-2xl">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-slate-950 p-1.5 text-white">
                    <HardHat size={20} />
                  </div>
                  <span className="font-bold tracking-tight text-slate-950">
                    EngFlow
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="mt-7 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      <Icon size={19} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="space-y-1 border-t border-slate-100 pt-4">
              <Link to="/perfil" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"><CircleUserRound size={18} />Perfil</Link>
              <button type="button" onClick={() => setDark(value => !value)} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-100">{dark ? <Sun size={18} /> : <Moon size={18} />}{dark ? "Modo claro" : "Modo escuro"}</button>
            </div>
            <button
              type="button"
              disabled={leaving}
              onClick={() => void signOut()}
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <LogOut size={18} />
              {leaving ? "Saindo..." : "Sair da conta"}
            </button>
          </aside>
        </div>
      )}

      <aside className="hidden border-b border-slate-200 bg-white px-3 py-3 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:justify-between lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
        <div>
          <div className="flex items-center gap-3 px-2 py-1 lg:mb-8">
            <div className="rounded-xl border border-white bg-slate-950 p-2 text-white">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-950">
                EngFlow
              </h1>
              <p className="text-xs text-slate-400">Gestão de obras</p>
            </div>
          </div>

          <nav className="mt-3 flex gap-1 overflow-x-auto pb-1 lg:mt-0 lg:block lg:space-y-1 lg:pb-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative mt-3 border-t border-slate-100 px-2 pt-3 lg:mt-5 lg:pt-5">
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-lg py-2 text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            aria-expanded={settingsOpen}
          >
            <span>Configurações</span>
            <Settings className="w-4 h-4" />
          </button>
          {settingsOpen && (
            <div className="absolute bottom-14 left-4 right-4 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
              <Link to="/perfil" onClick={() => setSettingsOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-50"><CircleUserRound size={16} />Perfil</Link>
              <button type="button" onClick={() => setDark(value => !value)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-slate-50">{dark ? <Sun size={16} /> : <Moon size={16} />}{dark ? "Modo claro" : "Modo escuro"}</button>
              <button
                type="button"
                disabled={leaving}
                onClick={() => void signOut()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <LogOut size={16} />
                {leaving ? "Saindo..." : "Sair da conta"}
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 md:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};
