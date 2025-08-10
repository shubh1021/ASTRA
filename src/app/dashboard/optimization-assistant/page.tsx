
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Loader2, Zap } from 'lucide-react';
import { processDocuments, AssignmentResult, Lawyer as LawyerType } from '@/services/optimization';

interface DocumentInput {
    id: number;
    domain: string;
}

export default function OptimizationAssistantPage() {
    const [docs, setDocs] = useState<DocumentInput[]>([{ id: 1, domain: 'corporate' }]);
    const [nextId, setNextId] = useState(2);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<AssignmentResult[]>([]);
    const [finalLoads, setFinalLoads] = useState<LawyerType[]>([]);

    const handleAddDoc = () => {
        setDocs([...docs, { id: nextId, domain: '' }]);
        setNextId(nextId + 1);
    };

    const handleRemoveDoc = (id: number) => {
        setDocs(docs.filter(doc => doc.id !== id));
    };

    const handleDocChange = (id: number, domain: string) => {
        setDocs(docs.map(doc => (doc.id === id ? { ...doc, domain } : doc)));
    };

    const handleProcess = async () => {
        setIsLoading(true);
        setResults([]);
        setFinalLoads([]);
        
        const documentsToProcess = docs
            .filter(d => d.domain.trim() !== '')
            .map(d => ({ id: d.id, domain: d.domain.toLowerCase() }));

        if (documentsToProcess.length === 0) {
            setIsLoading(false);
            return;
        }

        const { results: newResults, finalLoads: newFinalLoads } = await processDocuments(documentsToProcess);
        
        setResults(newResults);
        setFinalLoads(newFinalLoads);
        setIsLoading(false);
    };

    return (
        <main className="flex flex-col h-full bg-secondary p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-serif text-2xl flex items-center gap-3">
                            <Zap className="h-6 w-6" />
                            Optimization Assistant
                        </CardTitle>
                        <CardDescription>
                            Add documents and their legal domains, then click process to assign them to the best-suited lawyers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mb-6">
                            {docs.map((doc, index) => (
                                <div key={doc.id} className="flex items-center gap-2">
                                    <Input
                                        placeholder={`e.g., corporate, ip, tax`}
                                        value={doc.domain}
                                        onChange={(e) => handleDocChange(doc.id, e.target.value)}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveDoc(doc.id)} disabled={docs.length <= 1}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={handleAddDoc}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Document
                            </Button>
                            <Button onClick={handleProcess} disabled={isLoading || docs.every(d => d.domain.trim() === '')}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Process Documents"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-serif text-xl">Assignment Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {results.length > 0 && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Assignments</h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Document Domain</TableHead>
                                                <TableHead>Assigned To</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.map((res, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="capitalize">{res.docDomain}</TableCell>
                                                    <TableCell>{res.lawyerName}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Final Lawyer Loads</h3>
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Lawyer</TableHead>
                                                <TableHead>Total Documents</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {finalLoads.map((lawyer) => (
                                                <TableRow key={lawyer.id}>
                                                    <TableCell>{lawyer.name}</TableCell>
                                                    <TableCell>{lawyer.assigned_docs}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                        {!isLoading && results.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">
                                <p>Results will be displayed here after processing.</p>
                            </div>
                        )}
                         {isLoading && (
                            <div className="text-center text-muted-foreground py-10 flex justify-center">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
