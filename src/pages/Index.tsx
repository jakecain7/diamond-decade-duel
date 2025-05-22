
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import GridPage from "./GridPage";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after auth is done loading and user is authenticated
    if (!loading && user) {
      navigate("/grid/today");
    }
  }, [user, navigate, loading]);

  // Just render the GridPage component directly, which will handle
  // showing either the auth form or grid based on authentication status
  return <GridPage />;
};

export default Index;
