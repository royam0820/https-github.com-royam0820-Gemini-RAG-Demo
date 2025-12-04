import React, { useState } from 'react';
import { FileText, MoreVertical, HardDrive, ExternalLink, File, RefreshCw } from 'lucide-react';
import { DriveFile } from '../types';

interface LibraryViewProps {
  isSignedIn: boolean;
}

const DRIVE_FOLDER_ID = "1pDHcsAyUSr2D-WRGJvnoE-2sOPaCk3Zz";
const DRIVE_LINK = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;

// Data matching the user's screenshot
const MOCK_FILES: DriveFile[] = [
  { 
    id: '1', 
    name: "L'humain face à l'IA - quand l'imagination devient notre sup...", 
    mimeType: 'application/pdf', 
    size: '1.2 MB', 
    modifiedTime: '17:30' 
  },
  { 
    id: '2', 
    name: 'IA_educ_etat_art_DNE_EA_25.pdf', 
    mimeType: 'application/pdf', 
    size: '3.4 MB', 
    modifiedTime: '29 Nov' 
  },
  { 
    id: '3', 
    name: "5 idées surprenantes sur l'IA d'Andrej Karpathy qui vont à c...", 
    mimeType: 'application/pdf', 
    size: '845 KB', 
    modifiedTime: '29 Nov' 
  },
  { 
    id: '4', 
    name: 'Lumina_Sphere_User_Manual_v1.pdf', 
    mimeType: 'application/pdf', 
    size: '2.1 MB', 
    modifiedTime: '27 Nov' 
  },
  { 
    id: '5', 
    name: 'Q3_Sales_Projections.csv', 
    mimeType: 'text/csv', 
    size: '420 KB', 
    modifiedTime: '27 Nov' 
  },
  { 
    id: '6', 
    name: 'Lumina_Global_Compliance_Regulations.txt', 
    mimeType: 'text/plain', 
    size: '15 KB', 
    modifiedTime: '27 Nov' 
  },
  { 
    id: '7', 
    name: 'Meeting_Notes_Q3_Brainstorm.pdf', 
    mimeType: 'application/pdf', 
    size: '1.8 MB', 
    modifiedTime: '27 Nov' 
  },
  { 
    id: '8', 
    name: 'project_horizon_user_stories.txt', 
    mimeType: 'text/plain', 
    size: '8 KB', 
    modifiedTime: '3 Jul' 
  },
];

export const LibraryView: React.FC<LibraryViewProps> = ({ isSignedIn }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate network request/sync
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };
  
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <HardDrive size={64} className="mb-4 text-slate-300" />
        <p className="text-lg">Sign in to view your Document Library.</p>
      </div>
    );
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') {
        return <FileText className="text-red-500" size={20} />;
    }
    // Screenshot shows blue icons for CSV/TXT
    if (mimeType === 'text/csv' || mimeType === 'text/plain') {
        return <FileText className="text-blue-500" size={20} />;
    }
    return <File className="text-slate-400" size={20} />;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Document Library</h2>
          <p className="text-slate-500 text-sm">Files synced from Google Drive (rag_demo_data)</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`
              flex items-center gap-2 text-sm font-medium transition-colors
              ${isRefreshing ? 'text-blue-600 cursor-not-allowed' : 'text-slate-500 hover:text-blue-600'}
            `}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
          
          <div className="h-4 w-px bg-slate-300" />
          
          <a 
            href={DRIVE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <ExternalLink size={16} />
            Open Drive Folder
          </a>
        </div>
      </div>

      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-opacity duration-300 ${isRefreshing ? 'opacity-60' : 'opacity-100'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modified</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_FILES.map((file) => (
              <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[300px]" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">{file.mimeType.split('/').pop()?.toUpperCase().replace('VND.GOOGLE-APPS.', '')}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600 font-medium font-mono">{file.size}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{file.modifiedTime}</td>
                <td className="py-4 px-6 text-right">
                  <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};