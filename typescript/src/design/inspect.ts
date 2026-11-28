/**
 * The inspector's model (R-TOOL-007): what `mockitdown-inspector` shows for the session's selection and
 * how a value typed into one of its controls becomes an edit. It lives beside the session, without DOM
 * access, so that the component holds no editing rule of its own (A-WEB-5.K2) and a host can drive the
 * same fields from its own UI.
 *
 *   const view = inspect(session, "mui");          // the groups, fields and Add lists for the selection
 *   setField(session, view.state[0], "outlined");  // checked, then applied as one coalesced step
 *
 * The fields come from the typed parameter data (R-PACK-017): `parameterTypes(pack, element)` for the
 * element's arguments and `modifierTypes()` for its modifiers, so a new pack needs no inspector code.
 * A value is turned into code by its control ({@link fieldCode}); a value the control refuses, an edit
 * the edit API refuses, and an edit whose code would add a diagnostic located at the node are reported
 * and not applied (C9). Every applied edit passes the coalescing key `<node>:<field>` (R-EDIT-007.C5),
 * or `mockup:<name>:<option>` on the Mockup tab, so that one burst of typing forms one undo step.
 */

import type * as A from "../core/syntax/ast.js";
import type { Diagnostic } from "../core/diagnostics.js";
import { iconNames } from "../core/icons.js";
import { APPEARANCES, DEVICES } from "../core/options.js";
import { registry } from "../core/packs/registry.js";
import type { TypeSpec } from "../core/paramtypes.js";
import { parameterTypes, rolesLoaded } from "../core/roles.js";
import type { EditOp } from "../core/syntax/edit.js";
import type { SyntaxTree, ViewNode } from "../core/syntax/tree.js";
import { MODIFIER_GROUPS, modifierTypes, type ModifierGroup } from "../core/vocabulary.js";
import { mockupOptions, mockupPack } from "./document.js";
import { applyChecked, attrOf, notUnderstood, opFor, packOf, refuse, selected } from "./inspect-edits.js";
import {
  argsCode, codeOf, controlOf, defaultCode, leadingComment, matchArgs, modifierList, numberValue, readValue, stringOf, TEXT,
  valueCode, type ChainModifier,
} from "./inspect-values.js";
import type { DesignSession } from "./session.js";

/** The control a field is edited with (C3); `code` for a value the typed controls cannot express. */
export type InspectorControl = "text" | "number" | "switch" | "choice" | "color" | "icon" | "list" | "code" | "comment" | "readonly";

/** A field's value as its control shows it: null when the argument is not written. */
export type FieldValue = string | number | boolean | string[] | null;

/** How an enum or colour value is written: as a string literal or as an implicit member (`.title`). */
export type ValueForm = "string" | "enum";

/** Where a field's value is written, so that {@link setField} knows which edit to make. */
export type FieldTarget =
  | { kind: "argument"; label: string | null; position: number }
  | { kind: "state"; label: string; at: { kind: "argument" } | { kind: "modifier"; name: string; index: number } | { kind: "new"; modifier: boolean } }
  | { kind: "modifier"; name: string; index: number; arg: string }
  | { kind: "modifierCode"; name: string; index: number }
  | { kind: "id" }
  | { kind: "refs" }
  | { kind: "comment" }
  | { kind: "option"; key: string };

/** One field of the inspector. */
export interface InspectorField {
  /** The field's key within its node or mockup (the second part of the coalescing key). */
  readonly key: string;
  /** What the field is labelled with. */
  readonly label: string;
  readonly control: InspectorControl;
  /** Its type (R-PACK-017.C2), null for code, comment and read-only fields. */
  readonly type: TypeSpec | null;
  readonly value: FieldValue;
  /** The value's code as written, null when it is not written. */
  readonly code: string | null;
  /** Whether the argument (or option) is written. */
  readonly present: boolean;
  /** False for a labelled argument the element does not understand (C7, R-EVAL-004.C7). */
  readonly understood: boolean;
  /** Whether the field has a remove control. */
  readonly removable: boolean;
  /** The values a `choice` offers ("" first: unset), or the icon names an `icon` field suggests. */
  readonly choices?: readonly string[];
  /** The note shown with the field ("not understood by this pack"). */
  readonly note?: string;
  /** Where the value is written. */
  readonly target: FieldTarget;
  /** How an enum or colour value is written. */
  readonly form: ValueForm;
}

