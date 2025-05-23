
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";

const LandingPage = () => {
  const { user, loading } = useAuth();

  // Redirect to dashboard if authenticated
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1d3557] mb-4">
            Welcome to Grandstand Games
          </h1>
          <p className="text-lg text-[#1d3557]/80 mb-2">
            Your all‑star arcade of bite‑size baseball challenges.
          </p>
          <p className="text-base text-[#1d3557]/70">
            Sign in with your email to unlock our growing lineup—Step up to the plate and play!
          </p>
        </div>
        
        <AuthForm />
      </div>
      
      <div className="mt-8 text-center text-[#1d3557]/60 hidden">
        <p className="text-sm">
          Our game portal features exciting games for all players.
          <br />
          Sign in to start playing!
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
