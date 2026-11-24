# mockitdown — implementation

How the code on `main` realizes the specification: modules, data flow, build and run, configuration,
decisions taken in code and known debt. Pages cite the A- and R- items they realize.

- [Architecture](architecture/index.md)

## Build and run

- Build: `python3 -m pip install -e .`
- Test: `python3 -m unittest discover -s tests`
