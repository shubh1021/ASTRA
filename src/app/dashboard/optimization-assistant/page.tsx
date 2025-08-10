
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { optimizationAssistant, OptimizationAssistantOutput } from '@/ai/flows/optimization-assistant';
import { getLawyers, resetAssignments, Lawyer } from '@/services/optimization';
import { Loader2, Zap, Upload, AlertTriangle, FileText, X, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface FileWithContent {
  id: string;
  name: string;
  text: string;
}

export default function OptimizationAssistantPage() {
  const [stagedFiles, setStagedFiles] = useState<FileWithContent[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationAssistantOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLawyerData = async () => {
    try {
      const data = await getLawyers();
      setLawyers(data);
    } catch (e) {
      setError("Failed to fetch lawyer data.");
      console.error(e);
    }
  };
  
  useEffect(() => {
    fetchLawyerData();
  }, []);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    let newFiles: FileWithContent[] = [];
    let fileReadPromises: Promise<void>[] = [];

    acceptedFiles.forEach(file => {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          const reader = new FileReader();
          
          const promise = new Promise<void>((resolve, reject) => {
              reader.onload = (e) => {
                  const text = e.target?.result as string;
                  newFiles.push({
                      id: file.name, // Use file name as a unique ID
                      name: file.name,
                      text: text
                  });
                  resolve();
              };
              reader.onerror = (e) => {
                  console.error("Failed to read file:", file.name, e);
                  reject();
              };
          });

          reader.readAsText(file);
          fileReadPromises.push(promise);

      } else {
        setError(prev => (prev ? `${prev}\n` : '') + `Unsupported file type: ${file.name}. Please upload .txt files only.`);
      }
    });

    Promise.all(fileReadPromises).then(() => {
        setStagedFiles(prev => [...prev, ...newFiles]);
    });

  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/plain': ['.txt'] } });
  
  const removeFile = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  }

  const handleOptimize = async () => {
    if (stagedFiles.length === 0) {
      setError('Please upload at least one document.');
      return;
    }
    setIsProcessing(true);
    setOptimizationResult(null);
    setError(null);

    try {
      const result = await optimizationAssistant({ documents: stagedFiles });
      setOptimizationResult(result);
      await fetchLawyerData(); // Refresh lawyer data to show new loads
      setStagedFiles([]); // Clear staged files after processing
    } catch (e) {
      setError('An error occurred during optimization. Please check the AI configuration and try again.');
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setError(null);
    try {
        await resetAssignments();
        await fetchLawyerData(); // Refresh lawyer data to show reset loads
        setOptimizationResult(null); // Clear previous results
    } catch (e) {
        setError("Failed to reset assignments.");
        console.error(e);
    } finally {
        setIsResetting(false);
    }
  }

  return (
    <main className="flex flex-col h-full bg-secondary p-4 md:p-8 space-y-8">
      {/* Lawyer Status Card */}
      <Card className="shadow-lg">
          <CardHeader className="flex-row justify-between items-center">
              <div>
                <CardTitle className="font-serif text-xl flex items-center gap-3">
                    Lawyer Workload
                </CardTitle>
                <CardDescription>
                    Current document assignments for all lawyers.
                </CardDescription>
              </div>
              <Button onClick={handleReset} disabled={isResetting} variant="outline" size="sm">
                  {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Reset Assignments
              </Button>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Lawyer</TableHead>
                          <TableHead>Expertise</TableHead>
                          <TableHead className="text-right">Assigned Documents</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {lawyers.map(lawyer => (
                          <TableRow key={lawyer.id}>
                              <TableCell className="font-medium">{lawyer.name}</TableCell>
                              <TableCell className="space-x-1">
                                  {Array.from(lawyer.expertise).map(ex => <Badge key={ex} variant="secondary">{ex.replace('_', ' ')}</Badge>)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-lg">{lawyer.assigned_docs}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
      
      {/* Optimization Card */}
      <Card className="w-full mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-3">
            <Zap className="h-6 w-6" />
            Optimization Assistant
          </CardTitle>
          <CardDescription>
            Upload one or more documents to automatically identify their legal domains and assign them to the best-suited lawyers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Drag & drop .txt documents here, or click to select files.
            </p>
          </div>

          {stagedFiles.length > 0 && (
              <div className="space-y-2">
                  <h4 className="font-medium text-sm">Staged Files ({stagedFiles.length}):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {stagedFiles.map(file => (
                          <div key={file.id} className="flex items-center gap-2 p-2 border rounded-md bg-secondary">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm truncate flex-1">{file.name}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file.id)}>
                                  <X className="h-4 w-4" />
                              </Button>
                          </div>
                      ))}
                  </div>
              </div>
          )}
          
          <div className="flex justify-center border-t pt-6">
            <Button onClick={handleOptimize} disabled={isProcessing || stagedFiles.length === 0} size="lg">
              {isProcessing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Zap className="mr-2 h-5 w-5" />
              )}
              Optimize {stagedFiles.length > 0 ? `${stagedFiles.length} Document(s)` : 'Assignment'}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isProcessing ? (
            <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p>Analyzing documents and optimizing assignments...</p>
            </div>
          ) : optimizationResult ? (
            <div>
              <h3 className="font-semibold text-xl mb-4 font-serif text-center">Assignment Results</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Identified Domain</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Lawyer's New Load</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {optimizationResult.assignments.map((result, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{result.fileName}</TableCell>
                        <TableCell className="capitalize">{result.docDomain.replace('_', ' ')}</TableCell>
                        <TableCell>{result.lawyerName}</TableCell>
                        <TableCell>{result.newLoad} documents</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             stagedFiles.length === 0 && <div className="text-center text-muted-foreground text-sm py-10">
                  <p>Upload documents to begin.</p>
              </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
