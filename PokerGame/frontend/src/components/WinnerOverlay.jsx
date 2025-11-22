import { motion } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

const WinnerOverlay = ({ winners, onClose }) => {
  if (!winners || winners.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-8 text-center shadow-2xl max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-900" />
        </motion.div>
        
        <h2 className="text-4xl font-bold text-yellow-900 mb-2">
          Winner{winners.length > 1 ? 's' : ''}!
        </h2>
        
        {winners.map((winner, index) => (
          <motion.div
            key={winner.seatNumber}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
            className="mb-4"
          >
            <div className="text-2xl font-bold text-white mb-1">{winner.name}</div>
            {winner.bestHand && (
              <div className="text-lg text-yellow-900 font-semibold">
                {winner.bestHand.description}
              </div>
            )}
          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="mt-6 px-6 py-3 bg-yellow-900 text-white rounded-lg font-bold hover:bg-yellow-800 transition-colors"
        >
          Continue
        </motion.button>

        {/* Confetti effect */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: '50%', 
              y: '50%', 
              opacity: 1,
              scale: 1
            }}
            animate={{
              x: `${50 + (Math.random() - 0.5) * 200}%`,
              y: `${50 + (Math.random() - 0.5) * 200}%`,
              opacity: 0,
              scale: 0,
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 0.5,
              ease: 'easeOut'
            }}
            className="absolute"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default WinnerOverlay;


