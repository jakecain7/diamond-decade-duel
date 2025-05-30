
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const { user, loading } = useAuth();

  // Redirect to dashboard if authenticated
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-b from-[#1d3557] to-[#1d3557]/90">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-heading">
            Welcome to Bleacher Arcade
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Your all‑star arcade of bite‑size baseball challenges
          </p>
          <p className="text-lg text-white/80 mb-10 max-w-3xl mx-auto">
            Step up to the plate with our growing lineup of quick-hit, nostalgia-driven daily baseball puzzles. 
            From grid challenges to trivia duels, every game is designed to test your baseball knowledge in under 5 minutes.
          </p>
          <div className="max-w-md mx-auto">
            <AuthForm />
          </div>
        </div>
      </section>

      {/* Why Play Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d3557] text-center mb-12">
            Why Play Bleacher Arcade?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#e76f51]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚾</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1d3557] mb-3">Quick & Addictive</h3>
              <p className="text-[#1d3557]/70">
                Each game takes under 5 minutes. Perfect for your coffee break, commute, or whenever you need a baseball fix.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#e76f51]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1d3557] mb-3">Test Your Knowledge</h3>
              <p className="text-[#1d3557]/70">
                From obscure stats to legendary moments, challenge yourself with trivia that spans baseball history.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#e76f51]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-[#1d3557] mb-3">Compete & Share</h3>
              <p className="text-[#1d3557]/70">
                Track your streaks, climb leaderboards, and share your results with fellow baseball enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-16 px-4 bg-[#f5f0e1]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d3557] text-center mb-12">
            Our Baseball Games
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dinger Duel */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src="/lovable-uploads/0db4250d-fe29-4220-adf2-6f7a9f5f0044.png" 
                alt="Dinger Duel" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#1d3557] mb-2">Dinger Duel</h3>
                <p className="text-[#1d3557]/70 mb-4">
                  Compare home run totals in this higher-or-lower game. Guess whether the next player hit more or fewer dingers.
                </p>
              </div>
            </div>

            {/* Midsummer Duel */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src="/lovable-uploads/ec3533b3-68ac-46fc-9168-ed0611c2c7b2.png" 
                alt="Midsummer Duel" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#1d3557] mb-2">Midsummer Duel</h3>
                <p className="text-[#1d3557]/70 mb-4">
                  Test your All-Star Game knowledge by guessing which player had more All-Star selections throughout their career.
                </p>
              </div>
            </div>

            {/* Bag 'n Bomb Battle */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src="/lovable-uploads/09c7beef-a317-4eb1-91cd-e4ac0b3a5cc7.png" 
                alt="Bag 'n Bomb Battle" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#1d3557] mb-2">Bag 'n Bomb Battle</h3>
                <p className="text-[#1d3557]/70 mb-4">
                  Match players who excelled in both stolen bases and home runs. Find the perfect combination of speed and power.
                </p>
              </div>
            </div>

            {/* Forgotten Uniforms */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src="/lovable-uploads/86e98811-ab4e-497b-a60d-6ce33650ff91.png" 
                alt="Forgotten Uniforms" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#1d3557] mb-2">Forgotten Uniforms</h3>
                <p className="text-[#1d3557]/70 mb-4">
                  Identify players based on their lesser-known team affiliations. Test your knowledge of baseball's journeymen.
                </p>
              </div>
            </div>

            {/* More Games Coming */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-br from-[#1d3557]/20 to-[#e76f51]/20 flex items-center justify-center">
                <span className="text-4xl">🚧</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#1d3557] mb-2">More Games Coming</h3>
                <p className="text-[#1d3557]/70 mb-4">
                  We're constantly adding new games and challenges. Sign up to be the first to play our latest creations.
                </p>
                <Button className="w-full bg-[#1d3557] hover:bg-[#1d3557]/90 text-white" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-[#1d3557] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Test Your Baseball Knowledge?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of baseball fans who start their day with Bleacher Arcade.
          </p>
          <div className="max-w-md mx-auto">
            <AuthForm />
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-4 bg-[#1d3557]/95 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/70 text-sm">
            © 2025 Bleacher Arcade. All rights reserved. | 
            <span className="ml-2">Made for baseball fans, by baseball fans.</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
