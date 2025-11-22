import { motion } from 'framer-motion';

const DealerButton = ({ dealerPosition, seats }) => {
  const dealerSeat = seats.find(s => s.number === dealerPosition);
  if (!dealerSeat) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1, rotate: [0, 360] }}
      transition={{ duration: 0.5, rotate: { repeat: Infinity, duration: 2 } }}
      className={`absolute ${dealerSeat.position} transform -translate-x-1/2 -translate-y-1/2 
        bg-yellow-500 text-black rounded-full w-10 h-10 flex items-center justify-center
        font-bold text-sm shadow-lg z-20`}
    >
      D
    </motion.div>
  );
};

export default DealerButton;


