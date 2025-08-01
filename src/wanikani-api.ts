export interface VocabularyItem {
  id: number;
  characters: string;
  meanings: string[];
  readings: string[];
  level: number;
}

export class WaniKaniApi {
  private readonly baseUrl = 'https://api.wanikani.com/v2';
  private readonly headers: Record<string, string>;

  constructor(apiKey: string) {
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Wanikani-Revision': '20170710'
    };
  }

  async getLearnedVocabulary(): Promise<VocabularyItem[]> {
    const vocabulary: VocabularyItem[] = [];
    let nextUrl: string | null = `${this.baseUrl}/subjects?types=vocabulary`;

    while (nextUrl) {
      const response = await fetch(nextUrl, { headers: this.headers });
      
      if (!response.ok) {
        throw new Error(`WaniKani API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      for (const item of data.data) {
        if (item.data.characters) {
          vocabulary.push({
            id: item.id,
            characters: item.data.characters,
            meanings: item.data.meanings.map((m: any) => m.meaning),
            readings: item.data.readings.map((r: any) => r.reading),
            level: item.data.level
          });
        }
      }

      nextUrl = data.pages?.next_url || null;
      
      // Rate limiting: WaniKani allows 60 requests per minute
      await new Promise(resolve => setTimeout(resolve, 1100));
    }

    return this.filterLearnedItems(vocabulary);
  }

  private async filterLearnedItems(vocabulary: VocabularyItem[]): Promise<VocabularyItem[]> {
    console.log('Filtering to only passed vocabulary items...');
    const learnedIds = new Set<number>();
    
    // Split into chunks to avoid URL length limits
    const chunkSize = 100;
    for (let i = 0; i < vocabulary.length; i += chunkSize) {
      const chunk = vocabulary.slice(i, i + chunkSize);
      const subjectIds = chunk.map(v => v.id).join(',');
      
      let nextUrl: string | null = `${this.baseUrl}/assignments?subject_ids=${subjectIds}&passed=true`;
      
      while (nextUrl) {
        const response = await fetch(nextUrl, { headers: this.headers });
        
        if (!response.ok) {
          console.warn(`Assignment API error: ${response.status} ${response.statusText}`);
          console.warn('Returning all vocabulary instead of filtering');
          return vocabulary;
        }

        const assignmentsData = await response.json();
        
        for (const assignment of assignmentsData.data) {
          learnedIds.add(assignment.data.subject_id);
        }
        
        nextUrl = assignmentsData.pages?.next_url || null;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1100));
      }
      
      // Rate limiting between chunks
      if (i + chunkSize < vocabulary.length) {
        await new Promise(resolve => setTimeout(resolve, 1100));
      }
    }
    
    const filteredVocabulary = vocabulary.filter(v => learnedIds.has(v.id));
    console.log(`Filtered to ${filteredVocabulary.length} passed items from ${vocabulary.length} total`);
    
    return filteredVocabulary;
  }
}