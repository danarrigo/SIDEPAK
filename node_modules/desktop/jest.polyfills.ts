// Polyfill globals required by Next.js route handlers (Request, Response, Headers, fetch)
// Runs BEFORE the test framework + Next.js spec extensions load.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

if (typeof globalThis.Request === 'undefined') {
  try {
    // node 18+ ships Request/Response/Headers/fetch as globals. Require it
    // explicitly so TS picks up the types without bundling the package.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const undici: AnyRecord = require('undici');
    if (undici) {
      (globalThis as unknown as AnyRecord).Request = undici.Request;
      (globalThis as unknown as AnyRecord).Response = undici.Response;
      (globalThis as unknown as AnyRecord).Headers = undici.Headers;
      (globalThis as unknown as AnyRecord).fetch = undici.fetch;
    }
  } catch {
    // Fallback: minimal shims compatible with Next.js NextResponse.json()
    class FakeHeaders {
      private map = new Map<string, string>();
      constructor(init: Record<string, string> = {}) {
        for (const [k, v] of Object.entries(init)) this.map.set(k.toLowerCase(), v);
      }
      get(k: string): string | null { return this.map.get(k.toLowerCase()) ?? null; }
      set(k: string, v: string): void { this.map.set(k.toLowerCase(), v); }
      has(k: string): boolean { return this.map.has(k.toLowerCase()); }
      forEach(cb: (v: string, k: string) => void): void { this.map.forEach((v, k) => cb(v, k)); }
    }
    type FakeInput = string | { url: string };
    class FakeRequest {
      url: string;
      method: string;
      headers: FakeHeaders;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(input: FakeInput, init: AnyRecord = {}) {
        this.url = typeof input === 'string' ? input : input.url;
        this.method = (init.method as string) || 'GET';
        this.headers = new FakeHeaders((init.headers as Record<string, string>) || {});
        this.body = init.body;
      }
      async json(): Promise<unknown> { return JSON.parse(String(this.body)); }
      async text(): Promise<string> { return String(this.body); }
    }
    class FakeResponse {
      status: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: any;
      headers: FakeHeaders;
      _consumed = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(body: any, init: AnyRecord = {}) {
        this.status = (init.status as number) || 200;
        this.body = body;
        this.headers = new FakeHeaders((init.headers as Record<string, string>) || {});
      }
      get(k: string): string | null { return this.headers.get(k); }
      async json(): Promise<unknown> {
        if (typeof this.body === 'string') return JSON.parse(this.body);
        return this.body;
      }
      async text(): Promise<string> {
        return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
      }
      // Static factory matching the Web Response.json signature.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static json(data: any, init: AnyRecord = {}): FakeResponse {
        return new FakeResponse(JSON.stringify(data), {
          ...init,
          headers: { ...((init.headers as Record<string, string>) || {}), 'content-type': 'application/json' },
        });
      }
    }
    const g = globalThis as unknown as AnyRecord;
    g.Request = FakeRequest;
    g.Response = FakeResponse;
    g.Headers = FakeHeaders;
  }
}
