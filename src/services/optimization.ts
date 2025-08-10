
'use server';

export interface Lawyer {
  id: number;
  name: string;
  expertise: Set<string>;
  assigned_docs: number;
}

export interface Document {
  id: number | string;
  domain: string;
}

export interface AssignmentResult {
    docId: number | string;
    docDomain: string;
    lawyerName: string;
    newLoad: number;
}


// In-memory state for lawyers. This will persist for the server's lifetime.
let lawyers: Lawyer[] = [
    { id: 1, name: "Alice", expertise: new Set(["corporate", "tax"]), assigned_docs: 0 },
    { id: 2, name: "Bob", expertise: new Set(["ip", "litigation"]), assigned_docs: 0 },
    { id: 3, name: "Charlie", expertise: new Set(["family", "real_estate"]), assigned_docs: 0 },
    { id: 4, name: "Diana", expertise: new Set(["corporate", "litigation"]), assigned_docs: 0 },
    { id: 5, name: "Eve", expertise: new Set(["environment", "tax"]), assigned_docs: 0 },
    { id: 6, name: "Frank", expertise: new Set(["corporate", "family"]), assigned_docs: 0 },
];

/**
 * Retrieves the current state of all lawyers.
 */
export async function getLawyers(): Promise<Lawyer[]> {
    // Return a deep copy to avoid direct mutation of the state from outside
    return JSON.parse(JSON.stringify(lawyers)).map((l: any) => ({...l, expertise: new Set(l.expertise)}));
}

/**
 * Resets all lawyer assignments to zero.
 */
export async function resetAssignments(): Promise<void> {
    lawyers.forEach(l => l.assigned_docs = 0);
}


// --- Single Document Assignment (Used within batch processing as a fallback) ---
function assignSingleDocument(doc: Document, currentLawyers: Lawyer[]): number | null {
    const eligible = currentLawyers.filter(lw => lw.expertise.has(doc.domain));
    if (eligible.length === 0) {
        return null;
    }
    
    const minDocs = Math.min(...eligible.map(lw => lw.assigned_docs));
    const leastLoaded = eligible.filter(lw => lw.assigned_docs === minDocs);
    const chosen = leastLoaded[Math.floor(Math.random() * leastLoaded.length)];
    
    return chosen.id;
}

// --- Genetic Algorithm for Batch Assignment ---
class GAAssign {
    private lawyers: Lawyer[];
    private docs: Document[];
    private num_docs: number;
    private num_lawyers: number;
    private allowed: number[][];
    private pop_size: number;
    private generations: number;
    private mutation_rate: number;

    constructor(lawyers: Lawyer[], docs: Document[], pop_size = 100, generations = 150, mutation_rate = 0.1) {
        this.lawyers = lawyers;
        this.docs = docs;
        this.num_docs = docs.length;
        this.num_lawyers = lawyers.length;
        this.allowed = docs.map(doc => 
            lawyers
                .map((lw, i) => (doc.domain && lw.expertise.has(doc.domain) ? i : -1))
                .filter(i => i !== -1)
        );
        this.pop_size = pop_size;
        this.generations = generations;
        this.mutation_rate = mutation_rate;
    }

    private randomGenome(): number[] {
        return this.docs.map((_, i) => {
            const allowedLawyers = this.allowed[i];
            if (allowedLawyers && allowedLawyers.length > 0) {
                return allowedLawyers[Math.floor(Math.random() * allowedLawyers.length)];
            }
            // Fallback for documents with no eligible lawyer
            return Math.floor(Math.random() * this.num_lawyers);
        });
    }

    private fitness(genome: number[]): number {
        const loads = this.lawyers.map(lw => lw.assigned_docs);
        let penalty = 0;
        genome.forEach((lw_idx, i) => {
            if (!this.allowed[i].includes(lw_idx)) {
                penalty += 1000; // Heavy penalty for assigning to a non-expert
            }
            loads[lw_idx] += 1;
        });
        const loadVariance = loads.reduce((acc, val) => acc + (val - (loads.reduce((s, v) => s + v, 0) / loads.length)) ** 2, 0) / loads.length;
        return Math.max(...loads) + loadVariance + penalty;
    }

    private mutate(genome: number[]): void {
        for (let i = 0; i < genome.length; i++) {
            if (Math.random() < this.mutation_rate) {
                const allowedLawyers = this.allowed[i];
                if (allowedLawyers && allowedLawyers.length > 0) {
                    genome[i] = allowedLawyers[Math.floor(Math.random() * allowedLawyers.length)];
                } else {
                    genome[i] = Math.floor(Math.random() * this.num_lawyers);
                }
            }
        }
    }

    run(): number[] {
        let pop = Array.from({ length: this.pop_size }, () => this.randomGenome());
        let fitnesses = pop.map(g => this.fitness(g));

        for (let gen = 0; gen < this.generations; gen++) {
            const new_pop: number[][] = [];
            const popFitnessSorted = pop.map((g, i) => ({ g, f: fitnesses[i] })).sort((a, b) => a.f - b.f);
            
            new_pop.push(popFitnessSorted[0].g); // Elitism

            while (new_pop.length < this.pop_size) {
                // Tournament selection
                const tournament = popFitnessSorted.slice(0, 20);
                const parent1 = tournament[Math.floor(Math.random() * tournament.length)].g;
                const parent2 = tournament[Math.floor(Math.random() * tournament.length)].g;

                const cut = Math.floor(Math.random() * (this.num_docs - 1)) + 1;
                const child = [...parent1.slice(0, cut), ...parent2.slice(cut)];
                this.mutate(child);
                new_pop.push(child);
            }
            pop = new_pop;
            fitnesses = pop.map(g => this.fitness(g));
        }

        const bestIndex = fitnesses.indexOf(Math.min(...fitnesses));
        return pop[bestIndex];
    }
}


// --- Main Processing Function ---
export async function processDocuments(
    docList: Document[]
): Promise<{ results: AssignmentResult[] }> {
    const results: AssignmentResult[] = [];
    
    // Create a deep copy of lawyers to simulate the assignments without modifying the actual state yet
    const simulationLawyers = JSON.parse(JSON.stringify(lawyers)).map((l: any) => ({...l, expertise: new Set(l.expertise)}));

    let finalAssignments: { docId: string | number, lawyerId: number }[] = [];

    if (docList.length === 1) {
        const doc = docList[0];
        const lawyerId = assignSingleDocument(doc, simulationLawyers);
        if (lawyerId !== null) {
            finalAssignments.push({ docId: doc.id, lawyerId });
        }
    } else if (docList.length > 1) {
        const ga = new GAAssign(simulationLawyers, docList);
        const bestAssignment = ga.run();
        
        bestAssignment.forEach((lawyerIndex, docIndex) => {
            const lawyer = simulationLawyers[lawyerIndex];
            finalAssignments.push({ docId: docList[docIndex].id, lawyerId: lawyer.id });
        });
    }

    // Now, apply the assignments to the actual stateful `lawyers` array
    finalAssignments.forEach(assignment => {
        const lawyerToUpdate = lawyers.find(l => l.id === assignment.lawyerId);
        const doc = docList.find(d => d.id === assignment.docId);

        if (lawyerToUpdate && doc) {
            lawyerToUpdate.assigned_docs += 1;
            results.push({
                docId: doc.id,
                docDomain: doc.domain,
                lawyerName: lawyerToUpdate.name,
                newLoad: lawyerToUpdate.assigned_docs,
            });
        }
    });


    return { results };
}
