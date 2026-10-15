# Chart accuracy check (dev-only)

Compares our calculator (`src/features/astrology/chart.ts`) with Swiss Ephemeris (Lahiri, sidereal, Moshier).
Swiss Ephemeris is used **only as a local test reference** (`pip install pyswisseph` in a throwaway venv). It is AGPL/commercial: never ship or import it in the app.

    CASES='[{"id":"x","utc":"1985-03-14T05:00:00Z","lat":28.61,"lon":77.21}]'
    node scripts/validation/chart-ours.mjs "$CASES" > ours.json
    python scripts/validation/chart-swisseph-reference.py "$CASES" > ref.json

Diff each field (degrees x 60 = arcminutes). Results are recorded in `docs/calculation-engine-licence-recommendation.md`.
