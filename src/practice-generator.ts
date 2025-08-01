import { VocabularyItem } from './wanikani-api.js';

export class PracticeGenerator {
  private vocabulary: VocabularyItem[];

  constructor(vocabulary: VocabularyItem[]) {
    this.vocabulary = vocabulary;
  }

  generatePracticeParagraph(wordCount: number = 20): string {
    if (this.vocabulary.length === 0) {
      return 'No vocabulary words available for practice.';
    }

    const selectedWords = this.selectRandomWords(wordCount);
    return this.createNaturalParagraph(selectedWords);
  }

  private selectRandomWords(count: number): VocabularyItem[] {
    const shuffled = [...this.vocabulary].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, this.vocabulary.length));
  }

  private createNaturalParagraph(words: VocabularyItem[]): string {
    // Simple approach: create sentences using the vocabulary
    const sentences: string[] = [];
    let currentSentence: string[] = [];

    for (const word of words) {
      currentSentence.push(word.characters);
      
      // Create sentence every 3-5 words
      if (currentSentence.length >= 3 && Math.random() > 0.3) {
        sentences.push(this.completeSentence(currentSentence));
        currentSentence = [];
      }
    }

    // Add any remaining words as a final sentence
    if (currentSentence.length > 0) {
      sentences.push(this.completeSentence(currentSentence));
    }

    const paragraph = sentences.join('');
    return this.addReadingHints(paragraph, words);
  }

  private completeSentence(words: string[]): string {
    // Simple sentence connectors and endings
    const connectors = ['は', 'が', 'を', 'に', 'で', 'と', 'の'];
    const endings = ['です。', 'でした。', 'ます。', 'ました。', 'だった。'];
    
    let sentence = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const connector = connectors[Math.floor(Math.random() * connectors.length)];
      sentence += connector + words[i];
    }
    
    const ending = endings[Math.floor(Math.random() * endings.length)];
    sentence += ending;
    
    return sentence;
  }

  private addReadingHints(paragraph: string, words: VocabularyItem[]): string {
    let result = paragraph + '\n\n--- Vocabulary Hints ---\n';
    
    for (const word of words) {
      const meanings = word.meanings.slice(0, 2).join(', ');
      const readings = word.readings.slice(0, 2).join(', ');
      result += `${word.characters} (${readings}) - ${meanings}\n`;
    }
    
    return result;
  }
}