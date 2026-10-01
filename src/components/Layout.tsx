import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Folder, FolderCheck, Archive, Users, Settings, HardHat } from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Projetos', icon: Folder, path: '/projetos' },
    { label: 'Encerrados', icon: FolderCheck, path: '/projetos/encerrados' },
    { label: 'Arquivados', icon: Archive, path: '/projetos/arquivados' },
    { label: 'Clientes', icon: Users, path: '/clientes' },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f9] font-sans text-slate-800 lg:flex">
      <aside className="flex border-b border-slate-200 bg-white px-4 py-3 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:flex-col lg:justify-between lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
        <div>
          <div className="flex items-center gap-3 px-2 py-1 lg:mb-8">
            <div className="rounded-xl bg-slate-950 p-2 text-white shadow-lg shadow-slate-300">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-950">EngFlow</h1>
              <p className="text-xs text-slate-400">Gestão de obras</p>
            </div>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-0 lg:block lg:space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-slate-950 text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-5 hidden items-center justify-between border-t border-slate-100 px-2 pt-5 text-xs text-slate-400 lg:flex">
          <span>Área do Engenheiro</span>
          <Settings className="w-4 h-4 cursor-pointer hover:text-slate-900" />
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};
