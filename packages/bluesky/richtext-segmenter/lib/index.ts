import '@atcute/bluesky/lexicons';
import type { AppBskyRichtextFacet } from '@atcute/client/lexicons';

type UnwrapArray<T> = T extends (infer V)[] ? V : never;

export type Facet = AppBskyRichtextFacet.Main;
export type FacetFeature = UnwrapArray<Facet['features']>;

export interface RichtextSegment {
	text: string;
	features: FacetFeature[] | undefined;
}

const getUtf8Size = (str: string, index: number): number => {
	const code = str.codePointAt(index)!;

	if (code <= 0x7f) {
		return 1;
	} else if (code <= 0x7ff) {
		return 2;
	} else if (code <= 0xffff) {
		return 3;
	} else {
		return 4;
	}
};

const getUtf8To16Mapping = (str: string): number[] => {
	const map: number[] = [];
	const len = str.length;

	let u16pos = 0;

	while (u16pos < len) {
		const code = str.codePointAt(u16pos)!;

		for (let i = getUtf8Size(str, u16pos); i--; ) {
			map.push(u16pos);
		}

		u16pos += code > 0xffff ? 2 : 1;
	}

	return map;
};

const segment = (text: string, features: FacetFeature[] | undefined): RichtextSegment => {
	return { text: text, features: features };
};

export const segmentize = (text: string, facets: Facet[] | undefined): RichtextSegment[] => {
	if (facets === undefined || facets.length === 0) {
		return [segment(text, undefined)];
	}

	const map = getUtf8To16Mapping(text);
	const length = map.length;

	const segments: RichtextSegment[] = [];

	const facetsLength = facets.length;

	let textCursor = 0;
	let facetCursor = 0;

	do {
		const facet = facets[facetCursor];
		const { byteStart, byteEnd } = facet.index;

		if (textCursor < byteStart) {
			const subtext = text.slice(map[textCursor], map[byteStart]);

			segments.push(segment(subtext, undefined));
		} else if (textCursor > byteStart) {
			facetCursor++;
			continue;
		}

		if (byteStart < byteEnd) {
			const subtext = text.slice(map[byteStart], map[byteEnd]);
			const features = facet.features;

			if (features.length === 0 || subtext.trim().length === 0) {
				segments.push(segment(subtext, undefined));
			} else {
				segments.push(segment(subtext, features));
			}
		}

		textCursor = byteEnd;
		facetCursor++;
	} while (facetCursor < facetsLength);

	if (textCursor < length) {
		const subtext = text.slice(map[textCursor]);

		segments.push(segment(subtext, undefined));
	}

	return segments;
};
