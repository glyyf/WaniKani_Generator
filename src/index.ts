#!/usr/bin/env node

import 'dotenv/config';
import { WaniKaniApi } from './wanikani-api.js';
import { PracticeGenerator } from './practice-generator.js';
import { AiParagraphGenerator } from './ai-generator.js';
import { VocabularyCache } from './vocabulary-cache.js';
import fs from 'fs';
import path from 'path';

async function main() {
  const wanikaniApiKey = process.env.WANIKANI_API_KEY;
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  
  if (!wanikaniApiKey) {
    console.error('Error: WANIKANI_API_KEY environment variable is required');
    console.log('Create a .env file with: WANIKANI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const cache = new VocabularyCache();
  
  try {
    let vocabulary;
    
    if (cache.isStale()) {
      console.log('Cache is stale, fetching fresh vocabulary from WaniKani...');
      const api = new WaniKaniApi(wanikaniApiKey);
      vocabulary = await api.getLearnedVocabulary();
      cache.updateCache(vocabulary);
    } else {
      console.log('Using cached vocabulary...');
      vocabulary = cache.getCachedVocabulary();
    }
    
    const cacheInfo = cache.getCacheInfo();
    console.log(`Using ${vocabulary.length} vocabulary words (last updated: ${cacheInfo.lastUpdate ? new Date(cacheInfo.lastUpdate).toLocaleString() : 'never'})`);
    
    let paragraph;
    
    if (openrouterApiKey) {
      console.log('Generating short story with AI...');
      const aiGenerator = new AiParagraphGenerator(openrouterApiKey);
      const result = await aiGenerator.generateNaturalParagraph(vocabulary);
      const fullOutput = aiGenerator.createFullOutput(result.japanese, result.english, result.selectedWords);
      
      // Save to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `wanikani-story-${timestamp}.txt`;
      const filepath = path.join(process.cwd(), filename);
      
      fs.writeFileSync(filepath, fullOutput, 'utf8');
      console.log(`✓ Short story saved to: ${filename}`);
      
      // Also display in console
      console.log('\n--- Japanese Story ---');
      console.log(result.japanese);
      console.log('\n--- English Translation ---');
      console.log(result.english);
      console.log('\n--- Vocabulary Used ---');
      result.selectedWords.forEach(word => {
        const meanings = word.meanings.slice(0, 2).join(', ');
        const readings = word.readings.slice(0, 2).join(', ');
        console.log(`${word.characters} (${readings}) - ${meanings}`);
      });
      
    } else {
      console.log('Using basic generator (add OPENROUTER_API_KEY for better results)...');
      const generator = new PracticeGenerator(vocabulary);
      paragraph = generator.generatePracticeParagraph();
      
      console.log('\n--- Practice Paragraph ---');
      console.log(paragraph);
      console.log('--- End ---\n');
    }
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    cache.close();
  }
}

main();