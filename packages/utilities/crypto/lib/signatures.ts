import { P256PublicKey } from './keypairs/p256.js';
import { Secp256k1PublicKey } from './keypairs/secp256k1.js';

import { parseDidKey, type FoundPublicKey } from './multibase.js';
import type { VerifyOptions } from './types.js';

export const verifySig = async (
	key: FoundPublicKey,
	sig: Uint8Array,
	data: Uint8Array,
	opts?: VerifyOptions,
) => {
	switch (key.type) {
		case 'p256': {
			const keypair = new P256PublicKey(key.publicKey);
			return await keypair.verify(sig, data, opts);
		}
		case 'secp256k1': {
			const keypair = new Secp256k1PublicKey(key.publicKey);
			return await keypair.verify(sig, data, opts);
		}
	}
};

export interface VerifyWithDidKeyOptions extends VerifyOptions {
	jwtAlg?: string;
}

export const verifySigWithDidKey = async (
	didKey: string,
	sig: Uint8Array,
	data: Uint8Array,
	opts?: VerifyWithDidKeyOptions,
): Promise<boolean> => {
	const found = parseDidKey(didKey);
	if (opts?.jwtAlg && opts.jwtAlg !== found.jwtAlg) {
		throw new Error(`expected ${opts.jwtAlg} as the jwt algorithm, got ${found.jwtAlg}`);
	}

	return await verifySig(found, sig, data, opts);
};
