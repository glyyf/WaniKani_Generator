# WaniKani Practice Story Generator

A CLI tool that generates engaging Japanese practice stories using your learned WaniKani vocabulary. The tool fetches your passed vocabulary items from the WaniKani API and uses AI to create natural, grammatically correct Japanese short stories with English translations.

## Features

- **Vocabulary Caching**: Fetches your WaniKani vocabulary once per day and caches it in SQLite for fast access
- **Smart Filtering**: Only uses vocabulary you've actually passed on WaniKani for relevant practice
- **AI-Generated Stories**: Creates 3-4 paragraph short stories with proper Japanese grammar and sentence structure
- **Balanced Word Selection**: Intelligently selects a mix of verbs, nouns, and adjectives for natural storytelling
- **English Translation**: Provides AI-generated English translations for reference
- **File Output**: Saves timestamped practice sessions to text files for later review
- **Instant Feedback**: Displays stories in the console with vocabulary hints

## Requirements

- Node.js 18+ and npm
- A [WaniKani API key](https://www.wanikani.com/settings/personal_access_tokens)
- An [OpenRouter API key](https://openrouter.ai/keys) for AI story generation

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd WaniKani_Generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables by copying the example file:
```bash
cp .env.example .env
```

4. Edit the `.env` file and add your API keys:
```
WANIKANI_API_KEY=your_wanikani_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## Usage

Generate a new practice story:
```bash
npm start
```

The tool will:
1. Check if your vocabulary cache needs updating (refreshes daily)
2. Fetch your passed vocabulary from WaniKani if needed
3. Select ~20 balanced vocabulary words for the story
4. Generate a natural Japanese short story using AI
5. Provide an English translation
6. Save the complete session to a timestamped file
7. Display the story in your terminal

### Sample Output

```
Using cached vocabulary...
Using 509 vocabulary words (last updated: 8/1/2025, 2:50:08 PM)
Generating short story with AI...
Selected 12 words for AI generation: 向く, 気に入る, 申す, 引く...
✓ Short story saved to: wanikani-story-2025-08-01T20-12-34-354Z.txt

--- Japanese Story ---
昨日、私は友達の家に行きました。友達は四十歳の人で、赤い丸い皿においしい料理を盛り付けてくれました...

--- English Translation ---
Yesterday, I went to my friend's house. My friend is in their forties and served delicious food on a red round plate...

--- Vocabulary Used ---
向く (むく) - To Turn Toward, To Face
気に入る (きにいる) - To Take A Liking, To Be Pleased
...
```

## How It Works

### 1. Vocabulary Management
- Uses the WaniKani API v2 to fetch all vocabulary subjects
- Filters only items you've passed using the assignments endpoint
- Caches results in a local SQLite database (`vocabulary.db`)
- Refreshes cache automatically after 24 hours

### 2. Smart Word Selection
The tool categorizes vocabulary by type:
- **Verbs**: Words ending in る, う, く, etc. or with "to" in meanings
- **Nouns**: Everything else that's not a verb or adjective  
- **Adjectives**: Words ending in い (excluding ない endings)

For each story, it selects:
- ~35% verbs (6 words)
- ~45% nouns (10 words) 
- ~20% adjectives (4 words)

### 3. AI Story Generation
- Uses OpenRouter's GPT-4o-mini model for cost-effective, high-quality generation
- Prompts the AI to create coherent 3-4 paragraph stories incorporating the vocabulary
- Ensures proper Japanese grammar, natural sentence flow, and engaging narratives
- Generates separate English translations for comprehension support

### 4. File Management
- Saves each session as `wanikani-story-YYYY-MM-DDTHH-MM-SS.txt`
- Includes Japanese text, English translation, and vocabulary reference
- Files are automatically ignored by git for privacy

## License

This project is licensed under the ISC License.

## Contributing

Feel free to submit issues and enhancement requests!

## Acknowledgments

- [WaniKani](https://www.wanikani.com/) for the excellent Japanese learning platform and API
- [OpenRouter](https://openrouter.ai/) for providing AI model access