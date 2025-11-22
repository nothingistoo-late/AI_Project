import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gameApi = {
  getState: () => api.get('/game/state'),
  startGame: (smallBlind = 10, bigBlind = 20) => 
    api.post(`/game/start?smallBlind=${smallBlind}&bigBlind=${bigBlind}`),
  addPlayer: (name, seatNumber) => 
    api.post('/game/player', { name, seatNumber }),
  addBot: (botLevel, seatNumber) => 
    api.post('/game/add-bot', { botLevel, seatNumber }),
  removePlayer: (seatNumber) => 
    api.delete(`/game/player/${seatNumber}`),
  startNewHand: () => api.post('/game/hand/start'),
  playerAction: (seatNumber, action, raiseAmount = null) => 
    api.post('/game/action', { seatNumber, action, raiseAmount }),
  processBotTurns: () => api.post('/game/bots/process'),
  evaluateWinners: () => api.post('/game/evaluate'),
  resetGame: () => api.post('/game/reset'),
  nextStage: () => api.post('/game/next-stage'),
  toggleBotCards: () => api.get('/game/toggle-bot-cards'),
};

export default api;

