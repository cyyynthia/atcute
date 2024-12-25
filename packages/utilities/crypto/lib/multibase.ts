import { fromBase58Btc } from '@atcute/multibase';

export type FoundPrivateKey =
	| { type: 'p256'; privateKey: Uint8Array }
	| { type: 'secp256k1'; privateKey: Uint8Array };

export type FoundPublicKey =
	| { type: 'p256'; jwtAlg: 'ES256'; publicKey: Uint8Array }
	| { type: 'secp256k1'; jwtAlg: 'ES256K'; publicKey: Uint8Array };

const extractMultibase = (key: string): Uint8Array => {
	if (key.length < 2 || key[0] !== 'z') {
		throw new Error(`not a multibase base58btc string`);
	}

	const bytes = fromBase58Btc(key.slice(1));

	return bytes;
};

export const parseDidKey = (key: string): FoundPublicKey => {
	if (!key.startsWith('did:key:')) {
		throw new Error(`not a did:key`);
	}

	return parsePublicMultikey(key.slice(8));
};

export const parsePublicMultikey = (key: string): FoundPublicKey => {
	const bytes = extractMultibase(key);
	if (bytes.length < 3) {
		throw new Error(`multibase key too short`);
	}

	const type = (bytes[0] << 8) | bytes[1];
	const publicKey = bytes.subarray(2);

	switch (type) {
		case 0x8024: {
			return { type: 'p256', jwtAlg: 'ES256', publicKey };
		}
		case 0xe701: {
			return { type: 'secp256k1', jwtAlg: 'ES256K', publicKey };
		}
	}

	throw new Error(`unsupported key type (0x${type.toString(16).padStart(4, '0')})`);
};

export const getPublicKeyFromDidController = (controller: {
	type: string;
	publicKeyMultibase: string;
}): FoundPublicKey => {
	const publicKeyMultibase = controller.publicKeyMultibase;

	switch (controller.type) {
		case 'Multikey': {
			return parsePublicMultikey(publicKeyMultibase);
		}
		case 'EcdsaSecp256r1VerificationKey2019': {
			return { type: 'p256', jwtAlg: 'ES256', publicKey: extractMultibase(publicKeyMultibase) };
		}
		case 'EcdsaSecp256k1VerificationKey2019': {
			return { type: 'secp256k1', jwtAlg: 'ES256K', publicKey: extractMultibase(publicKeyMultibase) };
		}
	}

	throw new Error(`unsupported type (${controller.type})`);
};

export const parsePrivateMultikey = (key: string): FoundPrivateKey => {
	const bytes = extractMultibase(key);
	if (bytes.length < 3) {
		throw new Error(`multibase key too short`);
	}

	const type = (bytes[0] << 8) | bytes[1];
	const privateKey = bytes.subarray(2);

	switch (type) {
		case 0x8626: {
			return { type: 'p256', privateKey };
		}
		case 0x8126: {
			return { type: 'secp256k1', privateKey };
		}
	}

	throw new Error(`unsupported key type (0x${type.toString(16).padStart(4, '0')})`);
};
