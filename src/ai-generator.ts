import { OpenAI } from "openai";
import { VocabularyItem } from "./wanikani-api.js";

export class AiParagraphGenerator {
	private openai: OpenAI;

	constructor(apiKey: string) {
		this.openai = new OpenAI({
			baseURL: "https://openrouter.ai/api/v1",
			apiKey: apiKey,
		});
	}

	async generateNaturalParagraph(
		vocabulary: VocabularyItem[],
		wordCount: number = 12
	): Promise<{
		japanese: string;
		english: string;
		selectedWords: VocabularyItem[];
	}> {
		const selectedWords = this.selectBalancedWords(vocabulary, wordCount);
		console.log(
			`Selected ${selectedWords.length} words for AI generation:`,
			selectedWords.map((w) => w.characters).join(", ")
		);
		const vocabularyList = selectedWords
			.map(
				(word) =>
					`${word.characters} (${word.readings[0]} - ${word.meanings
						.slice(0, 2)
						.join(", ")})`
			)
			.join("\n");

		const prompt = `Create a natural, grammatically correct Japanese short story, with several paragraphs, using the vocabulary words provided below. Requirements:

1. Use natural Japanese sentence structure (Subject-Object-Verb)
2. Try to use most or all of the provided vocabulary words
3. Write 2-3 paragraphs that form a coherent story or scene
4. Use appropriate particles (は, が, を, に, で, から, まで, etc.)
5. Conjugate verbs properly (present, past, polite forms as needed)
6. Make it readable and meaningful
7. You may add common particles, conjunctions, and basic grammar words as needed

Vocabulary words to incorporate:
${vocabularyList}

Please write a natural Japanese short story that tells a simple story using these words. Respond with ONLY the Japanese text.`;

		try {
			const completion = await this.openai.chat.completions.create({
				model: "openai/gpt-4o-mini",
				messages: [
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.7,
				max_tokens: 500,
			});

			const japanese = completion.choices[0]?.message?.content?.trim();

			if (!japanese) {
				throw new Error("No text generated from AI");
			}

			// Get English translation
			const english = await this.translateToEnglish(japanese);

			return { japanese, english, selectedWords };
		} catch (error) {
			console.error("AI generation failed:", error);
			throw new Error("Failed to generate natural paragraph with AI");
		}
	}

	private async translateToEnglish(japaneseText: string): Promise<string> {
		try {
			const completion = await this.openai.chat.completions.create({
				model: "openai/gpt-4o-mini",
				messages: [
					{
						role: "user",
						content: `Translate this Japanese text to natural English:\n\n${japaneseText}\n\nProvide only the English translation, no explanations.`,
					},
				],
				temperature: 0.3,
				max_tokens: 150,
			});

			return (
				completion.choices[0]?.message?.content?.trim() || "Translation failed"
			);
		} catch (error) {
			console.error("Translation failed:", error);
			return "Translation unavailable";
		}
	}

	private selectBalancedWords(
		vocabulary: VocabularyItem[],
		count: number
	): VocabularyItem[] {
		// Separate vocabulary by type for better balance
		const verbs = vocabulary.filter((w) => this.isVerb(w));
		const nouns = vocabulary.filter((w) => this.isNoun(w));
		const adjectives = vocabulary.filter((w) => this.isAdjective(w));
		const others = vocabulary.filter(
			(w) => !this.isVerb(w) && !this.isNoun(w) && !this.isAdjective(w)
		);

		const selected: VocabularyItem[] = [];

		// Try to get a good mix for natural stories (adjusted ratios for longer content)
		const verbCount = Math.min(6, Math.floor(count * 0.35), verbs.length);
		const nounCount = Math.min(10, Math.floor(count * 0.45), nouns.length);
		const adjCount = Math.min(4, Math.floor(count * 0.2), adjectives.length);

		// Add random selections from each category
		selected.push(...this.getRandomItems(verbs, verbCount));
		selected.push(...this.getRandomItems(nouns, nounCount));
		selected.push(...this.getRandomItems(adjectives, adjCount));

		// Fill remaining slots with any vocabulary
		const remaining = count - selected.length;
		if (remaining > 0) {
			const available = vocabulary.filter((w) => !selected.includes(w));
			selected.push(...this.getRandomItems(available, remaining));
		}

		return selected.slice(0, count);
	}

	private getRandomItems<T>(array: T[], count: number): T[] {
		const shuffled = [...array].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, count);
	}

	private isVerb(word: VocabularyItem): boolean {
		return word.meanings.some(
			(meaning) =>
				meaning.toLowerCase().includes("to ") ||
				word.characters.endsWith("る") ||
				word.characters.endsWith("う") ||
				word.characters.endsWith("く") ||
				word.characters.endsWith("ぐ") ||
				word.characters.endsWith("す") ||
				word.characters.endsWith("つ") ||
				word.characters.endsWith("ぬ") ||
				word.characters.endsWith("ぶ") ||
				word.characters.endsWith("む")
		);
	}

	private isNoun(word: VocabularyItem): boolean {
		return !this.isVerb(word) && !this.isAdjective(word);
	}

	private isAdjective(word: VocabularyItem): boolean {
		return (
			word.characters.endsWith("い") &&
			word.characters.length > 1 &&
			!word.characters.endsWith("ない") &&
			!this.isVerb(word)
		);
	}

	createFullOutput(
		japanese: string,
		english: string,
		selectedWords: VocabularyItem[]
	): string {
		const timestamp = new Date().toLocaleString();

		let result = `WaniKani Short Story Practice - ${timestamp}\n`;
		result += "=".repeat(60) + "\n\n";

		result += "--- Japanese Story ---\n";
		result += japanese + "\n\n";

		result += "--- English Translation ---\n";
		result += english + "\n\n";

		result += "--- Vocabulary Used ---\n";
		for (const word of selectedWords) {
			const meanings = word.meanings.slice(0, 2).join(", ");
			const readings = word.readings.slice(0, 2).join(", ");
			result += `${word.characters} (${readings}) - ${meanings}\n`;
		}

		return result;
	}
}
