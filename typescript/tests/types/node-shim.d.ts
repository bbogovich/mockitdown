// The Node APIs the unit tests use. ADR-20 allows no @types/node, so the tests declare these few.
declare module "node:test" {
  type Fn = (t: TestContext) => void | Promise<void>;
  interface Options { skip?: boolean | string; todo?: boolean | string }
  export interface TestContext {
    test(name: string, fn: Fn): Promise<void>;
    test(name: string, options: Options, fn?: Fn): Promise<void>;
    todo(message?: string): void;
    skip(message?: string): void;
  }
  export function test(name: string, fn: Fn): Promise<void>;
  export function test(name: string, options: Options, fn?: Fn): Promise<void>;
  export function describe(name: string, fn: () => void | Promise<void>): Promise<void>;
  export function describe(name: string, options: Options, fn: () => void | Promise<void>): Promise<void>;
  export function it(name: string, fn: Fn): Promise<void>;
  export function it(name: string, options: Options, fn?: Fn): Promise<void>;
  export function before(fn: () => void | Promise<void>): void;
  export function after(fn: () => void | Promise<void>): void;
  export default test;
}
declare module "node:assert/strict" {
  interface Assert {
    (value: unknown, message?: string): void;
    ok(value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    notEqual(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    match(value: string, re: RegExp, message?: string): void;
    doesNotMatch(value: string, re: RegExp, message?: string): void;
    throws(fn: () => unknown, expected?: RegExp | Function | object, message?: string): void;
    fail(message?: string): never;
    rejects(p: Promise<unknown>, expected?: RegExp | Function | object, message?: string): Promise<void>;
  }
  const assert: Assert;
  export default assert;
}
declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding: "utf8" | "utf-8"): string;
  export function readdirSync(path: string | URL): string[];
  export function existsSync(path: string | URL): boolean;
  export function statSync(path: string | URL): { isDirectory(): boolean; isFile(): boolean };
  export function mkdtempSync(prefix: string): string;
  export function rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void;
  export function writeFileSync(path: string, data: string): void;
  export function cpSync(src: string, dst: string, options?: { recursive?: boolean }): void;
}
declare module "node:os" {
  export function tmpdir(): string;
}
declare module "node:http" {
  interface IncomingMessage {
    statusCode?: number;
    headers: Record<string, string | string[] | undefined>;
    setEncoding(encoding: "utf8"): void;
    on(event: "data", fn: (chunk: string) => void): this;
    on(event: "end", fn: () => void): this;
  }
  interface ClientRequest {
    on(event: "error", fn: (err: Error) => void): this;
    end(): void;
  }
  export function request(
    options: { host: string; port: number; path: string; method: string },
    callback: (res: IncomingMessage) => void,
  ): ClientRequest;
}
declare module "node:child_process" {
  export function spawnSync(
    command: string,
    args: string[],
    options: { cwd?: string; encoding: "utf8"; shell?: boolean },
  ): { status: number | null; stdout: string; stderr: string };
}
declare module "node:url" {
  export function fileURLToPath(url: string | URL): string;
}
declare module "node:path" {
  export function join(...parts: string[]): string;
  export function dirname(path: string): string;
  export function relative(from: string, to: string): string;
  export function resolve(...parts: string[]): string;
}
interface ImportMeta {
  readonly url: string;
}
declare class URL {
  constructor(url: string, base?: string | URL);
  readonly href: string;
  readonly pathname: string;
}
