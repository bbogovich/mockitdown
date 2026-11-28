/**
 * The design document and session module (A-WEB-4): `readDesign`, `writeDesign`, `newDesign`,
 * `mockupOptions`, `DesignSession`, the inspector's model, `CodeSync`, the diagnostics list's model and the canvas's view geometry. No DOM, network or file system (A-WEB-4.K1), so that a desktop
 * shell's main process can use it in Node as the design tools use it in a browser.
 */

export {
  DESIGN_FORMAT, DESIGN_VERSION, DOCUMENT_KEYS, findMockup, MOCKUP_KEYS, mockupOptions, mockupPack, newDesign, readDesign,
  SECTION_KEYS, VIEW_KEYS, writeDesign,
  type DesignDocument, type DesignError, type DesignMockup, type DesignSection, type DesignView, type ReadResult,
} from "./document.js";
export {
  COALESCE_MS, DESIGN_EVENTS, DesignSession, HISTORY_LIMIT, WRAP_DEFAULT,
  type ChangeKind, type CommandArgs, type CommandName, type DesignCommand, type CutResult, type HistoryOptions, type DesignListener, type DragSource, type DropCheck, type DropPosition, type DropZone, type DesignNotification, type DesignNotificationKind, type DesignSessionOptions, type Refused,
} from "./session.js";
export {
  applyTo, CARET_EVENT, CODE_COALESCE, CODE_SYNC_MS, CodeSync, READ_ONLY_NOTE,
  type CodeSpan, type CodeSyncOptions, type CodeViewLike,
} from "./code-sync.js";
export {
  activateDiagnostic, diagnosticEntries, diagnosticOffset, diagnosticTarget, NO_PROBLEMS, REVEAL_EVENT,
  type DiagnosticEntry, type DiagnosticLike, type DiagnosticTarget,
} from "./diagnostics.js";
export {
  centreAt, clampZoom, FIT_MARGIN, fitView, fromMinimap, minimapMapping, stepZoom, toMinimap, TRANSFORM_MAX, unionBox, viewBox,
  ZOOM_MAX, ZOOM_MIN, ZOOM_STEPS, zoomAt, zoomRendering,
  type CanvasBox, type CanvasView, type MinimapMapping,
} from "./canvas.js";
export type { EditOp, EditRefusal, EditResult } from "../core/syntax/edit.js";
export type { SyntaxTree, TextEdit, ViewNode } from "../core/syntax/tree.js";
export {
  addArgument, addModifier, fieldCode, iconSuggestions, inspect, INSPECTOR_DEBOUNCE_MS, NOT_UNDERSTOOD, removeField, removeModifier,
  setField, setOption, STATE_LABELS,
  type FieldResult, type FieldTarget, type FieldValue, type Inspection, type InspectorControl, type InspectorField, type InspectorModifier, type ValueForm,
} from "./inspect.js";
