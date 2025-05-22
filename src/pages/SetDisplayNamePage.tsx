
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SetDisplayName from "@/components/SetDisplayName";

const SetDisplayNamePage = () => {
  const { user, loading, hasDisplayName } = useAuth();
  
  // If user is not logged in, redirect to landing page
  if (!loading && !user) {
    return <Navigate to="/" replace />;
  }
  
  // If user has a display name already, redirect to dashboard
  if (!loading && user && hasDisplayName) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <SetDisplayName />;
};

export default SetDisplayNamePage;
