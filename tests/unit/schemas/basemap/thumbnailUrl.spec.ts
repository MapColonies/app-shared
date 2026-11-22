import { BasemapThumbnailSchema } from '../../../../src/schemas/basemap/basemap.schema';
import { THUMBNAIL_URL_MESSAGE, THUMBNAIL_URL_PATTERN } from '../../../../src/schemas/basemap/thumbnailUrl';

// A real 1x1 PNG, the same kind of inline thumbnail basemap-management's mock fixtures use.
const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const WEBP_HEADER = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';

function parseUrl(url: string): ReturnType<typeof BasemapThumbnailSchema.safeParse> {
  return BasemapThumbnailSchema.safeParse({ url, width: 128, height: 128 });
}

function isWhatwgUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

describe('BasemapThumbnailSchema url', () => {
  describe('accepts', () => {
    it.each([
      ['a data-service URL as returned by the BFF upload', 'https://data-service.mapcolonies.net/pvc/files/basemaps/thumbnails/0b6f7c1e.png'],
      ['plain http with a single-label host', 'http://data-service/pvc/files/basemaps/thumbnails/a.webp'],
      ['a host with a port', 'http://data-service:8080/pvc/files/basemaps/thumbnails/a.png'],
      ['the highest port', 'http://localhost:65535/a.png'],
      ['a bare origin', 'https://example.com'],
      ['a trailing slash', 'https://example.com/'],
      ['a query string', 'https://example.com/a.png?token=x&y=1'],
      ['a fragment', 'https://example.com/a.png#f'],
      ['percent-encoded characters', 'https://example.com/a%20b.png?q=%E2%9C%93'],
      ['an IPv4 host', 'https://10.0.0.1/a.png'],
      ['an upper-case host and path', 'https://EXAMPLE.COM/A.PNG'],
      ['a punycode host', 'https://xn--bcher-kva.example/a.png'],
      ['a PNG data URL', `data:image/png;base64,${PNG_1X1}`],
      ['a WebP data URL', `data:image/webp;base64,${WEBP_HEADER}`],
      ['a single unpadded Base64 quantum', 'data:image/png;base64,iVBO'],
    ])('%s', (_label, url) => {
      expect(parseUrl(url).success).toBe(true);
      expect(isWhatwgUrl(url)).toBe(true);
    });
  });

  describe('rejects', () => {
    it.each([
      ['an empty string', ''],
      ['whitespace only', '   '],
      ['a bare word', 'foo'],
      ['an absolute path', '/pvc/files/a.png'],
      ['a relative path', 'pvc/files/a.png'],
      ['a dot-relative path', './a.png'],
      ['a protocol-relative URL', '//example.com/a.png'],
      ['a missing host', 'http://'],
      ['an empty authority', 'http:///a.png'],
      ['a missing //', 'http:example.com/a.png'],
      ['a missing colon', 'https//example.com/a.png'],
      ['an upper-case scheme', 'HTTPS://example.com/a.png'],
      ['leading whitespace', ' https://example.com/a.png'],
      ['trailing whitespace', 'https://example.com/a.png '],
      ['a trailing newline', 'https://example.com/a.png\n'],
      ['an inner space', 'https://example.com/a b.png'],
      ['raw non-ASCII', 'https://example.com/ä.png'],
      ['a malformed percent-escape', 'https://example.com/a%zzb.png'],
      ['a backslash', 'https://example.com\\a.png'],
      ['credentials', 'https://user:pw@example.com/a.png'],
      ['an underscore in the host', 'https://ex_ample.com/a.png'],
      ['a label starting with a hyphen', 'https://-bad.com/a.png'],
      ['an empty label', 'https://a..b/a.png'],
      ['a trailing dot', 'https://example.com./a.png'],
      ['an out-of-range IPv4 octet', 'https://256.0.0.1/a.png'],
      ['an invalid IPv4 address', 'https://999.1.1.1/a.png'],
      ['a short numeric host', 'https://1.2.3/a.png'],
      ['a hex IPv4 host', 'https://0x7f.1/a.png'],
      ['an IPv6 host', 'https://[::1]/a.png'],
      ['an empty port', 'http://localhost:/a.png'],
      ['a non-numeric port', 'http://localhost:abc/a.png'],
      ['a port above 65535', 'http://localhost:65536/a.png'],
      ['a zero-padded port', 'https://example.com:08080/a.png'],
      ['brackets in the query', 'https://example.com/a.png?x=[1]'],
      ['a second #', 'https://example.com/a.png#a#b'],
      ['ftp', 'ftp://example.com/a.png'],
      ['file', 'file:///etc/passwd'],
      ['the removed BMM stub storage scheme', 'memory://basemaps/thumbnails/x.png'],
      ['javascript', 'javascript:alert(1)'],
      ['mailto', 'mailto:a@b.c'],
      ['blob', 'blob:https://example.com/0b6f7c1e'],
      ['a data URL without a payload', 'data:image/png;base64,'],
      ['a data URL with truncated Base64', 'data:image/png;base64,iVBORw0KGgo'],
      ['a data URL with whitespace in the payload', 'data:image/png;base64,iVBO Rw0K'],
      ['a data URL with excess padding', 'data:image/png;base64,iVBORw0K===='],
      ['a data URL with inner padding', 'data:image/png;base64,iVB=Rw0K'],
      ['a data URL with URL-safe Base64', 'data:image/png;base64,iVBO-_0K'],
      ['a data URL that is not Base64', 'data:image/png,rawdata'],
      ['a JPEG data URL', 'data:image/jpeg;base64,/9j/4AAQ'],
      ['an SVG data URL', 'data:image/svg+xml;base64,PHN2Zz4='],
      ['an HTML data URL', 'data:text/html;base64,PHNjcmlwdD4='],
      ['an upper-case data scheme', `DATA:image/png;base64,${PNG_1X1}`],
      ['an upper-case media type', `data:image/PNG;base64,${PNG_1X1}`],
      ['extra data URL parameters', `data:image/png;charset=utf-8;base64,${PNG_1X1}`],
      ['a fragment after a data URL', `data:image/png;base64,${PNG_1X1}#x`],
    ])('%s', (_label, url) => {
      const result = parseUrl(url);
      expect(result.success).toBe(false);
      expect(result.error?.issues.map((issue) => issue.message)).toContain(THUMBNAIL_URL_MESSAGE);
    });
  });

  it('never accepts a value the WHATWG URL parser (Zod .url()) rejects, so Zod and an OpenAPI pattern agree', () => {
    const candidates = ['https://999.1.1.1/a.png', 'http://localhost:65536/a.png', 'http://', 'https://[::1/a.png'];
    for (const candidate of candidates) {
      expect(isWhatwgUrl(candidate) || !THUMBNAIL_URL_PATTERN.test(candidate)).toBe(true);
    }
  });

  it('does not mention the removed basemap-management upload endpoint', () => {
    expect(THUMBNAIL_URL_MESSAGE).not.toContain('POST /basemaps/thumbnails');
  });

  it('is a pattern without flags, so it means the same as a JSON-Schema / OpenAPI pattern', () => {
    expect(THUMBNAIL_URL_PATTERN.flags).toBe('');
    expect(() => new RegExp(THUMBNAIL_URL_PATTERN.source, 'u')).not.toThrow();
  });
});
