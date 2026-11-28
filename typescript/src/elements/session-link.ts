/**
 * How a design-tool element finds its design session (A-WEB-5, R-EDIT-006.C11): the nearest
 * enclosing `mockitdown-designer`'s, else the one its host gave it, else one of its own.
 * {@link SessionLink} keeps that choice and the subscription for `mockitdown-canvas`,
 * `mockitdown-editor`, `mockitdown-outline`, `mockitdown-gallery`, `mockitdown-inspector` and
 * `mockitdown-diagnostics`; each element keeps its own notification handling. The session stays the
 * owner of every editing rule (A-WEB-5.K2).
 */

import { DESIGN_EVENTS, DesignSession, type DesignNotification } from "../design/session.js";

/** The designer's tag (also `DESIGNER_TAG` in designer.ts, which imports the elements). */
const DESIGNER_TAG = "mockitdown-designer";

/**
 * The session of the nearest `mockitdown-designer` around `node`, walking parents and out of shadow
 * roots to their hosts; null when there is none, or it has no session yet.
 */
export function findDesignerSession(node: Node): DesignSession | null {
  let at: Node | null = node.parentNode;
  while (at) {
    if (at instanceof Element && at.localName === DESIGNER_TAG) {
      const s = (at as unknown as { session?: unknown }).session;
      if (s instanceof DesignSession) return s;
    }
    at = at.parentNode ?? (at instanceof ShadowRoot ? at.host : null);
  }
  return null;
}

/** What an element tells its {@link SessionLink}. */
export interface SessionLinkOptions {
  /** Create the element's own session, the first time it needs one. */
  own: () => DesignSession;
  /** Receive the current session's notifications. */
  notified: (n: DesignNotification) => void;
  /** Before switching sessions, while the previous one (null at first) is still current and subscribed. */
  leaving?: (previous: DesignSession | null) => void;
  /** After switching sessions, once subscribed to the new one. */
  joined?: (session: DesignSession) => void;
}

/** An element's link to its design session: the given and the own session, the current one and its subscription. */
export class SessionLink {
  readonly #host: HTMLElement;
  readonly #options: SessionLinkOptions;
  #current: DesignSession | null = null;
  #given: DesignSession | null = null;
  #own: DesignSession | null = null;
  #unsubscribe: (() => void) | null = null;

  constructor(host: HTMLElement, options: SessionLinkOptions) {
    this.#host = host;
    this.#options = options;
  }

  /** The session the element shows now; null before the first {@link attach}. */
  get current(): DesignSession | null {
    return this.#current;
  }

  /** The element's own session, once it has needed one. */
  get own(): DesignSession | null {
    return this.#own;
  }

  /** Whether the current session is the element's own (then it dispatches the session's events itself). */
  get isOwn(): boolean {
    return this.#current === this.#own;
  }

  /** Set the session the host gives (anything other than a DesignSession clears it) and attach. */
  give(value: unknown): void {
    this.#given = value instanceof DesignSession ? value : null;
    this.attach();
  }

  /**
   * Join the nearest designer's session, else the given one, else the own one, and return it. When
   * that is another session than the current: `leaving`, unsubscribe from the previous one,
   * subscribe to the new one, `joined`.
   */
  attach(): DesignSession {
    const next = findDesignerSession(this.#host) ?? this.#given ?? (this.#own ??= this.#options.own());
    if (next !== this.#current) {
      this.#options.leaving?.(this.#current);
      this.#unsubscribe?.();
      this.#current = next;
      this.#unsubscribe = next.subscribe((n) => this.#options.notified(n));
      this.#options.joined?.(next);
    }
    return next;
  }

  /** On the element's own session, dispatch a notification's DOM event from the element (bubbling, composed). */
  forward(n: DesignNotification): void {
    if (this.isOwn && n.kind in DESIGN_EVENTS) {
      const type = DESIGN_EVENTS[n.kind as keyof typeof DESIGN_EVENTS];
      this.#host.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: n.detail }));
    }
  }
}