/** One modifier of the node's chain in the Modifiers group (C5). */
export interface InspectorModifier {
  readonly name: string;
  /** Its occurrence among the chain's modifiers of the same name. */
  readonly index: number;
  readonly group: ModifierGroup;
  /** Its arguments as written, without the parentheses. */
  readonly code: string;
  readonly fields: readonly InspectorField[];
}

/** What the inspector shows (C1, C10, C12). */
export interface Inspection {
  /** `node`: one node selected; `multiple`: several; `mockup`: none, the Mockup tab; `empty`: no mockup. */
  readonly view: "node" | "multiple" | "mockup" | "empty";
  readonly mockup: string | null;
  readonly pack: string | null;
  /** How many nodes are selected. */
  readonly count: number;
  readonly node: { readonly id: string; readonly name: string; readonly ordinal: string; readonly kind: string } | null;
  readonly arguments: readonly InspectorField[];
  readonly state: readonly InspectorField[];
  readonly modifiers: readonly { readonly group: ModifierGroup; readonly modifiers: readonly InspectorModifier[] }[];
  readonly identity: readonly InspectorField[];
  /** The labels Add argument offers (C2). */
  readonly addArguments: readonly string[];
  /** The modifiers Add modifier offers (C5). */
  readonly addModifiers: readonly string[];
  /** The Mockup tab's fields (C10). */
  readonly options: readonly InspectorField[];
  /**
   * The node's span when the inspector offers Edit in code (C11): the node is derived (an `if`, a
   * `ForEach` or a struct of the mockup, whose views the outline shows as derived) or has a value only a
   * code field can show (C13); else null.
   */
  readonly editInCode: { readonly start: number; readonly end: number } | null;
}

/** The outcome of an inspector edit: applied (or nothing to change), or why not. */
export type FieldResult = { ok: true } | { ok: false; error: string; diagnostics: Diagnostic[] };

/** The note of a labelled argument the element does not understand (C7). */
export const NOT_UNDERSTOOD = "not understood by this pack";
/** How long after the last input in a control its edit is applied, in milliseconds (C8). */
export const INSPECTOR_DEBOUNCE_MS = 150;
/** The state arguments Variant and state offers when the element's types name them (C4). */
export const STATE_LABELS: readonly string[] = ["selected", "disabled", "checked", "value"];

const IDENTITY_MODIFIERS = new Set(["id", "ref"]);

// --- reading --------------------------------------------------------------------------------------

/**
 * What the inspector shows for the session's selection (C1): the four groups of the single selected
 * node of the active mockup, the count of several (C12), or the Mockup tab when nothing is selected
 * (C10). `pack` is the pack the active mockup renders in, by default its document pack.
 */
