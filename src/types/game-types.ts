
export type GamePhase = 
  | 'loadingFirstPlayer' 
  | 'showingCurrentPlayer' 
  | 'waitingForGuess' 
  | 'showingResult' 
  | 'gameOver';

export type CountdownType = 'next' | 'reset';
