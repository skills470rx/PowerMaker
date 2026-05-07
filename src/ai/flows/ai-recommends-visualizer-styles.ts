'use server';
/**
 * @fileOverview An AI agent that analyzes audio characteristics and recommends suitable visualizer templates or styling parameters.
 *
 * - recommendVisualizerStyles - A function that handles the visualizer style recommendation process.
 * - RecommendVisualizerStylesInput - The input type for the recommendVisualizerStyles function.
 * - RecommendVisualizerStylesOutput - The return type for the recommendVisualizerStyles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendVisualizerStylesInputSchema = z.object({
  audioCharacteristics: z
    .string()
    .describe(
      'A string describing the audio characteristics, such as tempo, mood, and genre. Example: "tempo: 120bpm, mood: energetic, genre: EDM"'
    ),
  preferredTemplates: z
    .array(z.string())
    .optional()
    .describe('Optional array of user-preferred templates or styles.'),
});
export type RecommendVisualizerStylesInput = z.infer<
  typeof RecommendVisualizerStylesInputSchema
>;

const RecommendVisualizerStylesOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        templateName: z
          .string()
          .describe('The name of the recommended visualizer template.'),
        reason: z
          .string()
          .describe(
            'A brief explanation why this template is suitable for the given audio characteristics.'
          ),
      })
    )
    .describe(
      'A list of recommended visualizer templates and reasons for the recommendation.'
    ),
});
export type RecommendVisualizerStylesOutput = z.infer<
  typeof RecommendVisualizerStylesOutputSchema
>;

export async function recommendVisualizerStyles(
  input: RecommendVisualizerStylesInput
): Promise<RecommendVisualizerStylesOutput> {
  return recommendVisualizerStylesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendVisualizerStylesPrompt',
  input: {schema: RecommendVisualizerStylesInputSchema},
  output: {schema: RecommendVisualizerStylesOutputSchema},
  prompt: `You are an AI assistant specialized in recommending music visualizer styles. Given the audio characteristics and a list of available templates, suggest the most suitable ones. Focus on matching the mood, tempo, and genre.

Available templates: 
- edm-circle: Energetic, geometric, vibrant, suitable for electronic dance music.
- chill-player: Calm, minimalist, smooth, suitable for lo-fi, ambient, or chill-hop.
- anime-style: Dynamic, expressive, colorful, suitable for J-pop, anime soundtracks, or energetic vocal tracks.
- neon-wave: Retro, glowing, futuristic, suitable for synthwave, retrowave, or cyberpunk themes.

Audio Characteristics: {{{audioCharacteristics}}}

{{#if preferredTemplates}}
User Preferred Templates/Styles: {{{preferredTemplates}}}
{{/if}}

Based on the audio characteristics, recommend 2-3 visualizer templates or styling parameters from the available options. Provide a brief reason for each recommendation. The response must be in JSON format matching the output schema.`,
});

const recommendVisualizerStylesFlow = ai.defineFlow(
  {
    name: 'recommendVisualizerStylesFlow',
    inputSchema: RecommendVisualizerStylesInputSchema,
    outputSchema: RecommendVisualizerStylesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
