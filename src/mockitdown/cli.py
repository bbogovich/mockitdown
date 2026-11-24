"""mockitdown command line. JSON on stdout, errors as {"error": ...}; exit 0 ok, 1 failed, 2 usage (policy impl-headless)."""
import argparse
import json
import sys


def run(argv: list) -> tuple:
    ap = argparse.ArgumentParser(prog="mockitdown")
    ap.add_argument("--version", action="store_true")
    a = ap.parse_args(argv)
    return 0, {"name": "mockitdown", "version": "0.1.0"} if a.version else {"name": "mockitdown"}


def main(argv: list = None) -> int:
    try:
        code, out = run(sys.argv[1:] if argv is None else argv)
    except SystemExit as e:          # argparse usage errors
        return int(e.code or 0)
    except Exception as e:           # never an empty stdout on failure
        code, out = 1, {"error": f"{type(e).__name__}: {e}"}
    print(json.dumps(out))
    return code


if __name__ == "__main__":
    sys.exit(main())
