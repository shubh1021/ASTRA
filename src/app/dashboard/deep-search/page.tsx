
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { deepSearch, DeepSearchOutput } from '@/ai/flows/deep-search';
import { Loader2, Search, FileUp, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
        'image/*': ['.jpeg', '.png', '.gif', '.webp'],
        'text/plain': ['.txt'],
        'application/pdf': ['.pdf'],
    }
  });


  const handleSearch = async (searchQuery? : string) => {
    const currentQuery = typeof searchQuery === 'string' ? searchQuery : query;
    if (!currentQuery.trim() && !file) return;

    setIsSearching(true);
    setSearchResult(null);
    setError(null);

    try {
      const result = await deepSearch({ 
          query: currentQuery,
          documentDataUri: filePreview || undefined,
      });
      setSearchResult(result);
    } catch (e) {
      setError('DeepSearch failed. Please check your API keys and try again.');
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };
  
  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  }

  return (
    <main className="flex flex-col h-full bg-secondary p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-3">
            <Search className="h-6 w-6" />
            Intelligent DeepSearch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div {...getRootProps()} className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-primary' : 'border-border'}`}>
                <input {...getInputProps()} />
                <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">Drag & drop files here, or click to select files</p>
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
                placeholder="Enter your legal query..."
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


          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {searchResult && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 font-serif">Summary</h3>
                <p className="text-muted-foreground">{searchResult.summary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 font-serif">Key Points</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {searchResult.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 font-serif">Sources</h3>
                <div className="space-y-2">
                  {searchResult.sources.map((source, index) => (
                    <Card key={index} className="p-3 bg-secondary">
                      <Link href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                        {source.title}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
