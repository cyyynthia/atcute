import { createRfc4648Decode, createRfc4648Encode } from '../utils.js';

const HAS_UINT8_BASE16_SUPPORT = 'fromHex' in Uint8Array;

const BASE16_CHARSET = '0123456789abcdef';
const UPPER_RE = /[A-F]/;

export const fromBase16 = !HAS_UINT8_BASE16_SUPPORT
	? /*#__PURE__*/ createRfc4648Decode(BASE16_CHARSET, 4, false)
	: (str: string): Uint8Array => {
			if (UPPER_RE.test(str)) {
				throw new SyntaxError(`unexpected uppercase characters in base16 string`);
			}

			return Uint8Array.fromHex(str);
		};

export const toBase16 = !HAS_UINT8_BASE16_SUPPORT
	? /*#__PURE__*/ createRfc4648Encode(BASE16_CHARSET, 4, false)
	: (bytes: Uint8Array): string => {
			return bytes.toHex();
		};
