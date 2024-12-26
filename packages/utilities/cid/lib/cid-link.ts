import { toBase32 } from '@atcute/multibase';

import { decode, fromString, type Cid } from './codec.js';

export interface CidLink {
	$link: string;
}

export class CidLinkWrapper implements CidLink {
	constructor(public bytes: Uint8Array) {}

	get $link(): string {
		const encoded = toBase32(this.bytes);
		return `b${encoded}`;
	}

	toJSON(): CidLink {
		return { $link: this.$link };
	}
}

export const isCidLink = (value: unknown): value is CidLink => {
	const val = value as any;

	return (
		val instanceof CidLinkWrapper ||
		(val !== null && typeof val === 'object' && typeof val.$link === 'string')
	);
};

export const toCidLink = (cid: Cid): CidLink => {
	return new CidLinkWrapper(cid.bytes);
};

export const fromCidLink = (link: CidLink): Cid => {
	if (link instanceof CidLinkWrapper) {
		return decode(link.bytes);
	}

	return fromString(link.$link);
};