export function inspect(session: DesignSession, pack?: string | null): Inspection {
  const name = session.active;
  const packId = name === null ? null : pack ?? mockupPack(session.document, name);
  const base = {
    mockup: name, pack: packId, count: session.selection.length, node: null,
    arguments: [], state: [], modifiers: [], identity: [], addArguments: [], addModifiers: [], options: [], editInCode: null,
  };
  if (name === null) return { ...base, view: "empty" };
  if (session.selection.length > 1) return { ...base, view: "multiple" };
  const tree = session.tree(name);
  const node = session.selection.length && tree ? tree.byId(session.selection[0]!) : null;
  if (!node || !tree) return { ...base, view: "mockup", options: mockupFields(session, name) };
  const p = packOf(packId);
  const info = { id: node.id, name: node.name, ordinal: node.ordinal, kind: node.kind };
  const identity = identityFields(tree, node);
  const span = { start: node.span.start, end: node.span.end };
  if (node.kind === "if") return { ...base, view: "node", node: info, identity: identity.filter((f) => f.key === "comment"), editInCode: span };
  const types: Record<string, TypeSpec> = p && rolesLoaded() ? parameterTypes(p, node.name) : {};
  const el = p?.element(node.name) ?? null;
  const call = node.kind === "call" ? node.syntax as A.Call : null;
  const args = call?.args ?? [];
  const src = tree.source;
  const unknown = notUnderstood(session.diagnostics(name));
  const chain = modifierList(node);

  // Variant and state (C4): written as an argument, as a modifier of the same name, or new.
  const state: InspectorField[] = [];
  const claimed = new Set<A.Node>();
  const stateLabels = new Set<string>();
  const labels: { label: string; type: TypeSpec }[] = [];
  if (el && el.variants.length) labels.push({ label: "variant", type: types.variant ?? { type: "enum", values: [...el.variants] } });
  for (const l of STATE_LABELS) if (types[l]) labels.push({ label: l, type: types[l]! });
  for (const { label, type } of labels) {
    stateLabels.add(label);
    const arg = args.find((a) => a.label === label);
    const mod = arg ? undefined
      : chain.find((m) => m.name === label) ?? (label === "variant" ? chain.find((m) => attrOf(p, m.name) === "variant") : undefined);
    let at: Extract<FieldTarget, { kind: "state" }>["at"];
    let valueNode: A.Node | null = null;
    let impliedTrue = false;
    if (arg) {
      at = { kind: "argument" };
      valueNode = arg.value;
    } else if (mod) {
      at = { kind: "modifier", name: mod.name, index: mod.index };
      claimed.add(mod.syntax);
      const margs = mod.call?.args ?? [];
      if (margs.length === 1 && margs[0]!.label === null) valueNode = margs[0]!.value;
      else if (!margs.length && type.type === "bool") impliedTrue = true;
    } else at = { kind: "new", modifier: attrOf(p, label) === label };
    const present = !!(arg || mod);
    state.push(typedField({
      key: `state:${label}`, label, type, valueNode, impliedTrue, src, present, removable: present,
      target: { kind: "state", label, at }, defaultForm: "string",
    }));
  }

  // Arguments (C2, C7): the positional parameters in order, then the labelled arguments in use.
  const argumentsOut: InspectorField[] = [];
  const positional = args.filter((a) => a.label === null);
  const params = el?.params ?? [];
  const labelled = new Set(args.map((a) => a.label).filter((l): l is string => l !== null));
  for (let i = 0; i < Math.max(params.length, positional.length); i++) {
    const param = params[i];
    const written = positional[i];
    // A parameter written with its label is listed once, as that labelled argument.
    if (!written && param !== undefined && labelled.has(param)) continue;
    const type = param === undefined ? null : types[param] ?? TEXT;
    argumentsOut.push(typedField({
      key: `position:${i}`, label: param ?? `argument ${i + 1}`, type, valueNode: written?.value ?? null, src,
      present: !!written, removable: !!written && i === positional.length - 1,
      target: { kind: "argument", label: null, position: i }, defaultForm: "string",
    }));
  }
  const used = new Set<string>();
  for (const a of args) {
    if (a.label === null) continue;
    used.add(a.label);
    if (stateLabels.has(a.label)) continue;
    const understood = !(a.loc && unknown.has(`${a.loc.line}:${a.loc.col}`));
    const type = understood ? types[a.label] ?? null : null;
    argumentsOut.push(typedField({
      key: `argument:${a.label}`, label: a.label, type, valueNode: a.value, src, present: true, removable: true,
      target: { kind: "argument", label: a.label, position: 0 }, defaultForm: "string", understood,
    }));
  }
  const addArguments = Object.keys(types).filter((l) => !used.has(l) && !stateLabels.has(l) && !params.includes(l)).sort();

  // Modifiers (C5): the chain grouped by the vocabulary's groups, without Identity's and Variant and state's.
  const specs = modifierTypes();
  const grouped = new Map<ModifierGroup, InspectorModifier[]>();
  const inChain = new Set<string>();
  for (const m of chain) {
    inChain.add(m.name);
    if (IDENTITY_MODIFIERS.has(m.name) || claimed.has(m.syntax)) continue;
    const spec = specs[m.name];
    const group: ModifierGroup = spec?.group ?? "other";
    const entry: InspectorModifier = {
      name: m.name, index: m.index, group, code: m.call ? argsCode(m.call, src) : "", fields: modifierFields(m, spec?.args ?? null, src),
    };
    const list = grouped.get(group) ?? [];
    list.push(entry);
    grouped.set(group, list);
  }
  const modifiers = MODIFIER_GROUPS.filter((g) => grouped.has(g)).map((g) => ({ group: g, modifiers: grouped.get(g)! }));
  const addModifiers = Object.keys(specs).filter((n) => !inChain.has(n) && !IDENTITY_MODIFIERS.has(n)).sort();

  // Edit in code (C11): a derived node, or a value only a code field shows.
  const derived = node.name === "ForEach" || tree.module.structs.some((st) => st.name === node.name);
  const codeOnly = [...argumentsOut, ...state, ...modifiers.flatMap((g) => g.modifiers.flatMap((m) => m.fields))].some((f) => f.control === "code");
  const editInCode = derived || codeOnly ? span : null;
  return { ...base, view: "node", node: info, arguments: argumentsOut, state, modifiers, identity, addArguments, addModifiers, editInCode };
}

