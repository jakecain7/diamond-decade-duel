
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mail, check-circle } from "lucide-react";

const CheckEmailPage = () => {
  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <Card className="bg-white shadow-lg border border-[#1d3557]/10">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-[#e76f51]/10 rounded-full flex items-center justify-center mb-4">
                <mail className="h-8 w-8 text-[#e76f51]" />
              </div>
              <h1 className="text-2xl font-bold text-[#1d3557] mb-2">
                Check Your Email
              </h1>
              <p className="text-[#1d3557]/70 text-base leading-relaxed">
                We've sent you a magic link to sign in. Click the link in your email to complete the sign-in process.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-[#1d3557]/60">
                <check-circle className="h-4 w-4" />
                <span>Check your spam folder if you don't see it</span>
              </div>
              
              <div className="pt-4 border-t border-[#1d3557]/10">
                <Link to="/">
                  <Button 
                    variant="outline" 
                    className="w-full text-[#1d3557] border-[#1d3557]/30 hover:bg-[#1d3557]/5"
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckEmailPage;
