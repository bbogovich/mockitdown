/**
 * Diagnostics: located errors and warnings produced while parsing, expanding and rendering
 * (port of `mockitdown.diagnostics`).
 *
 * Every stage reports problems through a {@link Diagnostics} collector instead of throwing, so one bad
 * element never hides the others. Only a syntax error stops processing; it is thrown as
 * {@link MockitdownSyntaxError} carrying the same {@link Diagnostic}.
 */

import { strRepr } from "./values.js";

export type Severity = "error" | "warning";

/** A 1-based position in a mockup source; `source` names the file for imported code. */
export class Location {
  readonly line: number;
  readonly col: number;
  readonly source: string;

  constructor(line = 0, col = 0, source = "") {
    this.line = line;
    this.col = col;
    this.source = source;
  }

  toString(): string {
    const where = this.source ? `${this.source}:` : "line ";
    return this.line ? `${where}${this.line}:${this.col}` : this.source || "?";
  }

  pyRepr(): string {
    return `Location(line=${this.line}, col=${this.col}, source=${strRepr(this.source)})`;
  }
}

export class Diagnostic {
  readonly severity: Severity;
  readonly message: string;
  readonly location: Location;
  readonly code: string;

  constructor(severity: Severity, message: string, location: Location = new Location(), code = "") {
    this.severity = severity;
    this.message = message;
    this.location = location;
    this.code = code;
  }

  toString(): string {
    const code = this.code ? ` [${this.code}]` : "";
    return `${this.severity}${code} at ${this.location}: ${this.message}`;
  }

  /** The record the conformance corpus stores (`<name>.diag.json`). */
  toJSON(): { severity: Severity; code: string; message: string; line: number; col: number; source: string } {
    return {
      severity: this.severity, code: this.code, message: this.message,
      line: this.location.line, col: this.location.col, source: this.location.source,
    };
  }
}

/** Base class for errors thrown by mockitdown. */
export class MockitdownError extends Error {
  readonly diagnostic: Diagnostic;

  constructor(diagnostic: Diagnostic | string) {
    const d = typeof diagnostic === "string" ? new Diagnostic("error", diagnostic) : diagnostic;
    super(String(d));
    this.diagnostic = d;
    this.name = "MockitdownError";
  }
}

/** The source could not be tokenized or parsed. */
export class MockitdownSyntaxError extends MockitdownError {
  constructor(diagnostic: Diagnostic | string) {
    super(diagnostic);
    this.name = "MockitdownSyntaxError";
  }
}

/** An ordered collector of diagnostics, de-duplicated by (severity, message, location). */
export class Diagnostics {
  private readonly list: Diagnostic[] = [];
  private readonly seen = new Set<string>();

  add(severity: Severity, message: string, location?: Location | null, code = ""): void {
    const d = new Diagnostic(severity, message, location ?? new Location(), code);
    const loc = d.location;
    const key = JSON.stringify([d.severity, d.message, loc.line, loc.col, loc.source]);
    if (!this.seen.has(key)) {
      this.seen.add(key);
      this.list.push(d);
    }
  }

  error(message: string, location?: Location | null, code = ""): void {
    this.add("error", message, location, code);
  }

  warning(message: string, location?: Location | null, code = ""): void {
    this.add("warning", message, location, code);
  }

  extend(items: readonly Diagnostic[]): void {
    for (const d of items) this.add(d.severity, d.message, d.location, d.code);
  }

  get items(): Diagnostic[] {
    return [...this.list];
  }

  get errors(): Diagnostic[] {
    return this.list.filter((d) => d.severity === "error");
  }

  get warnings(): Diagnostic[] {
    return this.list.filter((d) => d.severity === "warning");
  }

  get length(): number {
    return this.list.length;
  }
}
