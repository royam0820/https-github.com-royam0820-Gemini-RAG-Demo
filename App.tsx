import React, { useState } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { UploadView } from './components/UploadView';
import { ChatView } from './components/ChatView';
import { LibraryView } from './components/LibraryView';
import { Tab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Simple Mock Authentication Toggle
  const handleToggleAuth = () => {
    setIsSignedIn(prev => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header 
        isSignedIn={isSignedIn} 
        onToggleAuth={handleToggleAuth} 
      />
      
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {activeTab === 'upload' && (
          <UploadView 
            isSignedIn={isSignedIn} 
            onSwitchToChat={() => setActiveTab('chat')} 
          />
        )}
        
        {activeTab === 'chat' && (
          <ChatView isSignedIn={isSignedIn} />
        )}
        
        {activeTab === 'library' && (
          <LibraryView isSignedIn={isSignedIn} />
        )}
      </main>

      {/* Footer / Copyright */}
      {activeTab !== 'chat' && (
         <div className="py-6 text-center text-xs text-slate-400">
           &copy; 2024 Gemini RAG Demo. Built with React + Tailwind.
         </div>
      )}
    </div>
  );
}