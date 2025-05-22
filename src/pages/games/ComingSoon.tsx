
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ComingSoon: React.FC = () => {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  
  const { data: game, isLoading } = useQuery({
    queryKey: ["game", gameSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("slug", gameSlug)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return { name: "Unknown Game", description: "This game is coming soon!" };
        }
        throw error;
      }
      return data;
    }
  });
  
  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f5f0e1] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8 text-center">
        <div className="mb-6">
          <Clock className="h-16 w-16 mx-auto text-[#e76f51]/60" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#1d3557] mb-4">
          {isLoading ? "Loading..." : game?.name}
        </h1>
        
        <div className="inline-block px-3 py-1 bg-[#e9c46a]/20 text-[#e76f51] rounded-full text-sm font-medium mb-6">
          Coming Soon
        </div>
        
        <p className="text-[#1d3557]/80 mb-8">
          {isLoading ? "Loading game details..." : game?.description || "We're working hard to bring this exciting game to you. Check back soon!"}
        </p>
        
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="border-[#1d3557]/30 text-[#1d3557] hover:bg-[#1d3557]/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ComingSoon;
