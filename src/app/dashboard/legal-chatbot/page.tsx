
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Bot, User, Send, Paperclip, X, File as FileIcon, LogIn } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { legalChatbot, LegalChatbotInput } from '@/ai/flows/legal-chatbot';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  filePreview?: string;
  fileName?: string;
}

interface Jurisdiction {
  code: string;
  name: string;
}

export default function LegalChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const initialLoad = useRef(true);

  useEffect(() => {
    const storedJurisdiction = localStorage.getItem('jurisdiction');
    if (storedJurisdiction) {
        setJurisdiction(JSON.parse(storedJurisdiction));
    }

    if (initialLoad.current) {
        const query = localStorage.getItem('chatbotQuery');
        const context = localStorage.getItem('chatbotContext');
        const fileName = localStorage.getItem('chatbotFileName');

        if (query) {
            setInput(query);
        }

        if (context) {
            const initialMessage: Message = {
                role: 'user',
                content: query || "Please analyze this document.",
                filePreview: `data:text/plain;base64,${btoa(context)}`,
                fileName: fileName || "document.txt"
            };
            setMessages([initialMessage]);
            handleSendMessage(query || "Please analyze this document.", `data:text/plain;base64,${btoa(context)}`);
        }
        
        localStorage.removeItem('chatbotQuery');
        localStorage.removeItem('chatbotContext');
        localStorage.removeItem('chatbotFileName');

        initialLoad.current = false;
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
        setFile(uploadedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
  });

  const scrollToBottom = () => {
      setTimeout(() => {
          const scrollableViewport = (scrollAreaRef.current?.firstChild as HTMLElement)?.firstChild as HTMLElement;
          if (scrollableViewport) {
            scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
          }
      }, 100)
  };

  const handleSendMessage = async (currentInput?: string, currentFilePreview?: string) => {
    if (!jurisdiction) {
        // This should ideally be handled more gracefully, e.g., with a toast notification
        console.error("Jurisdiction not set.");
        return;
    }

    const query = currentInput ?? input;
    const fileDataUri = currentFilePreview ?? filePreview;

    if (!query.trim() && !fileDataUri) return;

    const userMessage: Message = { 
        role: 'user', 
        content: query,
        ...(fileDataUri && { filePreview: fileDataUri, fileName: file?.name || "Uploaded File" }),
    };

    const newMessages: Message[] = messages.find(m => m.filePreview === fileDataUri) ? [...messages] : [...messages, userMessage];
    
    if(!currentInput) {
        setMessages(newMessages);
    }

    setInput('');
    setFile(null);
    setFilePreview(null);
    setIsLoading(true);

    scrollToBottom();

    try {
        const payload: LegalChatbotInput = {
            query: query,
            history: messages,
            jurisdiction: jurisdiction.name,
        };
        if(fileDataUri){
            payload.documentDataUri = fileDataUri;
        }

        const result = await legalChatbot(payload);
        
        setMessages([
            ...newMessages,
            { role: 'assistant', content: result.response },
        ]);

    } catch (e) {
        setMessages([
            ...newMessages,
            { role: 'assistant', content: "Sorry, I encountered an error. Please try again." },
        ]);
        console.error(e);
    } finally {
        setIsLoading(false);
        scrollToBottom();
    }
  };
  
  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  }

  return (
    <main className="flex flex-col h-full bg-secondary p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg flex flex-col h-full" {...getRootProps()}>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="font-serif text-2xl flex items-center gap-3">
            <Bot className="h-6 w-6" />
            Legal Question Chatbot
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                  <div className={`p-3 rounded-lg max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {message.filePreview && (
                        <div className="mb-2 p-2 border rounded-md bg-background/20">
                            {message.filePreview.startsWith('data:image') ? (
                                <Image src={message.filePreview} alt={message.fileName || "Uploaded image"} width={200} height={150} className="rounded-md object-cover" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FileIcon className="h-6 w-6 flex-shrink-0" />
                                    <span className="text-sm font-medium">{message.fileName}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                    <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                    <div className="p-3 rounded-lg bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 pt-4 border-t">
             {filePreview && (
                <div className="relative p-2 border rounded-lg flex items-center gap-3 mb-2">
                    {file?.type.startsWith('image/') ? (
                        <Image src={filePreview} alt="Preview" width={40} height={40} className="rounded-md object-cover"/>
                    ) : (
                        <FileIcon className="h-6 w-6 text-muted-foreground"/>
                    )}
                    <div className="text-sm flex-1">
                        <p className="font-medium truncate">{file?.name}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeFile}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <div className="relative">
              <input {...getInputProps()} />
              <Textarea
                placeholder="Ask a legal question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="pr-24 text-base"
                rows={2}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={open}>
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Button
                    size="icon"
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || (!input.trim() && !file) || !jurisdiction}
                >
                    <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
