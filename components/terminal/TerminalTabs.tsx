'use client';

import React from 'react';
import { X, Plus } from 'lucide-react';

interface Tab {
  id: string;
  name: string;
  type: 'file' | 'terminal' | 'github';
  content?: string;
  path?: string;
}

interface TerminalTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

const TerminalTabs: React.FC<TerminalTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onTabClose,
  onNewTab
}) => {
  const getTabIcon = (type: string) => {
    switch (type) {
      case 'file':
        return '📄';
      case 'terminal':
        return '💻';
      case 'github':
        return '🐙';
      default:
        return '📄';
    }
  };

  return (
    <div className="terminal-tabs">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`terminal-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="mr-2">{getTabIcon(tab.type)}</span>
          <span>{tab.name}</span>
          <button
            className="ml-2 hover:bg-gray-600 rounded p-1"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      
      <button
        className="terminal-tab hover:bg-gray-600"
        onClick={onNewTab}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
};

export default TerminalTabs;
