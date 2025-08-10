
"use client";

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { analyzeLegalClauses, AnalyzeLegalClausesOutput } from '@/ai/flows/analyze-legal-clauses';
import { legalChatbot } from '@/ai/flows/legal-chatbot';
import { Loader2, FileCode, Bot, Search, ZoomIn, ZoomOut, RotateCw, Upload, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

interface AssistantMessage {
    role: 'user' | 'assistant';
    content: string;
}

export default function DashboardPage() {
  const [documentText, setDocumentText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeLegalClausesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assistantQuery, setAssistantQuery] = useState('');
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
      { role: 'assistant', content: "I'm here to help with questions about your document. Ask me anything!" }
  ]);
  const [activeAccordionItems, setActiveAccordionItems] = useState(["analysis"]);
  const router = useRouter();

  const [panelsWidth, setPanelsWidth] = useState({ left: 66, right: 34 });
  const [assistantPanelHeight, setAssistantPanelHeight] = useState(40); // Initial height in percentage
  const isResizingPanels = useRef(false);
  const isResizingAssistant = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const assistantScrollAreaRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setDocumentText(text);
          setError(null);
          handleAnalyze(text);
        };
        reader.onerror = () => {
          setError('Failed to read the file. Please try another file.');
          setFileName('');
          setDocumentText('');
        };
        reader.readAsText(file);
      } else {
        setError('Unsupported file type. Please upload a .txt file.');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
        'text/plain': ['.txt'],
    }
  });

  const handleAnalyze = async (text: string) => {
    if (!text.trim()) {
      setError('The document is empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
        const analysis = await analyzeLegalClauses({ documentText: text });
        setAnalysisResult(analysis);

    } catch (e) {
      setError('An error occurred during analysis. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = async () => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText && selectedText.length > 10) { 
        localStorage.setItem('deepSearchQuery', selectedText);
        router.push('/dashboard/deep-search');
    }
  };

  const scrollToAssistantBottom = () => {
    setTimeout(() => {
      const scrollableViewport = (assistantScrollAreaRef.current?.firstChild as HTMLElement)?.firstChild as HTMLElement;
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }, 100);
  };

  const handleAssistantSend = async () => {
    if (!assistantQuery.trim() || !documentText.trim()) return;

    const newMessages: AssistantMessage[] = [...assistantMessages, { role: 'user', content: assistantQuery }];
    setAssistantMessages(newMessages);
    const currentQuery = assistantQuery;
    setAssistantQuery('');
    setIsAssistantLoading(true);
    scrollToAssistantBottom();
    
    try {
        const result = await legalChatbot({
            query: currentQuery,
            history: newMessages.slice(0, -1),
            documentDataUri: `data:text/plain;base64,${btoa(documentText)}`,
        });
        setAssistantMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch(e) {
        console.error(e);
        setAssistantMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
        setIsAssistantLoading(false);
        scrollToAssistantBottom();
    }
  };

  const getRiskColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleMouseDownPanels = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingPanels.current = true;
    document.addEventListener('mousemove', handleMouseMovePanels);
    document.addEventListener('mouseup', handleMouseUpPanels);
  };

  const handleMouseMovePanels = (e: MouseEvent) => {
    if (isResizingPanels.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (newLeftWidth > 25 && newLeftWidth < 75) { 
        setPanelsWidth({ left: newLeftWidth, right: 100 - newLeftWidth });
      }
    }
  };

  const handleMouseUpPanels = () => {
    isResizingPanels.current = false;
    document.removeEventListener('mousemove', handleMouseMovePanels);
    document.removeEventListener('mouseup', handleMouseUpPanels);
  };

  const handleMouseDownAssistant = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingAssistant.current = true;
    document.addEventListener('mousemove', handleMouseMoveAssistant);
    document.addEventListener('mouseup', handleMouseUpAssistant);
  };

  const handleMouseMoveAssistant = (e: MouseEvent) => {
    if (isResizingAssistant.current && rightPanelRef.current) {
      const containerRect = rightPanelRef.current.getBoundingClientRect();
      const newHeight = ((containerRect.bottom - e.clientY) / containerRect.height) * 100;

      if (newHeight > 20 && newHeight < 80) {
        setAssistantPanelHeight(newHeight);
      }
    }
  };

  const handleMouseUpAssistant = () => {
    isResizingAssistant.current = false;
    document.removeEventListener('mousemove', handleMouseMoveAssistant);
    document.removeEventListener('mouseup', handleMouseUpAssistant);
  };


  return (
    <>
      <header className="flex items-center justify-between p-4 border-b bg-background">
          <h1 className="text-xl font-semibold font-serif">Document Workspace</h1>
          <div className="flex items-center gap-4">
              
          </div>
      </header>

      <main ref={containerRef} className="flex-1 flex min-h-0 p-4 bg-secondary gap-1">
        <div style={{ width: `${panelsWidth.left}%` }}>
            <Card className="h-full flex flex-col min-h-0 shadow-sm">
                <CardHeader className="flex-row items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2 text-sm font-medium">
                    {fileName ? (
                        <>
                        <FileCode className="h-5 w-5 text-primary" />
                        <span>{fileName}</span>
                        </>
                    ) : (
                            <span className="text-muted-foreground">No document uploaded</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><ZoomOut className="h-5 w-5" /></Button>
                    <span className="text-sm font-semibold px-2">100%</span>
                    <Button variant="ghost" size="icon"><ZoomIn className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><RotateCw className="h-5 w-5" /></Button>
                    <Button variant="outline" size="sm" onClick={open}><Upload className="mr-2 h-4 w-4" /> New Document</Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-2 mt-2 min-h-0">
                <ScrollArea className="h-full">
                <div {...getRootProps()} className={cn("h-full w-full rounded-lg", isDragActive && "border-primary border-dashed border-2 bg-primary/5")}>
                    <input {...getInputProps()} />
                    {documentText ? (
                        <div onMouseUp={handleTextSelection} className="p-6 whitespace-pre-wrap text-sm leading-relaxed">
                            {documentText}
                        </div>
                    ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 min-h-[500px]" onClick={open}>
                        <Upload className="h-16 w-16 mb-4 text-primary/50" />
                        <h3 className="text-lg font-semibold font-serif">Upload your document</h3>
                        <p className="text-sm">Drag and drop a .txt file here or click to select a file.</p>
                            {isDragActive && <p className="text-primary mt-2">Drop the file to upload!</p>}
                    </div>
                    )}
                </div>
                </ScrollArea>
            </CardContent>
            </Card>
        </div>

        <div 
          className="w-2 cursor-col-resize bg-border hover:bg-primary transition-colors"
          onMouseDown={handleMouseDownPanels}
        />

        <div ref={rightPanelRef} style={{ width: `${panelsWidth.right}%` }} className="flex flex-col min-h-0">
            <div style={{ height: `${100 - assistantPanelHeight}%` }}>
                <ScrollArea className="h-full">
                <div className="p-4 pl-5">
                    <h2 className="text-lg font-semibold mb-4 font-serif">Document Tools</h2>
                    <Accordion type="multiple" className="w-full space-y-3" value={activeAccordionItems} onValueChange={setActiveAccordionItems}>
                    <Card className="shadow-sm">
                        <AccordionItem value="analysis" className="border-none">
                        <AccordionTrigger className="p-4 font-semibold text-base hover:no-underline">
                            <div className="flex items-center gap-3">
                                <FileCode className="h-5 w-5" /> Document Analysis
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                            {isLoading && !analysisResult ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                            ) : analysisResult ? (
                            <div className="space-y-3">
                                {analysisResult.clauseAnalysis.map((item, index) => (
                                <div key={index} className="p-3 border rounded-md bg-secondary">
                                    <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-sm">Clause Analysis</h4>
                                    <Badge variant="outline" className={cn("text-xs border font-medium", getRiskColor(item.riskLevel))}>
                                        {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)} Risk
                                    </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic mb-2">"{item.clause}"</p>
                                    <p className="text-xs">{item.explanation}</p>
                                </div>
                                ))}
                            </div>
                            ) : (
                            <div className="text-center text-muted-foreground text-sm p-4">
                                <p>Upload a document to analyze clauses for risks.</p>
                            </div>
                            )}
                        </AccordionContent>
                        </AccordionItem>
                    </Card>

                    </Accordion>
                </div>
            </ScrollArea>
            </div>
            
            <div 
                className="h-2 cursor-row-resize bg-border hover:bg-primary transition-colors"
                onMouseDown={handleMouseDownAssistant}
            />

            <div style={{ height: `${assistantPanelHeight}%` }} className="flex flex-col min-h-0">
                <div className="p-4 pl-5 border-t flex-1 flex flex-col min-h-0">
                    <h3 className="text-base font-semibold mb-2 flex items-center gap-2 font-serif"><Bot className="h-5 w-5" /> Document Assistant</h3>
                    <Card className="p-3 shadow-sm flex flex-col flex-1 min-h-0">
                        <ScrollArea className="flex-1 pr-2 -mr-2" ref={assistantScrollAreaRef}>
                            <div className="space-y-4">
                                {assistantMessages.map((msg, index) => (
                                    <div key={index} className={cn("flex items-start gap-2", msg.role === 'user' && 'justify-end')}>
                                        {msg.role === 'assistant' && <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1" />}
                                        <div className={cn("rounded-lg p-2 text-sm max-w-[90%]", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isAssistantLoading && (
                                    <div className="flex items-start gap-2">
                                        <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                        <div className="rounded-lg p-2 text-sm bg-secondary flex items-center">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="mt-2 relative">
                            <Textarea 
                                placeholder="Ask about this document..." 
                                className="bg-background pr-10 text-sm" 
                                rows={2}
                                value={assistantQuery}
                                onChange={(e) => setAssistantQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAssistantSend();
                                    }
                                }}
                                />
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                    onClick={handleAssistantSend}
                                    disabled={!assistantQuery.trim() || !documentText.trim() || isAssistantLoading}
                                >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
      </main>
    </>
  );
}
