'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Github,
  Send,
  Plus,
  X,
  File,
  Folder,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import CursorInterface from '@/components/cursor/CursorInterface';

export default function Home() {
  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <h1 className="text-lg font-semibold text-white">Glacier</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
              <Github className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Interface */}
      <div className="flex-1 flex">
        <CursorInterface />
      </div>
    </div>
  );
}
