import io
import json
import sys
import unittest
from contextlib import redirect_stdout

sys.path.insert(0, "src")
from mockitdown import cli  # noqa: E402


class CliTests(unittest.TestCase):
    def test_version_is_json(self):
        buf = io.StringIO()
        with redirect_stdout(buf):
            self.assertEqual(cli.main(["--version"]), 0)
        self.assertEqual(json.loads(buf.getvalue())["version"], "0.1.0")


if __name__ == "__main__":
    unittest.main()
