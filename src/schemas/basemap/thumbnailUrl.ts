/**
 * The thumbnail URL contract, as ONE regular expression so the very same rule can be enforced by Zod
 * (`.regex()`) and published as a JSON-Schema / OpenAPI `pattern` by consumers that generate a spec
 * from these schemas (a refine/superRefine could not be expressed there).
 *
 * Accepted:
 * - an absolute `http://` / `https://` URL - what catalog-web-app-bff returns after uploading the image
 *   to data-service (`<data-service>/pvc/files/basemaps/thumbnails/<uuid>.png|webp`);
 * - a `data:image/png;base64,...` / `data:image/webp;base64,...` URL with a well-formed Base64 payload
 *   (inline thumbnails: mock fixtures, tests, offline demos).
 *
 * Deliberately rejected: relative URLs, any other scheme (`ftp:`, `file:`, `blob:`, `javascript:`, ...),
 * credentials in the authority, whitespace, raw non-ASCII, malformed percent-escapes, hosts the WHATWG URL
 * parser rejects (e.g. `999.1.1.1`), ports outside 0-65535 and any other data-URL media type or encoding.
 *
 * Scheme and data-URL media type must be lowercase (that is what every producer emits). The pattern is a
 * strict subset of what both `new URL()` (Zod's `.url()`) and RFC 3986 (`format: uri`) accept, so a value
 * is accepted or rejected identically by Zod and by an OpenAPI validator.
 */

// Each piece is an RFC 3986 production, narrowed to what the WHATWG URL parser also accepts unchanged.
const PORT = String.raw`(?:6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}|0)`;
const IPV4_OCTET = String.raw`(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)`;
const IPV4 = String.raw`${IPV4_OCTET}(?:\.${IPV4_OCTET}){3}`;
const DNS_LABEL = String.raw`[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?`;
// The last label must start with a letter: an all-numeric last label makes the WHATWG parser treat the
// whole host as an IPv4 address (so `1.2.3` or `999.1.1.1` would be reinterpreted or rejected).
const TOP_LABEL = String.raw`[A-Za-z](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?`;
const HOST = String.raw`(?:(?:${DNS_LABEL}\.)*${TOP_LABEL}|${IPV4})`;
const PATH_CHAR = String.raw`(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})`;
const PATH = String.raw`(?:/${PATH_CHAR}*)*`;
const QUERY = String.raw`(?:\?(?:${PATH_CHAR}|[/?])*)?`;
const FRAGMENT = String.raw`(?:#(?:${PATH_CHAR}|[/?])*)?`;
const HTTP_URL = String.raw`https?://${HOST}(?::${PORT})?${PATH}${QUERY}${FRAGMENT}`;

// Canonical, padded Base64 (RFC 4648 section 4), at least one quantum.
const BASE64 = String.raw`(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)`;
const IMAGE_DATA_URL = String.raw`data:image/(?:png|webp);base64,${BASE64}`;

export const THUMBNAIL_URL_PATTERN = new RegExp(`^(?:${HTTP_URL}|${IMAGE_DATA_URL})$`);

export const THUMBNAIL_URL_MESSAGE =
  'thumbnail.url must be an absolute http(s) URL (as returned by the catalog-web-app-bff thumbnail upload) or a data:image/png or data:image/webp Base64 URL';
