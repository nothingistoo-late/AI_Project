import { motion } from 'framer-motion';

const Card = ({ card, isFaceUp = true, isDealing = false, delay = 0 }) => {
  if (!card) {
    return (
      <div className="w-16 h-24 bg-gray-800 rounded-lg border-2 border-gray-700 flex items-center justify-center">
        <div className="text-gray-600 text-xs">?</div>
      </div>
    );
  }

  const getCardColor = (suit) => {
    // Handle both string and number enum values
    const suitValue = typeof suit === 'number' ? suit : suit;
    const isRed = suitValue === 1 || suitValue === 2 || suitValue === 'Diamonds' || suitValue === 'Hearts' || suitValue === '1' || suitValue === '2';
    return isRed ? 'text-red-600' : 'text-black';
  };

  const getSuitSymbol = (suit) => {
    // Handle both string and number enum values
    const suitValue = typeof suit === 'number' ? suit : suit;
    const suitMap = {
      0: '♣', 'Clubs': '♣', '0': '♣',
      1: '♦', 'Diamonds': '♦', '1': '♦',
      2: '♥', 'Hearts': '♥', '2': '♥',
      3: '♠', 'Spades': '♠', '3': '♠',
    };
    return suitMap[suitValue] || '?';
  };

  const getRankDisplay = (rank) => {
    // Handle both string and number enum values
    const rankValue = typeof rank === 'number' ? rank : rank;
    const rankMap = {
      0: '2', 'Two': '2', '0': '2',
      1: '3', 'Three': '3', '1': '3',
      2: '4', 'Four': '4', '2': '4',
      3: '5', 'Five': '5', '3': '5',
      4: '6', 'Six': '6', '4': '6',
      5: '7', 'Seven': '7', '5': '7',
      6: '8', 'Eight': '8', '6': '8',
      7: '9', 'Nine': '9', '7': '9',
      8: '10', 'Ten': '10', '8': '10',
      9: 'J', 'Jack': 'J', '9': 'J',
      10: 'Q', 'Queen': 'Q', '10': 'Q',
      11: 'K', 'King': 'K', '11': 'K',
      12: 'A', 'Ace': 'A', '12': 'A',
    };
    return rankMap[rankValue] || rank;
  };

  if (!isFaceUp) {
    return (
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isDealing ? 180 : 0 }}
        transition={{ duration: 0.5, delay }}
        className="w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 shadow-lg"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl font-bold">♠</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay, type: 'spring' }}
      className={`w-16 h-24 bg-white rounded-lg border-2 border-gray-300 shadow-lg flex flex-col p-1 ${getCardColor(card.suit)}`}
    >
      <div className="flex flex-col items-start">
        <div className="text-lg font-bold">{getRankDisplay(card.rank)}</div>
        <div className="text-xl">{getSuitSymbol(card.suit)}</div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-4xl">{getSuitSymbol(card.suit)}</div>
      </div>
      <div className="flex flex-col items-end rotate-180">
        <div className="text-lg font-bold">{getRankDisplay(card.rank)}</div>
        <div className="text-xl">{getSuitSymbol(card.suit)}</div>
      </div>
    </motion.div>
  );
};

export default Card;

