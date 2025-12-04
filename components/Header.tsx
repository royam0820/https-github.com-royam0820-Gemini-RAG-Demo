import React from 'react';
import { Bot, LogIn, LogOut } from 'lucide-react';

interface HeaderProps {
  isSignedIn: boolean;
  onToggleAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSignedIn, onToggleAuth }) => {
  return (
    <div className="bg-slate-50 pt-8 pb-6 px-6 flex flex-col items-center justify-center relative border-b border-slate-200 shadow-sm z-10">
      
      {/* Auth Button positioned absolute top-right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onToggleAuth}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          {isSignedIn ? (
            <>
              <LogOut size={16} />
              <span>Sign out</span>
            </>
          ) : (
            <>
              <LogIn size={16} />
              <span>Sign in with Google</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <Bot size={40} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Gemini RAG Demo</h1>
        </div>
        <p className="text-slate-600 text-center max-w-lg">
          Upload documents and chat with your AI-powered knowledge base
        </p>
        <p className="text-xs text-slate-400">
          Powered by Gemini File Search API + n8n
        </p>
      </div>
    </div>
  );
};