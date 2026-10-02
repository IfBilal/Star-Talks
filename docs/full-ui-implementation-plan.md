# Star Talks — Full UI Build Plan (all screens, UI only)

## Goal

Build **every in-scope screen** of the app as a pixel-faithful UI and link them together so the whole product can be walked through end to end and shown to the client. Only the UI and navigation are built now. The real behaviour (AI, payments, wallet, ads, courses, support, etc.) is implemented in later phases, screen by screen, on top of these screens.

Source of truth for visuals: `docs/ui.jpeg`, `docs/Aurelia - Dev Plan.docx.pdf` (37 embedded mockup images, extracted to `docs/reference/`). Source of truth for scope: `docs/Aurelia_AI_Proposal.pdf`. Brand is **Star Talks** everywhere (never Aurelia / AstroSage).

## Scope rules

1. **In scope** = every screen in the dev plan that the proposal keeps (section 5 "Everything else included").
2. **Out of scope** (proposal section 6), so no screens and no actionable entry points: astrologer discovery/profile/search, chat/audio/video consultation, astrologer app and flow, "Human Astrology" / "Talk to an Astrologer", consultation history and notifications, call/video connection errors, placement/career opportunities, iOS.
3. **Admin dashboards** (AstraAdmin, Stellar Academy, AdCentral, AstroVerify images) are a separate web admin panel delivered in Milestone 4. They are not part of the mobile UI batch.
4. Where an in-scope mockup contains an out-of-scope element (e.g. a "Consultations" tab or a "Chat History" row), the layout is kept and that single element is removed. Every removal is listed in "Deviations from mockup" below.
5. Where the spec requires a screen but no mockup exists (e.g. course details, add-money, ticket list), the screen is **derived** from the closest mockup's components and spacing, and is marked *derived* in the inventory.
6. No real functionality: buttons navigate, toggles toggle, tabs switch, form fields accept input, but nothing is persisted or sent. Existing working flows (login, signup, reset password, profile save, birth details, real logout) keep working.

## Design system (extracted from the mockups)

Built once in `src/components/ui/`, then reused by every screen so spacing and colours cannot drift.

- Colours: sampled from the mockups (indigo primary, lavender tints, warm ivory background, gold accent, success green, danger red). Tokens live in `src/constants/theme.ts`.
- Type: Poppins (already loaded). Sizes/weights measured per element from the reference crops.
- Components: `AppBar` (back, title, right actions, brand-logo variant with hamburger/bell), `TabBar` (Home, Courses, AI, Reports, Profile), `Card`, `ListRow` (icon tile, title, subtitle, chevron, value), `Chip`/`Pill` filters, `Toggle`, `Stepper`, `ProgressBar`, `SectionHeader`, `PrimaryButton` (exists), `OutlineButton`, `SegmentedTabs`, `IconTile`, `Sheet`, `EmptyState`, `Avatar`.
- Icons: `lucide-react-native`, line weight matched to the mockups.
- Artwork (moon/sunrise banners, certificates, tarot cards, hand line art) drawn as native vector (SVG) or built from the supplied crops; no external downloads.

## Navigation model

- Bottom tab bar (matches the later mockups): **Home · Courses · AI · Reports · Profile**. The "Chat"/"Consultations" tab from the early mockups is excluded.
- Each main screen renders the shared `TabBar` with the correct tab highlighted (as in the mockups, sub-screens under Profile keep Profile highlighted). Tab taps `replace`; details `push`; back is `router.back()`.
- Route map lives in this file (below) and in `src/app`.
- Existing onboarding routes stay: `/`, `/region`, `/language`, `/auth`, `/auth/callback`, `/auth/reset-password`, `/birth-details`, `/home`. The existing onboarding "profile setup / edit profile" screen moves to `/profile-setup` so `/profile` can be the Profile tab.
- Onboarding flow becomes exactly the JPEG order: Splash → Region → Language → Login → Profile Setup → Birth Details → **Palm Photo → Permissions** → Home.

## Screen inventory

Legend: **exists** = built and verified earlier, **new** = to build, *derived* = no mockup, built from the closest one. Source = image in `docs/reference/` (page of the dev plan PDF).

### A. Onboarding (ui.jpeg)
| ID | Screen | Route | Status | Source |
|---|---|---|---|---|
| A1 | Splash | `/` | exists | ui.jpeg 1 |
| A2 | Region selection | `/region` | exists | ui.jpeg 2 |
| A3 | Language selection | `/language` | exists | ui.jpeg 3 |
| A4 | Login / Sign up (+forgot, reset sent, confirmation) | `/auth` | exists | ui.jpeg 4 |
| A5 | Profile setup | `/profile-setup` | exists (moved) | ui.jpeg 5 |
| A6 | Birth details | `/birth-details` | exists | ui.jpeg 6 |
| A7 | Palm photo upload | `/palm-photo` | new | ui.jpeg 7 |
| A8 | Permissions | `/permissions` | new | ui.jpeg 8 |

