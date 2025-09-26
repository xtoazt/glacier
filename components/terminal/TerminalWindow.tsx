'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Minimize2, Square } from 'lucide-react';

interface TerminalWindowProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({
  children,
  title = 'glacier',
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`terminal-window ${className}`}
    >
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="flex items-center gap-2">
          <div className="terminal-dot red"></div>
          <div className="terminal-dot yellow"></div>
          <div className="terminal-dot green"></div>
        </div>
        <div className="terminal-title">{title}</div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-700 rounded">
            <Minimize2 className="w-3 h-3 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded">
            <Square className="w-3 h-3 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded">
            <X className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Terminal Content */}
      <div className="terminal-content">
        {children}
      </div>
    </motion.div>
  );
};

export default TerminalWindow;
