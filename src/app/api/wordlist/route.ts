import fs from 'fs';
import { NextRequest } from 'next/server';

const rollDice = () => Math.floor(Math.random() * 6) + 1;
const getWordByRoll = (roll: string) => {
  const lines = fs.readFileSync('src/assets/eff_large_wordlist.txt', 'utf-8').split('\n');
  for (const line of lines) {
    const [key, word] = line.split(/\s+/);
    if (key === roll) return word;
  }
  return null;
};

/**
 * Returns the EEF's long word list based on the provided `rolls` query parameter.
 * If the `roll` parameter is not provided, one will be generated randomly.
 *
 * @param req The incoming NextRequest object containing the request details.
 * @returns A JSON response containing the long word list corresponding to the provided or generated roll.
 * @param req
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const wordCount = parseInt(searchParams.get('count') ?? '5', 10);
  if (isNaN(wordCount) || wordCount <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid count parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    const rolls = `${rollDice()}${rollDice()}${rollDice()}${rollDice()}${rollDice()}`;
    const word = getWordByRoll(rolls);
    if (word) {
      words.push(word);
    } else {
      return new Response(JSON.stringify({ error: `No word found for roll: ${rolls}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  return new Response(JSON.stringify({ words }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
