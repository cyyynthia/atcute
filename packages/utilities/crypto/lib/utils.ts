export const toSha256 = async (input: Uint8Array): Promise<Uint8Array> => {
	const digest = await crypto.subtle.digest('SHA-256', input);
	return new Uint8Array(digest);
};

export const concatBuffers = (bufs: Uint8Array[]): Uint8Array => {
	let length = 0;
	let offset = 0;

	let il = bufs.length;
	let i: number;

	for (i = 0; i < il; i++) {
		const buf = bufs[i];

		length += buf.length;
	}

	const bytes = new Uint8Array(length);

	for (i = 0; i < il; i++) {
		const buf = bufs[i];

		bytes.set(buf, offset);
		offset += buf.length;
	}

	return bytes;
};

export const isBufferEqual = (a: Uint8Array, b: Uint8Array): boolean => {
	let len: number;

	if ((len = a.length) === b.length) {
		while (len--) {
			if (a[len] !== b[len]) {
				return false;
			}
		}
	}

	return len === -1;
};
