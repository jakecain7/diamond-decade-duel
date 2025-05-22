
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signInWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await signInWithEmail(email);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#1d3557]">
          Welcome to Double-Play Grid!
        </h2>
        <p className="mt-2 text-[#1d3557]/80">
          Please sign in with your email to play.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
            disabled={isSubmitting}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#e76f51] hover:bg-[#e76f51]/90 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending magic link...
            </>
          ) : (
            "Sign in with Email"
          )}
        </Button>
      </form>
    </div>
  );
};

export default AuthForm;
