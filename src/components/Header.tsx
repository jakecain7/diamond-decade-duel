
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Header = () => {
  const { user, signOut, loading } = useAuth();
  
  return (
    <header className="bg-[#f5f0e1] border-b border-[#1d3557]/10 py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1d3557] font-serif italic">
          Double-Play Grid
        </h1>
        
        {loading ? (
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#1d3557]" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#1d3557]/70 hidden sm:inline-block">
              {user.email}
            </span>
            <Button 
              variant="outline"
              onClick={signOut}
              className="text-[#1d3557] border-[#1d3557]/30 hover:bg-[#1d3557]/5"
            >
              Sign Out
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
