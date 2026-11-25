// The few Node APIs `mockitdown/node` uses. ADR-20 allows no @types/node; these declarations are
// all the loader needs, and the core (src/core/) never sees them.
declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding: "utf8" | "utf-8"): string;
  export function readdirSync(path: string | URL): string[];
  export function existsSync(path: string | URL): boolean;
}
declare module "node:url" {
  export function fileURLToPath(url: string | URL): string;
  export function pathToFileURL(path: string): URL;
}
declare module "node:path" {
  export function join(...parts: string[]): string;
  export function resolve(...parts: string[]): string;
  export function relative(from: string, to: string): string;
}
interface ImportMeta {
  readonly url: string;
}
declare class URL {
  constructor(url: string, base?: string | URL);
  readonly href: string;
  readonly pathname: string;
  toString(): string;
}
