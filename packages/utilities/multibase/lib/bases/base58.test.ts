import { expect, it } from 'bun:test';
import { fromBase58Btc, toBase58Btc } from './base58.js';

const inputs = [
	{
		text: `Decentralize everything!!`,
		encoded: `UXE7GvtEk8XTXs1GF8HSGbVA9FCX9SEBPe`,
	},
	{
		text: `yes mani !`,
		encoded: `7paNL19xttacUY`,
	},
	{
		text: `hello world`,
		encoded: `StV1DL6CwTryKyV`,
	},
	{
		text: `\x00yes mani !`,
		encoded: `17paNL19xttacUY`,
	},
	{
		text: `\x00\x00yes mani !`,
		encoded: `117paNL19xttacUY`,
	},
];

it('can encode', () => {
	const encoder = new TextEncoder();

	for (const { text, encoded } of inputs) {
		expect(toBase58Btc(encoder.encode(text))).toBe(encoded);
	}
});

it('can decode', () => {
	const decoder = new TextDecoder();

	for (const { text, encoded } of inputs) {
		expect(decoder.decode(fromBase58Btc(encoded))).toBe(text);
	}
});
