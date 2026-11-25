// Shared set-up for the unit tests: the package's shared assets loaded into the core once, and the
// repository paths the tests read. Tests run against dist/ (R-WEB-001.V1).
import { fileURLToPath } from "node:url";
import * as core from "../../dist/node.js";

/** The repository root (tests/unit and test-build/unit are both two levels below typescript/). */
export const REPO = fileURLToPath(new URL("../../../", import.meta.url));
export const PKG = fileURLToPath(new URL("../../", import.meta.url));
export const CONF = fileURLToPath(new URL("../../../shared/conformance/", import.meta.url));

let ready = false;

export function setup(): typeof core {
  if (!ready) {
    core.loadSharedAssets();
    ready = true;
  }
  return core;
}
