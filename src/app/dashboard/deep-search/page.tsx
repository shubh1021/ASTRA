
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { deepSearch, DeepSearchOutput } from '@/ai/flows/deep-search';
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';

export default function DeepSearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<DeepSearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchQuery = localStorage.getItem('deepSearchQuery');
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
      localStorage.removeItem('deepSearchQuery');
    }
  }, []);

  const handleSearch = async (searchQuery? : string) => {
    const currentQuery = typeof searchQuery === 'string' ? searchQuery : query;
    if (!currentQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    setError(null);

    try {
      const result = await deepSearch({ query: currentQuery });
      setSearchResult(result);
    } catch (e) {
      setError('DeepSearch failed. Please check your API keys and try again.');
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

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
          <div className="flex gap-2 mb-6">
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
