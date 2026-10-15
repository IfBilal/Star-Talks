# Calculation engine and licence recommendation

Prepared 2026-10-15 for the client's request (decision 3 in `milestone-2-client-directives.md`).

## Recommendation

**Do not buy the Swiss Ephemeris licence. Keep the current engine** (`astronomy-engine`, MIT licence, plus our own Lahiri ayanamsa formula). Measured against Swiss Ephemeris, it is accurate to well under one arcminute for birth years 1900-2050. Missing features (yogas, divisional charts, true node) are our own code to write and do not need Swiss Ephemeris.

## Licence facts (from Astrodienst's own pages)

Sources: [licence choice](https://www.astro.com/ftp/swisseph/LICENSE), [licence info](https://www.astro.com/swisseph/swephinfo_e.htm), [price page](https://www.astro.com/swisseph/swephprice_e.htm), [Professional contract, Sept 2026](https://www.astro.com/swisseph/secont_e_2609.pdf).

| Option | What it means for Star Talks |
|---|---|
| **AGPL (free)** | Must be chosen before any public service using it is activated. Obliges "the whole software project" to be placed under the AGPL or a compatible licence. In practice the whole app and backend would have to be open source. This conflicts with the proposal's ownership terms, so it is not suitable. |
| **Professional licence, CHF 700** | "Unlimited number of projects" for one licensee. Valid for distributed apps and for server-side use. An app that asks a server to calculate counts as an app containing Swiss Ephemeris. Source disclosure is not required. |

Contract points the proposal did not mention:
- **Valid for 6 years, then must be renewed** (clause 4). The proposal described it as a one-time cost.
- **No API services for third parties** without that third party buying their own licence, and the licensee must tell Astrodienst who they are (clause 3).
- The licensee must hold the app's copyright (clause 2). It is transferable to another party with notice (clause 14), which matters because the client must own everything.
- Authors' names may not be used in documentation or promotion (clause 9). Copyright notices must stay (clause 10). A sample copy of a distributed app must be given on request (clause 7).
- No warranty of correctness (clause 8). Payment is by an online shop and the contract must be signed and returned, so it needs the client's own details.

## Accuracy test of the current engine

Method: the same birth instants and places run through our calculator and through Swiss Ephemeris (Lahiri sidereal, Moshier ephemeris, whole-sign), on fictional births. Scripts: `scripts/validation/`. Swiss Ephemeris was used only as a local test reference.

Differences (ours minus Swiss Ephemeris), in **arcminutes** (1 arcminute = 1/60 degree):

| Birth | Ayanamsa | Ascendant | Moon | Saturn | Rahu (mean node) |
|---|---:|---:|---:|---:|---:|
| 1900 | 0.04 | 0.23 | 0.25 | 0.07 | -0.05 |
| 1930 | 0.01 | -0.16 | -0.13 | -0.16 | -0.02 |
| 1950 | 0.00 | -0.09 | -0.03 | -0.07 | 0.00 |
| 1960 (Lucknow) | -0.02 | 0.06 | 0.02 | -0.11 | 0.02 |
| 1985 (Delhi) | -0.01 | -0.28 | -0.21 | -0.17 | 0.01 |
| 1992 (Mumbai) | 0.01 | 0.26 | 0.25 | 0.25 | -0.01 |
| 2000 (Kolkata) | 0.01 | -0.21 | -0.24 | -0.22 | -0.01 |
| 2008 (Dhaka) | 0.00 | 0.11 | 0.15 | 0.15 | 0.00 |
| 2025 | -0.01 | 0.04 | 0.09 | -0.09 | 0.02 |
| 2050 | 0.00 | 0.25 | 0.40 | 0.15 | 0.01 |
| 2100 | 0.03 | 0.07 | 1.12 | -0.01 | -0.03 |
| lat 60 N, 1990 | -0.01 | 0.17 | 0.25 | 0.22 | 0.01 |
| lat 34 S, 1990 | -0.01 | 0.14 | 0.25 | 0.22 | 0.01 |

Also checked: Sun, Mars and Jupiter show the same pattern (at most 0.3 arcminutes). Worst case for any birth year from 1900 to 2050 is about 0.4 arcminutes (roughly 24 arcseconds). In that worst case the Moon-based dasha start would shift by about 2-3 days at most; a nakshatra boundary is 13 degrees 20 minutes wide.

Limits of this test: one reference engine (Swiss Ephemeris with its built-in Moshier ephemeris, not the full data files), fictional births, planets plus mean node only. Not yet independently checked: time-zone and DST resolution, yogas, divisional charts, true node. A second reference (e.g. JPL Horizons) should be added before claiming validation.

## What is still to build (no licence needed)

- Yoga detection, navamsa and other divisional charts, true node option, more dasha levels (antardasha).
- A reference test suite built from these fixtures plus independent published charts.
- The calculator version number must change whenever the formulas change.

## For the client

- Swiss Ephemeris would only be needed for features we do not plan, or if a stricter reference standard is wanted. It is a decision we can revisit later at no loss.
- Savings: CHF 700 now plus a renewal every 6 years, and no contract obligations.
