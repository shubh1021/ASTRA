
'use server';

export interface Lawyer {
  id: number;
  name: string;
  expertise: Set<string>;
  assigned_docs: number;
}

export interface Document {
  id: number;
  domain: string;
}

// Initial data, can be extended
let lawyers: Lawyer[] = [
    { id: 1, name: "Alice", expertise: new Set(["corporate", "tax"]), assigned_docs: 0 },
    { id: 2, name: "Bob", expertise: new Set(["ip", "litigation"]), assigned_docs: 0 },
    { id: 3, name: "Charlie", expertise: new Set(["family", "real_estate"]), assigned_docs: 0 },
    { id: 4, name: "Diana", expertise: new Set(["corporate", "litigation"]), assigned_docs: 0 },
    { id: 5, name: "Eve", expertise: new Set(["environment", "tax"]), assigned_docs: 0 },
    { id: 6, name: "Frank", expertise: new Set(["corporate", "family"]), assigned_docs: 0 },
];

export interface AssignmentResult {
    docDomain: string;
    lawyerName: string;
    newLoad: number;
}


// --- Single Document Assignment ---
function assignDocument(docDomain: string, currentLawyers: Lawyer[]): { lawyerId: number | null; updatedLawyers: Lawyer[] } {
    const eligible = currentLawyers.filter(lw => lw.expertise.has(docDomain));
    if (eligible.length === 0) {
        return { lawyerId: null, updatedLawyers: currentLawyers };
    }
    
    const minDocs = Math.min(...eligible.map(lw => lw.assigned_docs));
    const leastLoaded = eligible.filter(lw => lw.assigned_docs === minDocs);
    const chosen = leastLoaded[Math.floor(Math.random() * leastLoaded.length)];
    
    const updatedLawyers = currentLawyers.map(lw => 
        lw.id === chosen.id ? { ...lw, assigned_docs: lw.assigned_docs + 1 } : lw
    );

    return { lawyerId: chosen.id, updatedLawyers };
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
            return Math.floor(Math.random() * this.num_lawyers);
        });
    }

    private fitness(genome: number[]): number {
        const loads = this.lawyers.map(lw => lw.assigned_docs);
        let penalty = 0;
        genome.forEach((lw_idx, i) => {
            if (!this.allowed[i].includes(lw_idx)) {
                penalty += 1000;
            }
            loads[lw_idx] += 1;
        });
        return Math.max(...loads) + penalty;
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
                const [parent1, parent2] = [
                    popFitnessSorted[Math.floor(Math.random() * 20)].g,
                    popFitnessSorted[Math.floor(Math.random() * 20)].g
                ];
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
): Promise<{ results: AssignmentResult[]; finalLoads: Lawyer[] }> {
    // Reset lawyer loads for each run to ensure idempotency
    let currentLawyers: Lawyer[] = [
        { id: 1, name: "Alice", expertise: new Set(["corporate", "tax"]), assigned_docs: 0 },
        { id: 2, name: "Bob", expertise: new Set(["ip", "litigation"]), assigned_docs: 0 },
        { id: 3, name: "Charlie", expertise: new Set(["family", "real_estate"]), assigned_docs: 0 },
        { id: 4, name: "Diana", expertise: new Set(["corporate", "litigation"]), assigned_docs: 0 },
        { id: 5, name: "Eve", expertise: new Set(["environment", "tax"]), assigned_docs: 0 },
        { id: 6, name: "Frank", expertise: new Set(["corporate", "family"]), assigned_docs: 0 },
    ];
    
    const results: AssignmentResult[] = [];

    if (docList.length === 1) {
        const { lawyerId, updatedLawyers } = assignDocument(docList[0].domain, currentLawyers);
        currentLawyers = updatedLawyers;
        if (lawyerId !== null) {
            const lawyer = currentLawyers.find(l => l.id === lawyerId)!;
            results.push({
                docDomain: docList[0].domain,
                lawyerName: lawyer.name,
                newLoad: lawyer.assigned_docs,
            });
        }
    } else if (docList.length > 1) {
        const ga = new GAAssign(currentLawyers, docList);
        const bestAssignment = ga.run();
        
        for (let i = 0; i < bestAssignment.length; i++) {
            const doc = docList[i];
            const lawyerIndex = bestAssignment[i];
            const chosenLawyer = currentLawyers[lawyerIndex];

            if (chosenLawyer) {
                chosenLawyer.assigned_docs += 1;
                results.push({
                    docDomain: doc.domain,
                    lawyerName: chosenLawyer.name,
                    newLoad: chosenLawyer.assigned_docs,
                });
            }
        }
    }

    return { results, finalLoads: currentLawyers };
}
