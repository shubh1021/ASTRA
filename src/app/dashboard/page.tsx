
"use client";

import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { analyzeLegalClauses, AnalyzeLegalClausesOutput } from '@/ai/flows/analyze-legal-clauses';
import { redactSensitiveData, RedactSensitiveDataOutput } from '@/ai/flows/redact-sensitive-data';
import { Loader2, AlertTriangle, ShieldCheck, FileText as FileTextIcon, Bot, Scale, Settings, ArrowLeft, Search, ZoomIn, ZoomOut, RotateCw, Upload, Send, FileCode, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';

export default function DashboardPage() {
  const [documentText, setDocumentText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeLegalClausesOutput | null>(null);
  const [redactionResult, setRedactionResult] = useState<RedactSensitiveDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
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
    setRedactionResult(null);

    try {
      const analysisPromise = analyzeLegalClauses({ documentText: text });
      const redactionPromise = redactSensitiveData({ documentText: text });

      const analysis = await analysisPromise;
      setAnalysisResult(analysis);
      
      const redaction = await redactionPromise;
      setRedactionResult(redaction);

    } catch (e) {
      setError('An error occurred during analysis. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRiskColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const { open } = useDropzone({
    onDrop,
     accept: {
        'text/plain': ['.txt'],
    } 
  });


  return (
    <div className="flex h-screen bg-secondary/30 text-foreground">
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center gap-4">
            <Link href="/jurisdiction">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Document Workspace</h1>
          </div>
        </header>

        <main className="flex-1 grid md:grid-cols-3 gap-1 overflow-hidden">
          {/* Document Viewer */}
          <div className="md:col-span-2 flex flex-col bg-background p-4" {...getRootProps()}>
            <input {...getInputProps()} />
             <div className="flex items-center justify-between p-2 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-medium">
                    {fileName ? (
                        <>
                        <FileCode className="h-5 w-5 text-primary" />
                        <span>{fileName}</span>
                        </>
                    ) : (
                         <span>No document uploaded</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
                    <span className="text-sm font-semibold">100%</span>
                    <Button variant="ghost" size="icon"><ZoomIn className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><ZoomOut className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon"><RotateCw className="h-5 w-5" /></Button>
                    <Button variant="outline" size="sm" onClick={open}><Upload className="mr-2 h-4 w-4" /> New Document</Button>
                </div>
            </div>
            <CardContent className="flex-1 p-2 mt-2">
              <div className={cn("h-full w-full rounded-lg border bg-background", isDragActive && "border-primary")}>
                {documentText ? (
                    <div className="p-8 whitespace-pre-wrap text-sm leading-relaxed overflow-auto h-full">
                        {documentText}
                    </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8" onClick={open}>
                      <Upload className="h-16 w-16 mb-4 text-primary/50" />
                      <h3 className="text-lg font-semibold">Upload your document</h3>
                      <p className="text-sm">Drag and drop a .txt file here or click to select a file.</p>
                       {isDragActive && <p className="text-primary mt-2">Drop the file to upload!</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </div>
          
          {/* AI Tools Panel */}
          <aside className="md:col-span-1 flex flex-col bg-background p-4 border-l border-border">
            <h2 className="text-lg font-semibold mb-4">Document Tools</h2>
            <Accordion type="multiple" className="w-full space-y-3" defaultValue={["analysis", "redaction", "deepsearch"]}>
              <Card className="bg-secondary/30">
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
                          <div key={index} className="p-3 border rounded-md bg-background/50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">Clause Analysis</h4>
                              <Badge className={cn("text-xs border", getRiskColor(item.riskLevel))}>
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

               <Card className="bg-secondary/30">
                 <AccordionItem value="redaction" className="border-none">
                  <AccordionTrigger className="p-4 font-semibold text-base hover:no-underline">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5" /> Redaction Review
                     </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                     {isLoading && !redactionResult ? (
                      <div className="flex items-center justify-center p-4">
                         <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : redactionResult ? (
                      <div className="p-3 border rounded-md bg-background/50 space-y-2">
                        <div className="flex items-center gap-2 text-green-400">
                          <ShieldCheck className="h-4 w-4"/>
                          <h4 className="font-semibold text-sm">Redaction Complete</h4>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{redactionResult.redactedDocument}</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground text-sm p-4">
                        <p>Upload a document to find and redact sensitive info.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Card>

              <Card className="bg-secondary/30">
               <AccordionItem value="deepsearch" className="border-none">
                  <AccordionTrigger className="p-4 font-semibold text-base hover:no-underline">
                     <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5" /> DeepSearch
                     </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="text-center text-muted-foreground text-sm p-4">
                      <p>DeepSearch functionality will be available soon.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            </Accordion>
            
            <div className="mt-auto pt-4">
                <h3 className="text-base font-semibold mb-2 flex items-center gap-2"><Bot className="h-5 w-5" /> Document Assistant</h3>
                <Card className="bg-secondary/30 p-3">
                    <div className="bg-background/50 p-2 rounded-md text-sm text-muted-foreground">
                        I'm here to help with questions about your document. Ask me anything!
                    </div>
                    <div className="mt-2 relative">
                        <Textarea placeholder="Ask about this document..." className="bg-background pr-10 text-sm" rows={2}/>
                         <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
