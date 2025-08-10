
"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzeLegalClauses, AnalyzeLegalClausesOutput } from '@/ai/flows/analyze-legal-clauses';
import { redactSensitiveData, RedactSensitiveDataOutput } from '@/ai/flows/redact-sensitive-data';
import { Loader2, AlertTriangle, ShieldCheck, UploadCloud, FileText as FileTextIcon, Bot, Scale, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const [documentText, setDocumentText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeLegalClausesOutput | null>(null);
  const [redactionResult, setRedactionResult] = useState<RedactSensitiveDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentText(text);
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read the file. Please try another file.');
        setFileName('');
        setDocumentText('');
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      setError('Please upload a document to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setRedactionResult(null);

    try {
      const [analysis, redaction] = await Promise.all([
        analyzeLegalClauses({ documentText }),
        redactSensitiveData({ documentText }),
      ]);
      setAnalysisResult(analysis);
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


  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-16 flex flex-col items-center space-y-4 py-4 bg-secondary/30 border-r border-border">
        <Link href="/dashboard">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
                <Scale className="h-6 w-6" />
            </div>
        </Link>
        <nav className="flex flex-col items-center space-y-2">
            <Link href="/dashboard">
                <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                    <Bot className="h-6 w-6" />
                </div>
            </Link>
        </nav>
        <div className="mt-auto">
             <Link href="#">
                <div className="p-2 rounded-lg hover:bg-secondary">
                    <Settings className="h-6 w-6" />
                </div>
            </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold">Document Analysis</h1>
          <Button onClick={handleAnalyze} disabled={isLoading || !documentText}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Document'
            )}
          </Button>
        </header>

        <main className="flex-1 grid md:grid-cols-2 gap-6 p-6 overflow-hidden">
          <Card className="flex flex-col bg-secondary/20 border-border">
            <CardHeader>
              <CardTitle>Document</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              <div 
                className={cn(
                  "flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                  documentText ? "border-solid bg-background" : ""
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".txt,.md,.html"
                />
                {documentText ? (
                  <div className="flex flex-col items-center text-center p-4">
                    <FileTextIcon className="h-12 w-12 text-primary mb-2" />
                    <p className="font-semibold">{fileName}</p>
                    <p className="text-sm text-muted-foreground">({(documentText.length / 1024).toFixed(2)} KB)</p>
                    <Button variant="link" size="sm" className="mt-2">Click or drop another file to replace</Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center text-muted-foreground">
                    <UploadCloud className="h-12 w-12 mb-2" />
                    <p className="font-semibold">Drag & drop files here</p>
                    <p className="text-sm">or click to browse</p>
                    <p className="text-xs mt-2">Supports .txt, .md, .html files</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col bg-secondary/20 border-border">
            <CardHeader>
              <CardTitle>AI Tools</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <Tabs defaultValue="analysis" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="analysis">Clause Analysis</TabsTrigger>
                  <TabsTrigger value="redaction">Redaction</TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-y-auto mt-4 pr-2">
                  {isLoading && (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  {error && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-destructive">
                      <AlertTriangle className="h-8 w-8 mb-2" />
                      <p>{error}</p>
                    </div>
                  )}
                  {!isLoading && !error && (
                    <>
                      <TabsContent value="analysis" className="m-0">
                        {!analysisResult && (
                          <div className="text-center text-muted-foreground pt-16">
                            <p>Clause-by-clause analysis and risk assessment will appear here.</p>
                          </div>
                        )}
                        {analysisResult && (
                          <div className="space-y-4">
                            {analysisResult.clauseAnalysis.map((item, index) => (
                              <div key={index} className="p-4 border rounded-lg bg-background/50">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold">Clause Analysis</h4>
                                  <Badge className={cn("text-xs border", getRiskColor(item.riskLevel))}>
                                    {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)} Risk
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground italic mb-2">"{item.clause}"</p>
                                <p className="text-sm">{item.explanation}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="redaction" className="m-0">
                        {!redactionResult && (
                          <div className="text-center text-muted-foreground pt-16">
                            <p>Sensitive data will be automatically detected and redacted.</p>
                          </div>
                        )}
                        {redactionResult && (
                          <div className="p-4 border rounded-lg bg-background/50 space-y-4">
                            <div className="flex items-center gap-2 text-green-400">
                              <ShieldCheck className="h-5 w-5"/>
                              <h4 className="font-semibold">Redaction Complete</h4>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{redactionResult.redactedDocument}</p>
                          </div>
                        )}
                      </TabsContent>
                    </>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
