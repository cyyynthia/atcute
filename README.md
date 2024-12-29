# atcute

a collection of lightweight TypeScript packages for AT Protocol, the protocol powering Bluesky,
featuring:

- an [API client][client] for making typed HTTP requests, with support for lexicons like
  [WhiteWind][whitewind] or [Bluemoji][bluemoji]
- an [OAuth client for SPA applications][oauth-browser-client] for authentication use-cases
- utility packages for various data formats, including CIDv1, DAG-CBOR, CAR and TID record keys
- Bluesky-specific utility packages like [a rich text builder][bluesky-richtext-builder] and [a post
  threader][bluesky-threading]

looking for more? check out [skyware][skyware], an additional collection of packages, built on top
of atcute.

[bluemoji]: ./packages/definitions/bluemoji
[bluesky-richtext-builder]: ./packages/bluesky/richtext-builder
[bluesky-threading]: ./packages/bluesky/threading
[client]: ./packages/core/client
[oauth-browser-client]: ./packages/oauth/browser-client
[whitewind]: ./packages/definitions/whitewind
[skyware]: https://skyware.js.org/

---

| Packages                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------- |
| **Core packages**                                                                                                      |
| [`client`](./packages/core/client): API client library                                                                 |
| [`lex-cli`](./packages/core/lex-cli): CLI tool to generate type definitions for the API client                         |
| **OAuth packages**                                                                                                     |
| [`oauth-browser-client`](./packages/oauth/browser-client): minimal OAuth browser client implementation                 |
| **Lexicon definitions**                                                                                                |
| [`bluemoji`](./packages/definitions/bluemoji): adds `blue.moji.*` lexicons                                             |
| [`bluesky`](./packages/definitions/bluesky): adds `app.bsky.*` and `chat.bsky.*` lexicons                              |
| [`ozone`](./packages/definitions/ozone): adds `tools.ozone.*` lexicons                                                 |
| [`whitewind`](./packages/definitions/whitewind): adds `com.whtwnd.*` lexicons                                          |
| **Utility packages**                                                                                                   |
| [`car`](./packages/utilities/car): DASL CAR and atproto repository decoder                                             |
| [`cbor`](./packages/utilities/cbor): DASL dCBOR42 codec                                                                |
| [`cid`](./packages/utilities/cid): DASL CID codec                                                                      |
| [`crypto`](./packages/utilities/crypto): cryptographic utilities                                                       |
| [`multibase`](./packages/utilities/multibase): multibase utilities                                                     |
| [`tid`](./packages/utilities/tid): atproto timestamp identifier codec                                                  |
| [`varint`](./packages/utilities/varint): protobuf-style LEB128 varint codec                                            |
| **Bluesky-specific packages**                                                                                          |
| [`bluesky-richtext-builder`](./packages/bluesky/richtext-builder): builder pattern for Bluesky's rich text facets      |
| [`bluesky-richtext-parser`](./packages/bluesky/richtext-parser): parse Bluesky's (extended) rich text syntax           |
| [`bluesky-richtext-segmenter`](./packages/bluesky/richtext-segmenter): segments Bluesky's rich text facets into tokens |
| [`bluesky-threading`](./packages/bluesky/threading): create Bluesky threads containing multiple posts with one write   |

## contribution guide

this monorepo uses [`mise`](https://mise.jdx.dev) to handle versioning, although it doesn't really
matter. Node.js LTS is necessary to use the `internal-dev-env` package for testing the `client`
package with the official PDS distribution, but otherwise you can (and should) use the latest
available version.

```sh
# Install all the recommended runtimes
mise install

# Runs all the build scripts
pnpm run -r build

# Pull in the latest ATProto/Ozone/Bluesky lexicons, and generate the type declarations
pnpm run pull
pnpm run -r generate
```
