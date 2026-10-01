import { Navigate, Outlet } from 'react-router-dom'; import { useAuth } from '../contexts/AuthContext';
export function ProtectedRoute() { const { user, loading } = useAuth(); if (loading) return <div className="min-h-screen grid place-items-center text-slate-500">Verificando sessão...</div>; return user ? <Outlet /> : <Navigate to="/login" replace />; }