// --- writing --------------------------------------------------------------------------------------

/**
 * The code a field's control makes of an input (C3, C9): `{code}` (null removes the argument), or
 * `{error}` for a value the control cannot accept. A list takes an array of item inputs.
 */
export function fieldCode(field: InspectorField, input: unknown): { code: string | null } | { error: string } {
  if (field.target.kind === "id" || field.target.kind === "comment") return { code: input === null ? null : String(input ?? "") };
  if (field.target.kind === "option") return { error: "a Mockup tab option is set with setOption" };
  return valueCode(field.control, field.type, input, field.form, field.removable || !field.present);
}

/**
 * Apply an input to a field of the selected node (C8, C9), or of the active mockup on the Mockup tab:
 * the control's code, then the edit, checked first by the edit API and by the diagnostics the edited
 * code would add at the node, then applied through the session as one change coalesced with
 * `<node>:<field>` (R-EDIT-007.C5). Nothing is applied when the control, the edit API or the check
 * refuses.
 */
export function setField(session: DesignSession, field: InspectorField, input: unknown): FieldResult {
  if (field.target.kind === "option") return setOption(session, field.target.key, input);
  const ctx = selected(session);
  if ("error" in ctx) return refuse(ctx.error);
  const { tree, node } = ctx;
  let op: EditOp | null;
  if (field.target.kind === "refs") {
    if (!Array.isArray(input) || input.some((x) => typeof x !== "string")) return refuse("the references are a list of texts");
    const refs = (input as string[]).map((r) => r.trim()).filter((r) => r !== "");
    op = refs.length || field.present ? { op: "setRefs", node: node.id, refs } : null;
  } else {
    const made = fieldCode(field, input);
    if ("error" in made) return refuse(made.error);
    op = opFor(tree, node, field, made.code);
  }
  if (op === null) return { ok: true };
  return applyChecked(session, node.id, op, `${node.id}:${field.key}`);
}

/** Remove a field's argument or modifier argument (C7: an argument the pack does not understand). */
export function removeField(session: DesignSession, field: InspectorField): FieldResult {
  if (!field.present) return { ok: true };
  if (field.target.kind === "option") return setOption(session, field.target.key, null);
  if (field.target.kind === "refs") return setField(session, field, []);
  const ctx = selected(session);
  if ("error" in ctx) return refuse(ctx.error);
  const op = opFor(ctx.tree, ctx.node, field, null);
  return op === null ? { ok: true } : applyChecked(session, ctx.node.id, op, `${ctx.node.id}:${field.key}`);
}

/** Add a labelled argument Add argument offers (C2), with the default value of its type: one step. */
export function addArgument(session: DesignSession, label: string, pack?: string | null): FieldResult {
  const ctx = selected(session);
  if ("error" in ctx) return refuse(ctx.error);
  const p = packOf(pack ?? mockupPack(session.document, session.active!));
  const type = p && rolesLoaded() ? parameterTypes(p, ctx.node.name)[label] : undefined;
  if (!type) return refuse(`${ctx.node.name} has no parameter ${JSON.stringify(label)}`);
  return applyChecked(session, ctx.node.id, { op: "setArgument", node: ctx.node.id, label, value: defaultCode(type) }, `${ctx.node.id}:argument:${label}`);
}

