/**
 * The design document and session module (A-WEB-4): `readDesign`, `writeDesign`, `newDesign`,
 * `mockupOptions` and `DesignSession`. No DOM, network or file system (A-WEB-4.K1), so that a desktop
 * shell's main process can use it in Node as the design tools use it in a browser.
 */

export {
  DESIGN_FORMAT, DESIGN_VERSION, DOCUMENT_KEYS, findMockup, MOCKUP_KEYS, mockupOptions, mockupPack, newDesign, readDesign,
  SECTION_KEYS, VIEW_KEYS, writeDesign,
  type DesignDocument, type DesignError, type DesignMockup, type DesignSection, type DesignView, type ReadResult,
} from "./document.js";
export {
  COALESCE_MS, DESIGN_EVENTS, DesignSession, HISTORY_LIMIT,
  type ChangeKind, type HistoryOptions, type DesignListener, type DragSource, type DropCheck, type DropPosition, type DropZone, type DesignNotification, type DesignNotificationKind, type DesignSessionOptions, type Refused,
} from "./session.js";
export type { EditOp, EditRefusal, EditResult } from "../core/syntax/edit.js";
export type { SyntaxTree, TextEdit, ViewNode } from "../core/syntax/tree.js";
