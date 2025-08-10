
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzeLegalClauses, AnalyzeLegalClausesOutput } from '@/ai/flows/analyze-legal-clauses';
import { redactSensitiveData, RedactSensitiveDataOutput } from '@/ai/flows/redact-sensitive-data';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [documentText, setDocumentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeLegalClausesOutput | null>(null);
  const [redactionResult, setRedactionResult] = useState<RedactSensitiveDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      setError('Please paste a document to analyze.');
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
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className="flex flex-col h-screen bg-secondary">
      <header className="flex items-center justify-between p-4 bg-background border-b">
        <h1 className="text-xl font-bold font-headline">Document Analysis</h1>
        <Button onClick={handleAnalyze} disabled={isLoading}>
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
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Document</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Textarea
              placeholder="Paste your legal document here..."
              className="flex-1 resize-none text-sm leading-relaxed"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
            />
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
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
                {error && (
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
                             <div key={index} className="p-4 border rounded-lg bg-background">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">Clause Analysis</h4>
                                <Badge className={cn("text-xs", getRiskColor(item.riskLevel))}>
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
                        <div className="p-4 border rounded-lg bg-background space-y-4">
                           <div className="flex items-center gap-2 text-green-600">
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
  );
}
