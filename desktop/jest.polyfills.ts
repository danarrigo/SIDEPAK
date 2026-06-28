// Polyfill globals required by Next.js route handlers (Request, Response, Headers, fetch)
// Runs BEFORE the test framework + Next.js spec extensions load.

if (typeof globalThis.Request === 'undefined') {
  try {
    // node 18+ has Request/Response/Headers/ fetch as global
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const undici = require('undici');
    if (undici) {
      (globalThis as any).Request = undici.Request;
      (globalThis as any).Response = undici.Response;
      (globalThis as any).Headers = undici.Headers;
      (globalThis as any).fetch = undici.fetch;
    }
  } catch {
    // Fallback: minimal shims compatible with Next.js NextResponse.json()
    class FakeHeaders {
      private map = new Map<string, string>();
      constructor(init: Record<string, string> = {}) {
        for (const [k, v] of Object.entries(init)) this.map.set(k.toLowerCase(), v);
      }
      get(k: string) { return this.map.get(k.toLowerCase()) || null; }
      set(k: string, v: string) { this.map.set(k.toLowerCase(), v); }
      has(k: string) { return this.map.has(k.toLowerCase()); }
      forEach(cb: (v: string, k: string) => void) { this.map.forEach((v, k) => cb(v, k)); }
    }
    class FakeRequest {
      url: string;
      method: string;
      headers: FakeHeaders;
      body: any;
      constructor(input: any, init: any = {}) {
        this.url = typeof input === 'string' ? input : input.url;
        this.method = init.method || 'GET';
        this.headers = new FakeHeaders(init.headers || {});
        this.body = init.body;
      }
      async json() { return JSON.parse(this.body); }
      async text() { return this.body; }
    }
    class FakeResponse {
      status: number;
      body: any;
      headers: FakeHeaders;
      _consumed = false;
      constructor(body: any, init: any = {}) {
        this.status = init.status || 200;
        this.body = body;
        this.headers = new FakeHeaders(init.headers || {});
      }
      get(k: string) { return this.headers.get(k); }
      async json() {
        if (typeof this.body === 'string') return JSON.parse(this.body);
        return this.body;
      }
      async text() {
        return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
      }
      // Static factory matching the Web Response.json signature.
      static json(data: any, init: any = {}) {
        return new FakeResponse(JSON.stringify(data), {
          ...init,
          headers: { ...(init.headers || {}), 'content-type': 'application/json' },
        });
      }
    }
    (globalThis as any).Request = FakeRequest;
    (globalThis as any).Response = FakeResponse;
    (globalThis as any).Headers = FakeHeaders;
  }
}
