import '@atcute/bluesky/lexicons';
import type { AppBskyRichtextFacet } from '@atcute/client/lexicons';

type UnwrapArray<T> = T extends (infer V)[] ? V : never;

export type Facet = AppBskyRichtextFacet.Main;
export type FacetFeature = UnwrapArray<Facet['features']>;

export interface RichtextSegment {
	text: string;
	features: FacetFeature[] | undefined;
}

const segment = (text: string, features: FacetFeature[] | undefined): RichtextSegment => {
	return { text: text, features: features };
};

export const segmentize = (text: string, facets: Facet[] | undefined): RichtextSegment[] => {
	if (facets === undefined || facets.length === 0) {
		return [segment(text, undefined)];
	}

	const segments: RichtextSegment[] = [];
	const utf16Length = text.length;

	let utf16Cursor = 0;
	let utf8Cursor = 0;

	const advanceCursor = (startUtf16: number, endUtf8: number): number => {
		let curs = startUtf16;

		while (utf8Cursor < endUtf8 && curs < utf16Length) {
			const code = text.codePointAt(curs)!;

			curs += code > 0xffff ? 2 : 1;
			utf8Cursor += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
		}

		return curs;
	};

	for (let idx = 0, len = facets.length; idx < len; idx++) {
		const facet = facets[idx];
		const { byteStart, byteEnd } = facet.index;

		const features = facet.features;

		if (byteStart > byteEnd || features.length === 0) {
			continue;
		}

		if (utf8Cursor < byteStart) {
			const nextUtf16Cursor = advanceCursor(utf16Cursor, byteStart);

			segments.push(segment(text.slice(utf16Cursor, nextUtf16Cursor), undefined));
			utf16Cursor = nextUtf16Cursor;
		}

		{
			const nextUtf16Cursor = advanceCursor(utf16Cursor, byteEnd);
			const subtext = text.slice(utf16Cursor, nextUtf16Cursor);

			segments.push(segment(subtext, subtext.trim() ? features : undefined));
			utf16Cursor = nextUtf16Cursor;
		}
	}

	if (utf16Cursor < utf16Length) {
		segments.push(segment(text.slice(utf16Cursor), undefined));
	}

	return segments;
};
