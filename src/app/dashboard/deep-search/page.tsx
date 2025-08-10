
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { deepSearch, DeepSearchOutput } from '@/ai/flows/deep-search';
import { Loader2, Search, FileUp, X, File as FileIcon, Link as LinkIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function DeepSearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<DeepSearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    const searchQuery = localStorage.getItem('deepSearchQuery');
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
      localStorage.removeItem('deepSearchQuery');
    }
  }, []);

  const handleSearch = async (searchQuery?: string, searchFilePreview?: string) => {
    const currentQuery = typeof searchQuery === 'string' ? searchQuery : query;
    const currentFile = searchFilePreview || filePreview;

    if (!currentQuery.trim() && !currentFile) {
      setError('A search query or a file is required to perform a DeepSearch.');
      return;
    }

    setIsSearching(true);
    setSearchResult(null);
    setError(null);

    try {
      const result = await deepSearch({
        query: currentQuery.trim() || 'Analyze the provided document.',
        documentDataUri: currentFile || undefined,
      });
      setSearchResult(result);
    } catch (e) {
      setError('DeepSearch failed. Please check your API keys and try again.');
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
        setFile(uploadedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUri = reader.result as string;
            setFilePreview(dataUri);
            // Automatically trigger search when file is uploaded
            handleSearch(query, dataUri); 
        };
        reader.readAsDataURL(uploadedFile);
    }
  }, [query]); // Re-create onDrop if query changes

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
        'image/*': ['.jpeg', '.png', '.gif', '.webp'],
        'text/plain': ['.txt'],
        'application/pdf': ['.pdf'],
    }
  });


  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    // Optionally clear results when file is removed
    // setSearchResult(null); 
    setError(null);
  }

  return (
    <main className="flex flex-col h-full bg-secondary p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-3">
            <Search className="h-6 w-6" />
            Intelligent DeepSearch
          </CardTitle>
          <CardDescription>
            Find relevant legal clauses from across the web. Upload a document for context or enter a query to begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div {...getRootProps()} className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <input {...getInputProps()} />
                <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">Drag & drop a file to automatically analyze, or enter a query below.</p>
                <p className="text-xs text-muted-foreground mt-1">Images, PDF, or .txt files supported</p>
            </div>

            {filePreview && (
                <div className="relative p-2 border rounded-lg flex items-center gap-3">
                    {file?.type.startsWith('image/') ? (
                        <Image src={filePreview} alt="Preview" width={48} height={48} className="rounded-md object-cover"/>
                    ) : (
                        <FileIcon className="h-8 w-8 text-muted-foreground"/>
                    )}
                    <div className="text-sm">
                        <p className="font-medium">{file?.name}</p>
                        <p className="text-muted-foreground text-xs">{Math.round((file?.size || 0) / 1024)} KB</p>
                    </div>
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={removeFile}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            
            <div className="flex gap-2">
                <Input
                type="text"
                placeholder="Enter a legal topic to find related clauses..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-base"
                />
                <Button onClick={() => handleSearch()} disabled={isSearching} size="lg">
                {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Search className="h-5 w-5" />
                )}
                <span className="ml-2 hidden md:inline">Search</span>
                </Button>
            </div>
          </div>


          {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isSearching && (
             <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-serif">Performing DeepSearch for related clauses...</p>
            </div>
          )}

          {searchResult && (
            <div className="space-y-6 mt-6">
              <h3 className="font-semibold text-xl mb-2 font-serif">Discovered Clauses</h3>
              {searchResult.relatedClauses.length > 0 ? (
                <div className="space-y-4">
                  {searchResult.relatedClauses.map((clause, index) => (
                    <Card key={index} className="p-4 bg-secondary">
                      <blockquote className="border-l-4 border-primary pl-4 mb-3">
                        <p className="text-sm italic">"{clause.clauseText}"</p>
                      </blockquote>
                      <p className="text-xs text-muted-foreground mb-3"><strong className="text-foreground font-medium">Relevance:</strong> {clause.relevance}</p>
                      <div className="flex items-center gap-2 text-xs">
                          <LinkIcon className="h-3 w-3 text-primary"/>
                          <Link href={clause.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium truncate">
                            {clause.sourceTitle}
                          </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                    <FileText className="h-10 w-10 text-primary/50" />
                    <p className="font-serif">No relevant clauses found.</p>
                    <p className="text-sm">Try refining your search query or uploading a different document.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