### B. Home
| B1 | Home (hero, service tiles, ad strip, **Watch Ads & Earn**, **Refer & Earn**, new tab bar, links) | `/home` | exists → update | ui.jpeg 9, p1 img 1-2 |

### C. AI Astrology (p15 image, 12 screens)
| C1 | AI Astrology main (module grid) | `/ai` | new | p15 #1 |
| C2 | Choose a module (list) | `/ai/modules` | new | p15 #2 |
| C3-C8 | Module screen with First Reading: Vedic, Tarot, Palmistry, Numerology, Western, Lal Kitab | `/ai/[module]` | new | p15 #3-#8 |
| C9 | Chinese Zodiac, Korean Astrology, Face Reading first reading | `/ai/[module]` | new, *derived* | pattern of #3-#8 |
| C10 | Professional reading style answer | `/ai/[module]` (thread state) | new | p15 #9 |
| C11 | Follow-up question with Tarot spread | `/ai/tarot` (thread state) | new | p15 #10 |
| C12 | Module protection example | thread state | new | p15 #11 |
| C13 | Conversation history (by module, search) | `/ai/history` | new | p15 #12 |
| C14 | Response feedback sheet (like / dislike / reasons / report) | sheet | new, *derived* | spec §"AI – Feedback" |
| C15 | AI Safety & Responsible Responses | `/ai/safety` | new | p24 img 27 |

### D. Reports (p4 image, 7 screens)
| D1 | Astrology Reports (types) | `/reports` | new | p4 #1 |
| D2 | Enter birth details (stepper) | `/reports/birth-details` | new | p4 #2 |
| D3 | Select report (prices) | `/reports/select` | new | p4 #3 |
| D4 | Generating | `/reports/generating` | new | p4 #4 |
| D5 | Preview / payment (Overview·Planets·Houses) | `/reports/preview` | new | p4 #5 |
| D6 | Report ready (download, save, share, Ask AI) | `/reports/ready` | new | p4 #6 |
| D7 | Report history (All / Saved) | `/reports/history` | new | p4 #7 |

### E. Profiles & compatibility
| E1 | My Profiles | `/profiles` | new | p22 img 19 |
| E2 | Add New Profile step 1 Personal | `/profiles/new` | new | p20 img 18 |
| E3 | Add profile step 2 Birth details, step 3 Optional | `/profiles/new` (steps) | new, *derived* | E2 + A6 |
| E4 | Compatibility analysis (select two + type) | `/compatibility` | new | p21 img 20 (left) |
| E5 | Compatibility result (Overview·Strengths·Challenges·Timing) | `/compatibility/result` | new | p21 img 20 (right) |

### F. Daily astrology
| F1 | Daily Horoscope | `/daily` | new | p22 img 21 (left) |
| F2 | Daily guidance intro ("A little guidance every day") | `/daily/intro` | new | p22 img 21 (right) |

### G. Courses
| G1 | Courses home (banner, search, categories, popular) | `/courses` | new | p15 img 9 |
| G2 | Course list by category / search | `/courses/category` | new, *derived* | G1 |
| G3 | Course details + enroll | `/courses/[id]` | new, *derived* | G1 + G5 |
| G4 | Payment (order summary, coupon, method) | `/payment` | new | p17 img 13 |
| G5 | Lesson player | `/courses/[id]/lesson` | new | p16 img 10 |
| G6 | Course completed / certificate | `/courses/[id]/certificate` | new | p16 img 11 |
| G7 | My courses / progress | `/courses/mine` | new, *derived* | H1 |

### H. Wallet, credits, ads, payments
| H1 | Wallet & AI Credits (Credit History / Transactions) | `/wallet` | new | p17 img 14 (left) |
| H2 | Earn credits (watch ads, dark) | `/earn-credits` | new | p17 img 14 (right) |
| H3 | Add money | `/wallet/add-money` | new, *derived* | H1 |
| H4 | Buy AI credit packages | `/wallet/buy-credits` | new, *derived* | H1 + G4 |
| H5 | Payment success | `/payment/success` | new, *derived* | G4 |
| H6 | Offers & Coupons | `/offers` | new | p24 img 25 |
| H7 | Refer & Earn (+ referral history) | `/refer` | new | p23 img 24 |

### I. Notifications, history
| I1 | Notification settings | `/notifications/settings` | new | p19 img 15 (left) |
| I2 | Notifications list (All/Courses/Offers…) | `/notifications` | new | p19 img 15 (right) |
| I3 | User History (filters + lists + AI history by module) | `/history` | new | p19 img 16 |

