# atcute

an ecosystem of lightweight TypeScript packages for AT Protocol, the protocol
powering Bluesky.

you might be looking for [the API client](./packages/core/client/README.md).

<table>
	<thead>
		<tr>
			<th align="left">Package</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th colspan="2" align="left">Core packages</th>
		</tr>
		<tr>
			<td><code>client</code>: the actual client library</td>
		</tr>
		<tr>
			<td><code>lex-cli</code>: CLI tool to generate type definitions for the API client</td>
		</tr>
		<tr>
			<th colspan="2" align="left">Lexicon definitions</th>
		</tr>
		<tr>
			<td><code>bluemoji</code>: adds <code>blue.moji.*</code> definitions</td>
		</tr>
		<tr>
			<td><code>bluesky</code>: adds <code>app.bsky.*</code> and <code>chat.bsky.*</code> definitions</td>
		</tr>
		<tr>
			<td><code>ozone</code>: adds <code>tools.ozone.*</code> definitions</td>
		</tr>
		<tr>
			<td><code>whitewind</code>: adds <code>com.whtwnd.*</code> definitions</td>
		</tr>
		<tr>
			<th colspan="2" align="left">Utility packages</th>
		</tr>
		<tr>
			<td><code>tid</code>: create and parse TID identifiers</td>
		</tr>
		<tr>
			<td><code>car</code>: read AT Protocol's CAR (content-addressable archive) repositories</td>
		</tr>
		<tr>
			<td><code>cid</code>: create and parse the blessed CIDv1 format</td>
		</tr>
		<tr>
			<td><code>cbor</code>: DAG-CBOR codec that deals in AT Protocol's HTTP wire format</td>
		</tr>
		<tr>
			<td><code>varint</code>: codec for Protobuf-style varint bytes</td>
		</tr>
		<tr>
			<td><code>base32</code>: codec for base32</td>
		</tr>
		<tr>
			<th colspan="2" align="left">Bluesky-related packages</th>
		</tr>
		<tr>
			<td><code>bluesky-richtext-builder</code>: builder for Bluesky's rich text format</td>
		</tr>
		<tr>
			<td><code>bluesky-threading</code>: create Bluesky threads containing multiple posts with one write</td>
		</tr>
	</tbody>
</table>
