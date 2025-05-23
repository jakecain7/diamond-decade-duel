
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface GameOverActionsProps {
  score: number;
  isPersonalBest: boolean;
  onRestart: () => void;
}

const GameOverActions: React.FC<GameOverActionsProps> = ({ 
  score, 
  isPersonalBest, 
  onRestart 
}) => {
  const handleFacebookShare = () => {
    const shareUrl = "https://diamond-decade-duel.lovable.app/";
    const shareMessage = `Just got a score of ${score} on Dinger Duel! Think you can beat me? Play here: ${shareUrl}`;
    
    // Create the Facebook share URL with encoded parameters using the correct sharer URL
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedQuote = encodeURIComponent(shareMessage);
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`;
    
    // Open Facebook share dialog in a popup window with specific dimensions
    window.open(
      facebookShareUrl, 
      'facebook-share', 
      'width=626,height=436,location=no,toolbar=no,status=no'
    );
    toast.success("Opening Facebook share dialog...");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isPersonalBest && (
        <div className="text-amber-500 font-bold flex items-center gap-2 mb-2">
          <Trophy size={24} />
          <span>New Personal Best!</span>
        </div>
      )}
      <Button
        onClick={onRestart}
        className="bg-navy hover:bg-navy/90 text-cream border-2 border-navy/20 font-bold text-lg uppercase h-14 w-full rounded-xl shadow-inner"
      >
        Play Again
      </Button>
      {score > 0 && (
        <Button
          onClick={handleFacebookShare}
          variant="outline"
          className="text-navy border-navy/40 hover:bg-navy/5 font-bold text-lg uppercase h-14 w-full rounded-xl"
        >
          <Share2 className="mr-2" size={18} /> Challenge Friends on Facebook
        </Button>
      )}
    </div>
  );
};

export default GameOverActions;
