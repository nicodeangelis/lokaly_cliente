import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'loyalty' | 'restaurant';
  className?: string;
}

export const AnimatedBackground = ({ variant = 'default', className = "" }: AnimatedBackgroundProps) => {
  const getGradient = () => {
    switch (variant) {
      case 'loyalty':
        return 'linear-gradient(135deg, hsl(142 71% 45% / 0.1), hsl(25 95% 53% / 0.1))';
      case 'restaurant':
        return 'linear-gradient(135deg, hsl(0 72% 51% / 0.1), hsl(25 95% 53% / 0.1))';
      default:
        return 'linear-gradient(135deg, hsl(25 95% 97%), hsl(20 14.3% 99%))';
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{ background: getGradient() }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Floating shapes */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-primary/5 rounded-full"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/3 right-20 w-16 h-16 bg-secondary/5 rounded-lg"
        animate={{
          y: [0, 25, 0],
          x: [0, -15, 0],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />
      
      <motion.div
        className="absolute bottom-20 left-1/4 w-12 h-12 bg-success/5 rounded-full"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6
        }}
      />
    </div>
  );
};