/** Add a rendered modifier Add modifier offers (C5) at the end of the chain, without arguments: one step. */
export function addModifier(session: DesignSession, name: string): FieldResult {
  const ctx = selected(session);
  if ("error" in ctx) return refuse(ctx.error);
  if (!modifierTypes()[name]) return refuse(`.${name} is not a rendered modifier`);
  const count = modifierList(ctx.node).filter((m) => m.name === name).length;
  return applyChecked(session, ctx.node.id, { op: "setModifier", node: ctx.node.id, name, index: count, args: "" }, `${ctx.node.id}:modifier:${name}:${count}`);
}

/** Remove one modifier of the selected node's chain (C5): one step. */
export function removeModifier(session: DesignSession, name: string, index = 0): FieldResult {
  const ctx = selected(session);
  if ("error" in ctx) return refuse(ctx.error);
  return applyChecked(session, ctx.node.id, { op: "setModifier", node: ctx.node.id, name, index, args: null }, `${ctx.node.id}:modifier:${name}:${index}`);
}

/**
 * Set one option of the active mockup from the Mockup tab (C10): `""` or null removes the mockup's own
 * value; a value the option's control refuses is reported and not applied. One `options` change,
 * coalesced with `mockup:<name>:<option>`.
 */
export function setOption(session: DesignSession, key: string, input: unknown): FieldResult {
  const name = session.active;
  if (name === null) return refuse("there is no active mockup");
  const mockup = session.mockup(name)!;
  const field = mockupFields(session, name).find((f) => f.key === `option:${key}`);
  if (!field || field.control === "readonly") return refuse(`${JSON.stringify(key)} is not an option the Mockup tab sets`);
  let value: unknown;
  if (input === null || input === "") value = null;
  else if (field.control === "number") {
    const r = numberValue(input, field.type as Extract<TypeSpec, { type: "number" }>);
    if ("error" in r) return refuse(r.error);
    value = r.value;
  } else if (field.control === "switch") value = input === true || input === "true";
  else if (field.control === "choice") {
    if (!field.choices!.includes(String(input))) return refuse(`${JSON.stringify(String(input))} is not one of ${field.choices!.filter(Boolean).join(", ")}`);
    value = String(input);
  } else value = String(input);
  const own: Record<string, unknown> = { ...(mockup.options ?? {}) };
  if (value === null) {
    if (!(key in own)) return { ok: true };
    delete own[key];
  } else {
    if (own[key] === value) return { ok: true };
    own[key] = value;
  }
  const r = session.setOptions(name, Object.keys(own).length ? own : null, { coalesce: `mockup:${name}:${key}` });
  return "error" in r ? refuse(r.error) : { ok: true };
}

/** The icon names an `icon` field suggests (C3); empty before the shared assets are loaded. */
export function iconSuggestions(): string[] {
  try {
    return iconNames();
  } catch {
    return [];
  }
}

// --- internals: fields ----------------------------------------------------------------------------

function typedField(o: {
  key: string; label: string; type: TypeSpec | null; valueNode: A.Node | null; impliedTrue?: boolean; src: string;
  present: boolean; removable: boolean; target: FieldTarget; defaultForm: ValueForm; understood?: boolean;
}): InspectorField {
  const understood = o.understood ?? true;
  const code = o.valueNode ? codeOf(o.valueNode, o.src) : o.impliedTrue ? "" : null;
  const base = {
    key: o.key, label: o.label, present: o.present, understood, removable: o.removable || !understood, target: o.target, code,
    ...(understood ? {} : { note: NOT_UNDERSTOOD }),
  };
  if (!o.type || !understood) return { ...base, control: "code", type: null, value: code, form: o.defaultForm };
  const read = o.valueNode ? readValue(o.type, o.valueNode) : { value: o.impliedTrue ? true : null, form: o.defaultForm };
  if (!read) return { ...base, control: "code", type: o.type, value: code, form: o.defaultForm };
  const choices = o.type.type === "enum" ? ["", ...o.type.values] : o.type.type === "icon" ? iconSuggestions() : undefined;
  return { ...base, control: controlOf(o.type), type: o.type, value: read.value, form: o.valueNode ? read.form : o.defaultForm, ...(choices ? { choices } : {}) };
}


