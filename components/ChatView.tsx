
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Info, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { parse } from 'marked';
import { Message, Citation } from '../types';

interface ChatViewProps {
  isSignedIn: boolean;
}

const DRIVE_FOLDER_ID = "1pDHcsAyUSr2D-WRGJvnoE-2sOPaCk3Zz";

// Regex to identify the start of the references section in multiple languages
const REF_HEADER_REGEX = /(?:^|\n)\s*(?:R[eé]f[eé]rences?|Sources?|Bibliograph(?:ie|y))\s*:?[\s\S]*$/i;

export const ChatView: React.FC<ChatViewProps> = ({ isSignedIn }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm connected to your n8n RAG workflow. Ask me anything about your uploaded documents.",
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate a persistent session ID for this chat instance
  const sessionIdRef = useRef(`session-${Math.random().toString(36).substring(2, 9)}`);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = () => {
    sessionIdRef.current = `session-${Math.random().toString(36).substring(2, 9)}`;
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: "Hello! I'm connected to your n8n RAG workflow. Ask me anything about your uploaded documents.",
        timestamp: Date.now()
      }
    ]);
    setInputText('');
    setIsLoading(false);
  };

  // Clear chat when user signs out
  useEffect(() => {
    if (!isSignedIn) {
      handleNewChat();
    }
  }, [isSignedIn]);

  // Helper to remove trailing punctuation from URLs
  const cleanUrl = (url: string): string => {
    return url.replace(/[.,;!?\])>"'\)]+$/, '').replace(/^[<"'\((]+/, '');
  };

  // Client-side fallback to extract citations if n8n failed to parse them cleanly
  const extractCitationsFromRawText = (text: string): Citation[] => {
    const citations: Citation[] = [];
    const refSectionMatch = text.match(REF_HEADER_REGEX);
    
    if (refSectionMatch) {
      const refBlock = refSectionMatch[0];
      
      // Split the reference block into lines to process them individually
      const lines = refBlock.split(/\r?\n/).filter(line => line.trim() !== '');
      
      let currentId = 1;

      lines.forEach(line => {
        // Skip lines that are just the header itself
        if (/^\s*(?:R[eé]f[eé]rences?|Sources?|Bibliograph(?:ie|y))\s*:?\s*$/i.test(line)) {
            return;
        }

        let cleanLine = line.replace(/^\s*(?:R[eé]f[eé]rences?|Sources?|Bibliograph(?:ie|y))\s*:?\s*/i, '');
        
        if (!cleanLine.trim()) return;

        // Try to identify ID and Title
        const startIdMatch = cleanLine.match(/^\[(\d+)\]\s*/) || cleanLine.match(/^(\d+)\.\s*/);
        const endIdMatch = cleanLine.match(/\s*\[(\d+)\]$/);
        
        let id = currentId;
        let title = cleanLine;
        let url = '';

        if (startIdMatch) {
            id = parseInt(startIdMatch[1]);
            title = cleanLine.substring(startIdMatch[0].length);
        } else if (endIdMatch) {
            id = parseInt(endIdMatch[1]);
            title = cleanLine.substring(0, endIdMatch.index);
        }
        
        // Extract URL if present inline
        const urlMatch = title.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
            url = urlMatch[1];
            title = title.replace(url, '').trim();
        }
        
        title = title.trim().replace(/\s*[-:<>()\[\]]\s*$/, '');
        
        const bracketMatch = title.match(/^\[(.*?)\]$/);
        if (bracketMatch) {
            title = bracketMatch[1];
        }

        if (title) {
            citations.push({
                id: id.toString(),
                title: title,
                url: cleanUrl(url)
            });
            // If we didn't find an explicit ID, increment for the next one
            if (!startIdMatch && !endIdMatch) {
                currentId++;
            } else {
                // If we found an explicit ID, set currentId to next possible to avoid collisions if mixed
                currentId = id + 1;
            }
        }
      });
    }
    
    return citations.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now()
    }]);

    try {
      const response = await fetch('https://anneroyam.app.n8n.cloud/webhook/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '3ee0be8da48620f94c13bc0735ead8c91cc44068e4804e5324f34b55a75554dc8340a993493745a2c4f2153a482355d192b0da7d52c383028ba0d2ea09cb0603'
        },
        body: JSON.stringify({ 
          message: userMsg.text,
          sessionId: sessionIdRef.current
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const textData = await response.text();
      let data: any = {};
      
      try {
        if (textData.trim()) {
            data = JSON.parse(textData);
        } else {
            data = { output: "The workflow completed but returned no content." };
        }
      } catch (e) {
        data = { output: textData };
      }
      
      let responseText = "";
      let rawCitations: Citation[] = [];
      
      if (data.answer) {
        responseText = data.answer;
        if (Array.isArray(data.citations) && data.citations.length > 0) {
          rawCitations = data.citations;
        } else if (data.fullResponse) {
          rawCitations = extractCitationsFromRawText(data.fullResponse);
        }
      } else if (data.output) {
        responseText = data.output;
        rawCitations = extractCitationsFromRawText(data.output);
        if (rawCitations.length > 0) {
            responseText = responseText.replace(REF_HEADER_REGEX, '').trim();
        }
      } else if (typeof data === 'string') {
        responseText = data;
      } else if (data.text) {
        responseText = data.text;
      } else {
        responseText = JSON.stringify(data, null, 2);
      }

      if (!responseText) {
          responseText = "Received an empty response from the workflow.";
      }

      // Deduplicate citations based on Title to avoid showing the same source multiple times
      // We keep the FIRST occurrence of a citation (lowest ID usually)
      const uniqueCitationsMap = new Map<string, Citation>();
      
      rawCitations.forEach((c, index) => {
        // Normalize title for deduplication (ignore case and whitespace)
        const key = c.title.toLowerCase().trim();
        if (!uniqueCitationsMap.has(key)) {
             // Use existing ID if available, otherwise 1-based index
            const id = c.id || (index + 1).toString();
            uniqueCitationsMap.set(key, { ...c, id });
        }
      });
      
      let citations = Array.from(uniqueCitationsMap.values());

      // Final pass: ensure URLs are valid
      citations = citations.map((c) => {
        let url = cleanUrl(c.url);
        
        const needsSearchFallback = 
          !url || 
          (url.includes('drive.google.com') && url.includes('/file/')) ||
          url.includes('googledrivestore') || 
          url.includes('fileSearchStores') || 
          url.includes('n8n');

        if (needsSearchFallback) {
          const titleWithoutExt = c.title.replace(/\.[^/.]+$/, "");
          const keywords = titleWithoutExt.replace(/[_"\-]/g, ' ').replace(/\s+/g, ' ').trim();
          const searchQuery = `parent:${DRIVE_FOLDER_ID} ${keywords}`;
          url = `https://drive.google.com/drive/search?q=${encodeURIComponent(searchQuery)}`;
        }
        
        return { ...c, url };
      });

      // Sort by ID for display
      citations.sort((a, b) => parseInt(a.id) - parseInt(b.id));

      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, text: responseText, citations: citations } : msg
      ));
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, text: "I'm sorry, I encountered an error connecting to the n8n workflow. Please make sure the workflow is active." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderStyledText = (text: string, citations?: Citation[]) => {
    // 1. Parse Markdown using marked
    let htmlContent = parse(text) as string;

    // 2. Inject Citation Buttons into the HTML
    // We regex replace [1], [ 1 ], etc. in the HTML string with our anchor tag HTML
    if (citations && citations.length > 0) {
        htmlContent = htmlContent.replace(/\[\s*(\d+)\s*\]/g, (match, idStr) => {
            const id = parseInt(idStr);
            const citation = citations.find(c => parseInt(c.id) === id);
            
            // Note: If citation is deduped, we might not find '4' if '4' was a duplicate of '1'.
            // In that case, we leave it as text or we could map it to the deduped one if we tracked aliases.
            // For now, if we can't find the ID (because it was deduped away), we render plain text.
            
            if (citation && citation.url) {
                return `<a href="${citation.url}" target="_blank" rel="noopener noreferrer" class="citation-btn" title="${citation.title}">${idStr}</a>`;
            }
            return match;
        });
    }

    return (
        <div 
            className="chat-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
    );
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8">
        <Info size={48} className="mb-4 text-blue-400" />
        <p className="text-lg font-medium">Please sign in to access the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white max-w-5xl mx-auto shadow-sm border-x border-slate-100">
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-600'}
            `}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            
            <div className={`
              max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'}
            `}>
              {msg.text ? (
                <>
                  {renderStyledText(msg.text, msg.citations)}
                  
                  {msg.citations && msg.citations.length > 0 && (
                    <div className={`mt-4 pt-3 border-t ${msg.role === 'user' ? 'border-white/20' : 'border-slate-200'}`}>
                      <p className={`text-xs font-semibold mb-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-500'}`}>
                        Sources:
                      </p>
                      <div className="flex flex-col gap-2">
                        {msg.citations.map((citation, idx) => (
                          <a 
                            key={idx}
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                              flex items-center gap-2 text-xs p-2 rounded transition-colors
                              ${msg.role === 'user' 
                                ? 'bg-blue-700/50 hover:bg-blue-700 text-blue-100' 
                                : 'bg-white hover:bg-slate-50 text-blue-600 border border-slate-200'}
                            `}
                          >
                            <span className="flex-shrink-0 font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                              [{citation.id}]
                            </span>
                            <FileText size={14} className="flex-shrink-0" />
                            <span className="truncate flex-1">{citation.title}</span>
                            <ExternalLink size={12} className="flex-shrink-0 opacity-50" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                 <div className="flex items-center gap-2 text-slate-400">
                   <Loader2 size={16} className="animate-spin" />
                   <span>Thinking...</span>
                 </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 relative">
          <button
            onClick={handleNewChat}
            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="New Chat"
          >
            <RefreshCw size={20} />
          </button>
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about your documents..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`
              p-3 rounded-xl transition-all shadow-sm
              ${!inputText.trim() || isLoading 
                ? 'bg-slate-100 text-slate-300' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'}
            `}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-300 mt-2">
          AI responses may vary. Double-check important information.
        </p>
      </div>
    </div>
  );
};
