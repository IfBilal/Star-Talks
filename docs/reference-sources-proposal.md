# Proposed reference sources (draft for client review)

Prepared 2026-10-15 (client decision 2 in `milestone-2-client-directives.md`). Not legal advice. Status column: **Found** = located by search in this session; **To verify** = plausible but not confirmed, must be checked before use. Copyright conclusions are my own reading of the sources and need a final check.

## How we will use sources

- We write our **own rule summaries** (planet in house, card meaning, number meaning, etc.), each cited to the book and chapter/section. The model receives those rules by ID. We do not copy passages from books still in copyright.
- Where a source is public domain, short quotes are fine, with citation.
- Each rule record stores: rule ID, source, edition, location in source, our wording, version.
- Nothing from a source we have not seen. If we cannot read a book, we do not cite it.

## Sources by system

### Lal Kitab
| Source | Status | Notes |
|---|---|---|
| Pt. Roop Chand Joshi, the five classics: *Lal Kitab ke Farman* (1939), *Lal Kitab ke Arman* (1940), third volume (1941), *Tarmeem Shuda* (1942), *Ilm-e Samudrik ki Buniyad par ki Lalkitab* (1952). Original language Urdu. | Found ([Wikipedia](https://en.wikipedia.org/wiki/Lal_Kitab), [Internet Archive: 1941 volume](https://archive.org/details/LalKitab1941)) | Titles, years and volume names differ between sources; check the scans themselves. Authorship is disputed (some sources say Joshi wrote it down from an anonymous original). |
| *A Text Book of Lal Kitab* (English, based on the five classics, 2023) | Found ([listing](https://www.bookswagon.com/book/pt-roopchand-joshis-a-text/978b0cmb1gwxb)) | Modern translation/compilation: copyrighted, not a primary source. Useful only as a cross-check. |

Copyright: Joshi is reported to have died 24 Dec 1982 (from low-quality web sources). India's term is author's life plus 60 years from the next calendar year, so his works would stay protected until 2043 ([term summary](https://thelegalschool.in/blog/copyright-time-period-in-india)). The disputed authorship could change which rule applies. So: **treat as in copyright**, use own cited summaries only, no copied text. Practical check (2026-10-15): the [Internet Archive 1941 volume](https://archive.org/details/LalKitab1941) is a 521-page **Hindi (Devanagari) edition**, readable page by page as images. Its embedded text layer is garbled (legacy font), so extraction must be done by reading the page images, not copy-paste. No Urdu reviewer is needed for this volume. The other four volumes have not been located yet.

### Vedic astrology
| Source | Status | Notes |
|---|---|---|
| *Brihat Parashara Hora Shastra* (classical Sanskrit) | Found | The original is ancient. The English translations (R. Santhanam, Ranjan Publications 1984, reprint 2023; G.C. Sharma, Sagar Publications 2006) are probably copyrighted: do not copy. |
| *Brihat Jataka* (Varahamihira), *Phaladeepika* (Mantreswara), *Saravali* (Kalyanavarma), *Jataka Parijata* | To verify | Classical texts. Need to find old public-domain English translations and check each one. |

### Tarot
| Source | Status | Notes |
|---|---|---|
| A.E. Waite, *The Pictorial Key to the Tarot* (1911 edition, W. Rider & Son) | Found ([sacred-texts](https://sacred-texts.com/tarot/pkt/pkttp.htm)) | Site states text and plates are public domain in the US (published before 1923). Waite died 1942, Pamela Colman Smith (artist) 1951: by my reading public domain in India (life+60) and the UK (life+70) as well. Use this specific scan and record it. |

### Numerology (Pythagorean, the system we implement)
| Source | Status | Notes |
|---|---|---|
| Public-domain Pythagorean author (e.g. L. Dow Balliett, *Number Vibrations*) | To verify | The search found nothing confirming it. Cheiro's *Book of Numbers* is a scan on [archive.org](https://archive.org/details/in.ernet.dli.2015.70770) but Cheiro's system is Chaldean and publication dating (1935) needs checking, so it is not a match for our system. |

The letter-to-number table and reduction rules are a convention. Meanings will be our own wording; we will name whichever source supports each meaning.

### Chinese BaZi
| Source | Status | Notes |
|---|---|---|
| *Yuanhai Ziping* (Song dynasty, Xu Dasheng), *Di Tian Sui*, *Zi Ping Zhen Quan* | Found ([Yuanhai Ziping](https://en.wikipedia.org/wiki/Yuanhai_Ziping)) | Chinese originals are centuries old (full Chinese text of Yuanhai Ziping is on Wikisource). No public-domain English translation found; modern translations are copyrighted. |

### Korean Saju
| Source | Status | Notes |
|---|---|---|
| Korean works on the same classics (e.g. Korean editions of *Yuanhai Ziping*) | To verify | Nothing found yet that defines a distinct Saju tradition. Must find a documented Korean source before we call Saju separate from BaZi. |

### Palmistry
| Source | Status | Notes |
|---|---|---|
| Cheiro, *Language of the Hand* (1894) | Found ([HathiTrust full view](https://catalog.hathitrust.org/Record/011594957)) | Full-view scan. Cheiro died 1936, so likely public domain in India as well; confirm edition. |
| W.G. Benham, *The Laws of Scientific Hand Reading* (1900) | To verify | Only reprints found. Locate a verified scan. |

### Face reading (Mian Xiang)
| Source | Status | Notes |
|---|---|---|
| *Ma Yi Xiang Fa*, *Shen Xiang Quan Bian* (classical Chinese) | To verify | No English public-domain translation found. The tradition is documented only in Chinese originals unless we find one. |

All face-reading output stays symbolic and limited to visible features, as the client specified.

## Gaps and what they mean

- **Lal Kitab** is the hardest: copyrighted, Urdu, disputed authorship. A reliable ruleset needs someone able to read the Urdu originals.
- **Numerology, Saju, Face reading:** no confirmed public-domain English source yet. Until found, those modules' meanings are based on our own wording, clearly labelled as general tradition, not a cited rule.
- Anything marked "To verify" must not be cited to the client as a source until checked.
