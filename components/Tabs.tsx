import React from 'react';
import { Upload, MessageSquare, Library } from 'lucide-react';
import { Tab } from '../types';

interface TabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Upload Documents', icon: <Upload size={18} /> },
    { id: 'chat', label: 'Chat with Documents', icon: <MessageSquare size={18} /> },
    { id: 'library', label: 'Document Library', icon: <Library size={18} /> },
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
      <div className="max-w-5xl mx-auto flex">
        {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
                <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                    flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all relative
                    ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                `}
                >
                {tab.icon}
                <span>{tab.label}</span>
                
                {/* Active Indicator Bar */}
                {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t-full" />
                )}
                </button>
            );
        })}
      </div>
    </div>
  );
};