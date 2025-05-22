
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/AuthForm";
import LoadingDisplay from "@/components/grid/LoadingDisplay";

interface AuthRequiredProps {
  children: React.ReactNode;
}

const AuthRequired = ({ children }: AuthRequiredProps) => {
  const { user, loading: authLoading } = useAuth();
  
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-cream flex flex-col items-center justify-center px-4 py-8">
        <LoadingDisplay />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-cream flex flex-col items-center justify-center px-4 py-8">
        <h1 className="font-heading text-4xl md:text-5xl text-navy mb-8">Double-Play Grid</h1>
        <div className="w-full max-w-md border-2 border-navy shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-cream rounded-2xl p-6">
          <AuthForm />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthRequired;
