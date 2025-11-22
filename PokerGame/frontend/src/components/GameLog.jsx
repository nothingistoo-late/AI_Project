import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const GameLog = ({ actionHistory }) => {
  if (!actionHistory || actionHistory.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Game Log
        </h3>
        <div className="text-gray-500 text-sm">No actions yet</div>
      </div>
    );
  }

  const recentActions = actionHistory.slice(-5).reverse();

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-white font-bold mb-2 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Game Log (Last 5)
      </h3>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {recentActions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-gray-300 flex items-center justify-between"
          >
            <span>
              <span className="font-semibold text-blue-400">{action.playerName}</span>
              {' '}
              <span className="text-yellow-400">{action.action}</span>
              {action.amount && (
                <span className="text-green-400"> ${action.amount}</span>
              )}
            </span>
            <span className="text-gray-500 text-xs">{action.phase}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GameLog;


