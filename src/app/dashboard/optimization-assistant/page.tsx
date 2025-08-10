
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { optimizationAssistant, OptimizationAssistantOutput } from '@/ai/flows/optimization-assistant';
import { Loader2, Zap, Upload, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function OptimizationAssistantPage() {
  const [documentText, setDocumentText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationAssistantOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.txt'))) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentText(text);
        setError(null);
        setOptimizationResult(null); // Reset on new file
      };
      reader.onerror = () => {
        setError('Failed to read the file. Please try another file.');
        setFileName(null);
        setDocumentText('');
      };
      reader.readAsText(file);
    } else {
      setError('Unsupported file type. Please upload a .txt file.');
      setFileName(null);
      setDocumentText('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/plain': ['.txt'] } });

  const handleOptimize = async () => {
    if (!documentText) {
      setError('Please upload a document first.');
      return;
    }
    setIsOptimizing(true);
    setOptimizationResult(null);
    setError(null);

    try {
      const result = await optimizationAssistant({ documentText });
      setOptimizationResult(result);
    } catch (e) {
      setError('An error occurred during optimization. Please check the AI configuration and try again.');
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <main className="flex flex-col h-full bg-secondary p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-3">
            <Zap className="h-6 w-6" />
            Optimization Assistant
          </CardTitle>
          <CardDescription>
            Automatically identify a document's legal domain and assign it to the best-suited lawyer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              {fileName ? (
                <p className="font-medium text-center">
                  Selected file: <span className="text-primary">{fileName}</span>
                </p>
              ) : (
                <p className="text-muted-foreground text-center">
                  Drag & drop a .txt document here, or click to select a file.
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <Button onClick={handleOptimize} disabled={isOptimizing || !documentText} size="lg">
                {isOptimizing ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-5 w-5" />
                )}
                Optimize Assignment
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isOptimizing ? (
              <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>Analyzing document and optimizing assignment...</p>
              </div>
            ) : optimizationResult ? (
              <div>
                <h3 className="font-semibold text-xl mb-4 font-serif text-center">Assignment Result</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Identified Domain</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Lawyer's New Load</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="capitalize font-medium">{optimizationResult.assignment.docDomain}</TableCell>
                      <TableCell>{optimizationResult.assignment.lawyerName}</TableCell>
                      <TableCell>{optimizationResult.assignment.newLoad} documents</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
               !documentText && <div className="text-center text-muted-foreground text-sm py-10">
                    <p>Upload a document to begin.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
