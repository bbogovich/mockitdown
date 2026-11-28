/**
 * The mockitdown TypeScript core (A-WEB-1): language, evaluation, packs, diagnostics and options.
 * It touches no DOM, network or file system (A-WEB-1.K1); assets reach it through `loadAssets`.
 */

export { check, errorHtml, evaluate, render, RenderResult, stylesheet, type Evaluation } from "./api.js";
export { AssetResolver } from "./asset-resolver.js";
export { iconSvg, normalize as normalizeIconName, resolveIcon } from "./icons.js";
export { anchorPrefix, elementsTable, Renderer, renderScreen } from "./render/index.js";
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
export { Interpolation, Lexer, Token, tokenize, type Comment } from "./syntax/lexer.js";
export { parse, Parser } from "./syntax/parser.js";
export {
  applyEdits, parseTree, reparse, SyntaxTree, ViewNode, type Span, type TextEdit, type TreeResult, type ViewNodeKind,
} from "./syntax/tree.js";
export * as pyformat from "./pyformat.js";
export * as values from "./values.js";
export { IGNORED, NEUTRAL_MODULES, RENDERED, setVocabulary } from "./vocabulary.js";
