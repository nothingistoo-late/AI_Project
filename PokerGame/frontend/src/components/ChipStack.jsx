import { motion } from 'framer-motion';

const ChipStack = ({ amount, isAnimating = false, position = 'center' }) => {
  const chipCount = Math.min(Math.ceil(amount / 10), 10); // Max 10 chips visible

  return (
    <div className={`relative flex items-center justify-${position}`}>
      {Array.from({ length: chipCount }).map((_, index) => (
        <motion.div
          key={index}
          initial={isAnimating ? { y: -50, opacity: 0 } : {}}
          animate={isAnimating ? { y: 0, opacity: 1 } : {}}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            type: 'spring',
            stiffness: 200
          }}
          className="w-8 h-8 rounded-full border-2 border-yellow-600 shadow-lg"
          style={{
            background: index % 3 === 0 
              ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
              : index % 3 === 1
              ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
              : 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            marginLeft: index > 0 ? '-12px' : '0',
            zIndex: chipCount - index,
            transform: `rotate(${index * 5}deg)`
          }}
        />
      ))}
      {amount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black bg-opacity-50 px-1 rounded"
        >
          ${amount}
        </motion.div>
      )}
    </div>
  );
};

export default ChipStack;