### J. Profile & settings
| J1 | Profile tab (menu) | `/profile` | new | p20 img 17 |
| J2 | Language & Region settings | `/settings/language` | new | p22 img 22 |
| J3 | Currency preferences | `/settings/currency` | new, *derived* | J2 |
| J4 | Account settings / security / privacy / legal | `/settings/account` | new | p24 img 26 |
| J5 | Change password, Login & device management | `/settings/password`, `/settings/devices` | new, *derived* | J4 |
| J6 | Privacy policy, Terms, Consent management, Data protection | `/legal/[page]` | new, *derived* | J4 |
| J7 | Delete account / data deletion request / delete conversations / delete saved profiles (confirmation screens) | `/settings/delete/[kind]` | new, *derived* | J4 |
| J8 | Certificates | `/certificates` | new, *derived* | G6 |

### K. Support, discovery, feedback, errors
| K1 | Help & Support | `/support` | new | p23 img 23 (left) |
| K2 | Create Support Ticket (3 steps) | `/support/new` | new | p23 img 23 (right) |
| K3 | FAQs, support chat, ticket list, ticket detail | `/support/faqs`, `/support/chat`, `/support/tickets`, `/support/tickets/[id]` | new, *derived* | K1 |
| K4 | Search & Discover (global: courses, reports, saved) | `/search` | new, *derived* (mockup is astrologer search) | p28 img 32 |
| K5 | My Favourites / saved items | `/saved` | new | p28 img 33 |
| K6 | Feedback & ratings | `/feedback` | new | p28 img 34 |
| K7 | Error states (no internet, payment failed, AI failed, calculation error, ad unavailable) | `/error` | new | p29 img 35 |

Total: 8 onboarding + 1 home + ~55 new screens/states.

## Link map (what leads to what)

- Home: bell → I2; ask bar → C1; tiles AI Astrology → C1, Reports → D1, Courses → G1, Wallet & Credits → H1, consultation tiles inert; ad strip / Watch Ads & Earn → H2; Refer & Earn → H7; profile avatar → J1; tabs → G1 / C1 / D1 / J1.
- AI: C1 → C2 → C3-C9 → thread states C10-C12, feedback C14; history C13; safety C15; "Ask AI about this report" (D6) → C10 thread.
- Reports: D1 → D2 → D3 → D4 → D5 → G4 payment → D6 → D7; D6 → Ask AI.
- Courses: G1 → G2 → G3 → G4 → H5 → G5 → G6 → J8.
- Wallet: H1 → H3 / H4 → G4 → H5; H1 → H2; coupons H6 from G4.
- Profile J1: Edit Profile → `/profile-setup`, Birth Details → `/birth-details`, Language / Country / Currency → J2/J3, Notification Settings → I1, Account/Security → J4, View History → I3, Certificates → J8, Wallet → H1, AI Credit Balance → H1, Saved Profiles → E1, Privacy → J4, delete rows → J7, Logout from all devices → real sign-out.
- E1 → E2/E3; E1 → E4 → E5 → Ask AI.
- Support K1 → K2/K3; feedback K6; errors K7 reached from "Try again" states.

## Deviations from mockup (out-of-scope removals)

Recorded here as the screens are built (e.g. consultation tabs/rows, call and video error tiles, astrologer cards, placement module).

## Build order

1. Reference extraction: split composite mockups into per-screen crops in `docs/reference/`, sample colour tokens.
2. Design system + `TabBar` + `AppBar` + shared components, verified in isolation.
3. Onboarding completion (A7, A8) and Home update (B1), route reshuffle (`/profile-setup`).
4. AI (C), Reports (D), Courses (G), Wallet/Ads (H), Profile & settings (J), Notifications/History (I), Profiles/Compatibility/Daily (E, F), Support/Search/Saved/Feedback/Errors (K).
5. After each batch: type-check, unit tests, screenshot every screen and compare with the reference crop, fix differences, re-run.

## Verification method

- Headless Chrome renders each route from the Expo web build at 390 x 844 (phone) and the screenshot is placed beside the reference crop; differences in spacing, colour, size, type and icon are fixed until they match.
- `npx tsc --noEmit` and `npx jest` after every batch.
- Tap-through test of every link in the link map (a navigation test that renders each screen and presses each navigable element).
- Final: real-device pass in Expo Go, then an APK build.

## Known limits

- The mockups are low resolution (a screen is often 250-400 px wide), so text that is unreadable in the source is reproduced from context and the spec; sizes and positions are measured from the crops.
- Some mockups are Aurelia/AstroSage branded; Star Talks branding replaces them.
- Admin dashboards and all excluded astrologer features are not built.
