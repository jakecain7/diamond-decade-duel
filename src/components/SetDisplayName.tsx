
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SetDisplayName = () => {
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError("Display name cannot be empty");
      return;
    }

    if (displayName.length < 3) {
      setError("Display name must be at least 3 characters");
      return;
    }

    if (displayName.length > 20) {
      setError("Display name must be less than 20 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      // Update the profile with the display name
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', supabase.auth.getUser().then(response => response.data.user?.id));

      if (error) {
        if (error.code === '23505') {
          // Unique violation
          setError("This display name is already taken. Please choose another.");
          setIsSubmitting(false);
          return;
        }
        throw error;
      }

      // Refresh the user's profile to get the updated display name
      await refreshProfile();

      toast({
        title: "Display name set!",
        description: `Welcome to the game, ${displayName}!`,
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Error setting display name:", err);
      setError(err.message || "An error occurred while setting your display name.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#1d3557]">Welcome!</CardTitle>
          <CardDescription className="text-center text-[#1d3557]/70">
            Please set your display name to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Choose your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#e76f51] hover:bg-[#e76f51]/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SetDisplayName;
