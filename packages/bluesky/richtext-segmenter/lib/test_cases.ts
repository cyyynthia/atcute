import '@atcute/bluesky/lexicons';
import type { AppBskyRichtextFacet } from '@atcute/client/lexicons';

interface TestCase {
	name: string;
	text: string;
	facets: AppBskyRichtextFacet.Main[];
}

export const TEST_CASES: TestCase[] = [
	{
		name: 'Butterfly effect',
		text: 'The butterfly effect, named by mathematician Edward Lorenz, is the idea that something as small as a butterfly flapping its wings can eventually cause a tornado. \n\nen.wikipedia.org/wiki/Butterf...',
		facets: [
			{
				features: [
					{
						$type: 'app.bsky.richtext.facet#link',
						uri: 'https://en.wikipedia.org/wiki/Butterfly_effect',
					},
				],
				index: {
					byteEnd: 196,
					byteStart: 164,
				},
			},
		],
	},
	{
		name: 'Space penguin',
		text: 'Space penguin.\nThis is Arp 142, two interacting galaxies NGC 2936 and NGC 2937.\nProcessed by c.claude.\nwww.flickr.com/photos/27527...\n🔭 🧪',
		facets: [
			{
				features: [
					{
						$type: 'app.bsky.richtext.facet#link',
						uri: 'https://www.flickr.com/photos/27527123@N02',
					},
				],
				index: {
					byteEnd: 133,
					byteStart: 103,
				},
			},
		],
	},
	{
		name: 'Football',
		text: 'All eyes are on the Bills, Chiefs, Josh Allen & Patrick Mahomes this week.\n\nAnd even through a "bad" stat line, the Colts film brought me to one conclusion:\n\nJosh Allen is playing the best football of his career.\n\nHere\'s why, all @theathletic.bsky.social: www.nytimes.com/athletic/591...',
		facets: [
			{
				features: [
					{
						$type: 'app.bsky.richtext.facet#mention',
						did: 'did:plc:b2kutgxqlltwc6lhs724cfwr',
					},
				],
				index: {
					byteEnd: 260,
					byteStart: 236,
				},
			},
			{
				features: [
					{
						$type: 'app.bsky.richtext.facet#link',
						uri: 'https://www.nytimes.com/athletic/5918320/2024/11/13/josh-allen-bills-playing-the-best-football-of-his-career/?source=emp_shared_article',
					},
				],
				index: {
					byteEnd: 293,
					byteStart: 262,
				},
			},
		],
	},
	{
		name: 'JP',
		text: "Glazeおためし\nひとまずインテンシティとレンダークォリティーはデフォルトで処理時間は2分30秒\n(n'∀')ηやんわり模様が見える感じ\n・元画像\nbsky.app/profile/miko...",
		facets: [
			{
				features: [
					{
						$type: 'app.bsky.richtext.facet#link',
						uri: 'https://bsky.app/profile/mikoyan.bsky.social/post/3laendb73ld2v',
					},
				],
				index: {
					byteEnd: 218,
					byteStart: 194,
				},
			},
		],
	},
];
