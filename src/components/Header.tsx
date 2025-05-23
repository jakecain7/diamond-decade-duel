
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const {
    user,
    profile,
    signOut,
    loading
  } = useAuth();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Close sheet when navigation item is clicked
  const handleNavItemClick = () => {
    setSheetOpen(false);
  };

  // Render mobile navigation menu
  const renderMobileNav = () => {
    if (!user) return null;
    return <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 text-[#1d3557] border-[#1d3557]/30 hover:bg-[#1d3557]/5" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[240px] bg-[#f5f0e1] border-l border-[#1d3557]/20">
          <nav className="flex flex-col gap-2 mt-8">
            <Link to="/dashboard" onClick={handleNavItemClick}>
              <Button variant="outline" className="w-full justify-start text-[#1d3557] border-[#1d3557]/30 hover:bg-[#1d3557]/5">
                Dashboard
              </Button>
            </Link>
            <Link to="/leaderboard" onClick={handleNavItemClick}>
              <Button variant="outline" className="w-full justify-start text-[#1d3557] border-[#1d3557]/30 hover:bg-[#1d3557]/5">
                Leaderboard
              </Button>
            </Link>
            {profile?.display_name && <div className="px-4 py-2 text-sm text-[#1d3557]">
                Signed in as: <br />
                <span className="font-medium">{profile.display_name || user.email}</span>
              </div>}
            <Button variant="outline" onClick={() => {
            handleNavItemClick();
            signOut();
          }} className="w-full justify-start text-[#1d3557] border-[#1d3557]/30 hover:bg-[#1d3557]/5">
              Sign Out
            </Button>
          </nav>
        </SheetContent>
      </Sheet>;
  };

  // Render desktop navigation
  const renderDesktopNav = () => {
    if (!user) return null;
    return <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/dashboard">
          <Button variant="outline" className="text-sm sm:text-base text-[#1d3557] border-[#1d3557]/30 hover:bg-[#1d3557]/5">
            Dashboard
          </Button>
        </Link>
        <Link to="/leaderboard">
          <Button variant="outline" className="text-sm sm:text-base text-[#1d3557] border-[#1d3557]/30 hover:bg-[#1d3557]/5">
            Leaderboard
          </Button>
        </Link>
        <span className="text-sm text-[#1d3557]/70 hidden sm:inline-block">
          {profile?.display_name || user.email}
        </span>
        <Button variant="outline" onClick={signOut} className="text-sm sm:text-base text-[#1d3557] border-[#1d3557]/30 hover:bg-[#1d3557]/5">
          Sign Out
        </Button>
      </div>;
  };

  return <header className="bg-[#f5f0e1] border-b border-[#1d3557]/10 py-1">
      <div className="container mx-auto flex justify-between items-center px-4 py-1">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center">
          <img 
            src="/lovable-uploads/ef092560-f20b-49f7-8e3e-09d6ae434ba1.png" 
            alt="Grandstand Games" 
            className="h-10 object-contain" 
          />
        </Link>
        
        {loading ? <div className="flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#1d3557]" />
          </div> : user ? isMobile ? renderMobileNav() : renderDesktopNav() : null}
      </div>
    </header>;
};

export default Header;
