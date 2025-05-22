
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import GridPage from "./GridPage";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, redirect to the grid page
    if (user) {
      navigate("/grid/today");
    }
  }, [user, navigate]);

  // Just render the GridPage component directly, which will handle
  // showing either the auth form or grid based on authentication status
  return <GridPage />;
};

export default Index;
