import React from 'react';
import { ExternalLink, Cloud, Clock, Database, AlertCircle, ArrowRight } from 'lucide-react';

interface UploadViewProps {
  isSignedIn: boolean;
  onSwitchToChat: () => void;
}

const DRIVE_FOLDER_ID = "1pDHcsAyUSr2D-WRGJvnoE-2sOPaCk3Zz";
const DRIVE_LINK = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;

export const UploadView: React.FC<UploadViewProps> = ({ isSignedIn, onSwitchToChat }) => {
  
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Warning Banner */}
      {!isSignedIn && (
        <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-center gap-2 text-yellow-700 text-sm">
          <AlertCircle size={16} />
          <span>Please sign in with Google (top right) to upload documents.</span>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-blue-50/50 p-10 flex flex-col items-center text-center border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Upload to Knowledge Base
          </h2>
          <p className="text-slate-600 max-w-lg mb-8 leading-relaxed">
            This application syncs with a specific Google Drive folder. 
            Upload your documents directly to the folder, and our AI scheduler 
            will automatically index them for the chat.
          </p>

          <a
            href={DRIVE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-md transition-all hover:-translate-y-0.5
              ${!isSignedIn ? 'opacity-50 pointer-events-none bg-slate-400' : 'hover:bg-blue-700 hover:shadow-lg'}
            `}
          >
            <span>Open Google Drive Folder</span>
            <ExternalLink size={18} />
          </a>
          
          <div className="mt-4 text-xs font-mono text-slate-400 uppercase tracking-wide">
            Folder: rag_demo_data
          </div>
        </div>

        {/* Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
          
          {/* Step 1 */}
          <div className="p-8 flex flex-col items-center text-center hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Cloud size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">1. Upload</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Add PDF, DOCX, or TXT files to the Drive folder.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 flex flex-col items-center text-center hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <Clock size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">2. Sync</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              The n8n scheduler picks up new files every 10 mins.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 flex flex-col items-center text-center hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Database size={24} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">3. Chat</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Files are indexed into Gemini File Search.
            </p>
          </div>

        </div>
      </div>

      {/* Footer Action */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-slate-400">Already uploaded your files?</p>
        <button
          onClick={onSwitchToChat}
          className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
        >
          <span>Go to Chat with Documents</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
};