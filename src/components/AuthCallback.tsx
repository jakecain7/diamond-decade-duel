
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // This ensures we process the auth redirect and establish the session
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error processing auth redirect:", error);
          setError(error.message);
        }
      } catch (err: any) {
        console.error("Unexpected error in auth callback:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Process the authentication redirect
    handleAuthRedirect();
  }, []);
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex flex-col items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#1d3557]" />
          <p className="text-xl text-[#1d3557]">Completing authentication...</p>
        </div>
      </div>
    );
  }
  
  // Show error if something went wrong
  if (error) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex flex-col items-center justify-center px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Authentication Error</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }
  
  // Redirect to the grid page when authentication is complete
  return <Navigate to="/grid/today" replace />;
};

export default AuthCallback;
