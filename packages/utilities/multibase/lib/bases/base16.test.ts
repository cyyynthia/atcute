import { expect, it } from 'bun:test';

import { _fromBase16Polyfill, _toBase16Polyfill } from './base16.js';

const inputs = [
	{
		text: `Decentralize everything!!`,
		encoded: `446563656e7472616c697a652065766572797468696e672121`,
	},
	{
		text: `yes mani !`,
		encoded: `796573206d616e692021`,
	},
	{
		text: `hello world`,
		encoded: `68656c6c6f20776f726c64`,
	},
	{
		text: `\x00yes mani !`,
		encoded: `00796573206d616e692021`,
	},
	{
		text: `\x00\x00yes mani !`,
		encoded: `0000796573206d616e692021`,
	},
];

it('can encode', () => {
	const encoder = new TextEncoder();

	for (const { text, encoded } of inputs) {
		expect(_toBase16Polyfill(encoder.encode(text))).toBe(encoded);
	}
});

it('can decode', () => {
	const decoder = new TextDecoder();

	for (const { text, encoded } of inputs) {
		expect(decoder.decode(_fromBase16Polyfill(encoded))).toBe(text);
	}
});
