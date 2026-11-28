/**
 * The mockitdown TypeScript core (A-WEB-1): language, evaluation, packs, diagnostics and options.
 * It touches no DOM, network or file system (A-WEB-1.K1); assets reach it through `loadAssets`.
 */

export { check, errorHtml, evaluate, render, RenderResult, stylesheet, type Evaluation } from "./api.js";
export { AssetResolver } from "./asset-resolver.js";
export { iconNames, iconSvg, normalize as normalizeIconName, resolveIcon } from "./icons.js";
export { anchorPrefix, elementsTable, Renderer, RENDER_ROLES, renderScreen } from "./render/index.js";
export { sha1Hex } from "./sha1.js";
export { assetsLoaded, iconTable, loadAssets, pageCss, type SharedAssets, type SharedManifest } from "./assets.js";
export { clearComponents, registerComponents } from "./components.js";
export {
  Diagnostic, Diagnostics, Location, MockitdownError, MockitdownSyntaxError, type Severity,
} from "./diagnostics.js";
export { Env, Evaluator, formatValue, truthy, MAX_DEPTH, MAX_ITERATIONS, type ImportContext } from "./evaluate.js";
export { parseJson } from "./json.js";
export { CallValue, EnumValue, Modifier, Screen, Thunk, View, ViewList, walk, type Value } from "./model.js";
export {
  APPEARANCES, coerceFenceOptions, DEFAULT_OPTIONS, DEVICES, FENCE_OPTIONS, parseBool, renderOptions,
  type ImportResolver, type RenderOptions,
} from "./options.js";
export { ElementDef, Pack, PackRegistry, registerPack, registry, type PackData } from "./packs/registry.js";
export { buildStylesheet, minifyCss, packCss, scalePx, tokenCss } from "./styles.js";
export * as ast from "./syntax/ast.js";
export { highlight, Interpolation, Lexer, Token, tokenize, type Comment, type Highlight, type HighlightKind } from "./syntax/lexer.js";
export { parse, Parser } from "./syntax/parser.js";
export {
  applyEdits, parseTree, reparse, SyntaxTree, type CarriedRange, ViewNode, type Span, type TextEdit, type TreeResult, type ViewNodeKind,
} from "./syntax/tree.js";
export {
  edit, indentUnit, statementChildren, stringLiteral, type EditIndex, type EditOp, type EditRefusal, type EditResult, type InsertOp, type MoveOp, type NodeRef,
  type RemoveOp, type RenameOp, type SetArgumentOp, type SetCommentOp, type SetModifierOp, type SetNameOp, type SetRefsOp,
} from "./syntax/edit.js";
export { firstText, sampleCall } from "./syntax/sample.js";
export * as pyformat from "./pyformat.js";
export * as values from "./values.js";
export {
  IGNORED, MODIFIER_GROUPS, modifierTypes, NEUTRAL_MODULES, RENDERED, setVocabulary, type ModifierGroup, type ModifierType,
} from "./vocabulary.js";
export { normalizeType, PARAM_TYPES, type ParamTypeName, type TypeSpec } from "./paramtypes.js";
export {
  allowedChildren, canContain, expandAccepts, holdsChildren, parameterTypes, ROLE_CATEGORIES, roleReads, roleRule, rolesLoaded, setRoles,
  type AllowedChildren, type ContainResult, type RoleAttach, type RoleCategory, type RoleRule,
} from "./roles.js";
