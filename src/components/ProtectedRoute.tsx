import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "./AuthPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-slate-600">Carregando a PerformAI...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;
  return <>{children}</>;
};
