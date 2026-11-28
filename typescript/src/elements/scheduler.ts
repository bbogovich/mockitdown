/**
 * The render scheduler shared by `mockitdown-mockup`, `mockitdown-editor`, `mockitdown-outline` and
 * `mockitdown-gallery` (A-WEB-5): changes are coalesced into one render per microtask, a render
 * started before a newer change is abandoned as stale, and `rendered` promises resolve once the
 * element is rendered and up to date. {@link renderFailure} turns a thrown render error into the
 * element diagnostic and error HTML the mockup and the editor show.
 */

import { Diagnostic, errorHtml, Location } from "../core/index.js";

/** Coalesces an element's changes into renders, one at a time, the last change always rendered. */
export class RenderScheduler {
  readonly #host: { readonly isConnected: boolean };
  readonly #render: (generation: number) => Promise<void>;
  #generation = 0;
  #dirty = true;
  #queued = false;
  #running = false;
  #renderedOnce = false;
  #waiters: (() => void)[] = [];

  /**
   * `render(generation)` performs one render; it calls {@link done} when it has shown its result and
   * returns early (without touching the element) when {@link stale} says a newer change arrived.
   */
  constructor(host: { readonly isConnected: boolean }, render: (generation: number) => Promise<void>) {
    this.#host = host;
    this.#render = render;
  }

  /** The generation of the latest change. */
  get generation(): number {
    return this.#generation;
  }

  /** Whether a change arrived after the render of `generation` started. */
  stale(generation: number): boolean {
    return generation !== this.#generation;
  }

  /** A promise that resolves after the next render, or at once when rendered and up to date; it never rejects. */
  get rendered(): Promise<void> {
    if (this.#renderedOnce && !this.#dirty && !this.#running && !this.#queued) return Promise.resolve();
    return new Promise((resolve) => this.#waiters.push(resolve));
  }

  /** A render has shown its result. */
  done(): void {
    this.#renderedOnce = true;
  }

  /** Note a change and render it in a microtask, while the host is connected. */
  schedule(): void {
    this.#generation++;
    this.#dirty = true;
    if (!this.#host.isConnected || this.#queued) return;
    this.#queued = true;
    queueMicrotask(() => {
      this.#queued = false;
      void this.#pump();
    });
  }

  async #pump(): Promise<void> {
    if (this.#running) return;
    this.#running = true;
    try {
      while (this.#dirty && this.#host.isConnected) {
        this.#dirty = false;
        await this.#render(this.#generation);
      }
    } finally {
      this.#running = false;
    }
    if (!this.#dirty && this.#renderedOnce) {
      const waiters = this.#waiters;
      this.#waiters = [];
      for (const w of waiters) w();
    }
  }
}

/** A thrown render error as the element's diagnostic ("cannot render: …") and the error HTML showing it. */
export function renderFailure(e: unknown): { diagnostics: Diagnostic[]; html: string } {
  const message = e instanceof Error ? e.message : String(e);
  const diagnostics = [new Diagnostic("error", `cannot render: ${message}`, new Location(), "element")];
  return { diagnostics, html: errorHtml(diagnostics) };
}