/** The fields of one modifier: one per argument of its vocabulary entry, else one code field. */
function modifierFields(m: ChainModifier, spec: readonly { label: string | null; type: TypeSpec }[] | null, src: string): InspectorField[] {
  const args = m.call?.args ?? [];
  const asCode = (): InspectorField[] => {
    const code = m.call ? argsCode(m.call, src) : "";
    return [{
      key: `modifier:${m.name}:${m.index}`, label: "arguments", control: "code", type: null, value: code, code, present: true,
      understood: true, removable: false, target: { kind: "modifierCode", name: m.name, index: m.index }, form: "string",
    }];
  };
  if (!spec) return asCode();
  if (!spec.length) return args.length ? asCode() : [];
  const assigned = matchArgs(spec, args);
  if (!assigned) return asCode();
  const positional = spec.filter((x) => x.label === null).length;
  return spec.map((s, k) => {
    const argKey = s.label ?? `#${k}`;
    const a = assigned.get(argKey) ?? null;
    return typedField({
      key: `modifier:${m.name}:${m.index}:${argKey}`, label: s.label ?? (positional > 1 ? `value ${k + 1}` : "value"),
      type: s.type, valueNode: a?.value ?? null, src, present: !!a, removable: !!a,
      target: { kind: "modifier", name: m.name, index: m.index, arg: argKey }, defaultForm: "enum",
    });
  });
}


/** Identity (C6): `.id`, `.ref` and the comment lines leading the node. */
function identityFields(tree: SyntaxTree, node: ViewNode): InspectorField[] {
  const chain = modifierList(node);
  const id = chain.find((m) => m.name === "id");
  const ref = chain.find((m) => m.name === "ref");
  const idArg = id?.call?.args[0]?.value;
  const idText = idArg ? stringOf(idArg) : null;
  const refs = ref?.call ? ref.call.args.map((a) => stringOf(a.value)) : [];
  const comment = leadingComment(tree, node);
  return [
    {
      key: "id", label: "id", control: "text", type: TEXT, value: idText ?? (idArg ? codeOf(idArg, tree.source) : null),
      code: idArg ? codeOf(idArg, tree.source) : null, present: !!id, understood: true, removable: !!id, target: { kind: "id" }, form: "string",
    },
    {
      key: "refs", label: "ref", control: "list", type: { type: "array", items: TEXT }, value: refs.filter((r): r is string => r !== null),
      code: ref?.call ? argsCode(ref.call, tree.source) : null, present: !!ref, understood: true, removable: !!ref, target: { kind: "refs" }, form: "string",
    },
    {
      key: "comment", label: "comment", control: "comment", type: null, value: comment, code: comment, present: comment !== null,
      understood: true, removable: comment !== null, target: { kind: "comment" }, form: "string",
    },
  ];
}

/** The Mockup tab's fields (C10): the active mockup's name and options, inherited values shown. */
function mockupFields(session: DesignSession, name: string): InspectorField[] {
  const own = session.mockup(name)!.options ?? {};
  const merged = mockupOptions(session.document, name) ?? {};
  const field = (key: string, control: InspectorControl, type: TypeSpec | null, choices?: string[]): InspectorField => {
    const v = merged[key];
    const value: FieldValue = v === undefined || v === null ? (control === "switch" ? key === "caption" : null)
      : typeof v === "boolean" || typeof v === "number" ? v : String(v);
    return {
      key: `option:${key}`, label: key, control, type, value, code: null, present: key in own, understood: true,
      removable: key in own, target: { kind: "option", key }, form: "string", ...(choices ? { choices } : {}),
    };
  };
  const size: TypeSpec = { type: "number", min: 1 };
  return [
    {
      key: "option:name", label: "name", control: "readonly", type: null, value: name, code: null, present: true, understood: true,
      removable: false, target: { kind: "option", key: "name" }, form: "string",
    },
    field("pack", "choice", null, ["", ...[...registry.ids()].sort()]),
    field("device", "choice", null, ["", ...DEVICES.keys(), "fit"]),
    field("width", "number", size),
    field("height", "number", size),
    field("appearance", "choice", null, ["", ...APPEARANCES]),
    field("title", "text", TEXT),
    field("caption", "switch", { type: "bool" }),
    field("elements", "switch", { type: "bool" }),
  ];
}
