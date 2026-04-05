# PollStraw Mobile App - UI Redesign Plan (StrawPoll-Inspired)

## Context

Redesign PollStraw's mobile UI to match **StrawPoll.com's** clean, modern, minimal aesthetic. StrawPoll uses indigo/violet as primary -- we keep PollStraw's existing **Sky Blue (`#0EA5E9`)** as our primary, which is already established in the app's branding and works great across light/dark modes. Full dark + light theme support, user-friendly, with subtle polish.

### StrawPoll Design Language (What We're Matching)
- **Aesthetic:** Clean, minimal, professional yet friendly. Lots of whitespace.
- **Layout:** Linear top-to-bottom flows, card-based content, subtle borders.
- **Cards:** White bg, thin borders (`#e5e8eb`), subtle amber/accent top-border highlights.
- **Buttons:** Solid primary bg, white text, rounded.
- **Inputs:** Clean bordered, focus border = primary color.
- **Dark mode:** Full support. Dark bg `#111827`, card bg `#1f2937`, lighter primary for contrast.
- **Typography:** Clean sans-serif, clear hierarchy, muted secondary text.
- **Poll option colors:** `#3EB991`, `#FF7563`, `#AA66CC`, `#FFBB33`, `#FF8800`, `#33B5E5`
- **No heavy shadows** -- relies on borders and subtle elevation.
- **Low friction:** "No signup required" messaging, progressive disclosure via "Show advanced settings".

### Primary Color Choice: Sky Blue `#0EA5E9` (existing)
Why: Already the app's brand color, clean and modern, excellent contrast in both light/dark modes, pairs well with amber accent highlights (like StrawPoll's signature top-borders), and conveys trust/openness for a polling platform.

---

## 1. Design System & Theme Architecture

### 1.1 New Files to Create

```
mobile/src/theme/
  types.ts              -- ThemeColors interface, ThemeMode type
  lightTheme.ts         -- light color tokens
  darkTheme.ts          -- dark color tokens
  tokens.ts             -- spacing, radii, typography, shadows (shared)
  ThemeContext.tsx       -- React Context + ThemeProvider
  useTheme.ts           -- convenience hook
  index.ts              -- barrel export
```

### 1.2 ThemeProvider Architecture

- React Context: `{ mode: 'light'|'dark', theme: ThemeColors, toggleTheme(), setTheme() }`
- Persists to AsyncStorage using existing `STORAGE_KEYS.THEME` in [constants.ts](mobile/src/constants/index.ts)
- Wraps app in [App.tsx](mobile/App.tsx): `<ThemeProvider>` > `<SafeAreaProvider>` > `<NavigationContainer theme={navTheme}>`
- StatusBar: `style="dark"` in light mode, `style="light"` in dark mode
- React Navigation receives mapped theme via `theme` prop

### 1.3 Migration Strategy

Replace `import { colors } from '@/theme/colors'` with `const { theme } = useTheme()` in every file. Replace `colors.primary[500]` with `theme.primary`, `colors.gray[900]` with `theme.textPrimary`, etc. Can migrate one screen at a time.

---

## 2. Color Palette

### Semantic Tokens (StrawPoll-style with Sky Blue primary)

| Token | Light | Dark |
|---|---|---|
| **Backgrounds** | | |
| `background` | `#F9FAFB` | `#111827` |
| `backgroundElevated` | `#FFFFFF` | `#1F2937` |
| `surface` | `#FFFFFF` | `#1F2937` |
| `surfaceHover` | `#F3F4F6` | `#374151` |
| `surfacePressed` | `#E5E7EB` | `#4B5563` |
| `surfaceSubtle` | `#F3F4F6` | `#1A2332` |
| **Borders** | | |
| `border` | `#E5E8EB` | `#374151` |
| `borderSubtle` | `#F3F4F6` | `#2D3748` |
| `borderAccent` | `#FBBF24` (amber top-border, like StrawPoll) | `#F59E0B` |
| **Text** | | |
| `textPrimary` | `#111827` | `#F9FAFB` |
| `textSecondary` | `#6B7280` | `#9CA3AF` |
| `textTertiary` | `#9CA3AF` | `#6B7280` |
| `textOnPrimary` | `#FFFFFF` | `#FFFFFF` |
| **Primary (Sky Blue)** | | |
| `primary` | `#0EA5E9` | `#38BDF8` |
| `primaryHover` | `#0284C7` | `#7DD3FC` |
| `primarySubtle` | `#F0F9FF` | `#0C4A6E` |
| `primaryLight` | `#38BDF8` | `#0EA5E9` |
| **Accent (Amber, for highlights)** | | |
| `accent` | `#F59E0B` | `#FBBF24` |
| `accentSubtle` | `#FFFBEB` | `#78350F` |
| **Semantic** | | |
| `success` | `#10B981` | `#34D399` |
| `successSubtle` | `#ECFDF5` | `#064E3B` |
| `warning` | `#F59E0B` | `#FBBF24` |
| `warningSubtle` | `#FFFBEB` | `#78350F` |
| `error` | `#EF4444` | `#F87171` |
| `errorSubtle` | `#FEF2F2` | `#7F1D1D` |
| `info` | `#3B82F6` | `#60A5FA` |
| `infoSubtle` | `#EFF6FF` | `#1E3A5F` |
| **UI Elements** | | |
| `tabBarBg` | `#FFFFFF` | `#111827` |
| `tabBarBorder` | `#E5E8EB` | `#1F2937` |
| `overlay` | `#11182760` | `#00000080` |
| `skeleton` | `#E5E7EB` | `#374151` |
| `skeletonHighlight` | `#F3F4F6` | `#4B5563` |
| `inputBg` | `#FFFFFF` | `#1F2937` |
| `inputBorder` | `#D1D5DB` | `#4B5563` |
| `inputFocusBorder` | `#0EA5E9` | `#38BDF8` |
| `cardShadow` | `#0000000A` | `#00000000` |
| `divider` | `#E5E7EB` | `#374151` |

### Poll Option Colors (matches StrawPoll)
`['#3EB991', '#FF7563', '#AA66CC', '#FFBB33', '#FF8800', '#33B5E5', '#E91E63', '#8BC34A']`

### Gradients
| Name | Light | Dark |
|---|---|---|
| `primaryGradient` | `['#0EA5E9', '#0284C7']` | `['#38BDF8', '#0EA5E9']` |
| `heroBg` | `['#F0F9FF', '#F9FAFB']` | `['#0C4A6E', '#111827']` |

---

## 3. Typography

**Font:** Inter (clean, professional, matches StrawPoll's sans-serif aesthetic). Load via `@expo-google-fonts/inter`.

| Token | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| `displayLarge` | 32 | 700 | 40 | -0.5 |
| `displayMedium` | 26 | 700 | 34 | -0.3 |
| `displaySmall` | 22 | 600 | 28 | -0.2 |
| `headingLarge` | 20 | 600 | 26 | 0 |
| `headingMedium` | 18 | 600 | 24 | 0 |
| `headingSmall` | 16 | 600 | 22 | 0 |
| `bodyLarge` | 16 | 400 | 24 | 0 |
| `bodyMedium` | 14 | 400 | 20 | 0 |
| `bodySmall` | 12 | 400 | 16 | 0.1 |
| `labelLarge` | 14 | 600 | 18 | 0.2 |
| `labelMedium` | 12 | 500 | 16 | 0.3 |
| `labelSmall` | 10 | 500 | 14 | 0.4 |

---

## 4. Spacing, Radii, Shadows

**Spacing (4px base):** `xs:4, sm:8, md:12, lg:16, xl:20, 2xl:24, 3xl:32, 4xl:40, 5xl:48, screenPadding:16, sectionGap:24, cardPadding:16`

**Border Radius (StrawPoll uses moderate rounding):**
`none:0, sm:6, md:8, lg:12, xl:16, 2xl:20, full:999`

**Shadows (minimal, StrawPoll-style -- rely on borders more than shadows):**
- `shadowSm`: `{ color: '#0000000A', offset:{0,1}, radius:2, elevation:1 }`
- `shadowMd`: `{ color: '#0000000F', offset:{0,2}, radius:4, elevation:2 }`
- `shadowLg`: `{ color: '#00000014', offset:{0,4}, radius:8, elevation:4 }`
- Dark mode: no shadows, use borders instead (like StrawPoll dark mode)

**Border width:** 1px standard, 3px for accent top-border highlights

---

## 5. Screen-by-Screen UI Design

### 5.1 LoginScreen
**Like StrawPoll's clean auth flow:**
- White/surface card centered on `background`
- 3px `borderAccent` (amber) top border on the card (StrawPoll signature)
- PollStraw logo + name at top
- "Sign in to your account" subtitle in `textSecondary`
- Clean bordered inputs (email, password) with `primary` focus border
- Solid `primary` "Sign In" button (full-width, rounded `radiusLg`)
- "Forgot password?" link in `primary` color
- Divider with "or"
- "Continue as Guest" outline button
- "Don't have an account? **Sign up**" footer

**Dark mode:** Card uses `surface` (#1F2937), inputs use `inputBg`, borders lighten.

### 5.2 RegisterScreen
Same card style as Login:
- 3px amber top-border card
- Name, Email, Password, Confirm Password inputs
- Password strength bar below password field (red -> amber -> emerald)
- "Create Account" primary button
- "Already have an account? **Sign in**" footer

### 5.3 ForgotPassword / ResetPassword
Minimal single-card layout, same style. Icon at top (mail/lock), single input, single action button.

### 5.4 HomeScreen
**StrawPoll-inspired homepage:**

1. **Header bar (sticky):** Logo left, avatar/profile right. Clean border-bottom. In dark mode: `surface` bg.

2. **Hero section:** Light green tinted bg (`heroBg` gradient). "Create a Poll" in `displayLarge`. "Ask a question. Share it. Get results in real-time." in `bodyLarge` `textSecondary`. Large `primary` CTA button "Create Poll" + outline "Join Poll" button beside it. Stat badges below: "X polls created", "Y votes cast" (like StrawPoll's stats).

3. **Join by code:** Clean input with "Enter poll code or link" placeholder, `primary` submit arrow button on right.

4. **Recent Polls section:** "Recent Polls" heading + "See all" link. Vertical list of poll cards (StrawPoll-style):
   - Each card: white bg, 1px `border`, 3px `primary` left-border for active / `border` for closed
   - Title in `headingSmall`, vote count + time info in `bodySmall` `textSecondary`
   - Status pill: green "Active" or gray "Closed"
   - Subtle hover/press: bg changes to `surfaceHover`

5. **Features section:** Three feature cards in vertical stack. Each: icon in `primarySubtle` circle, heading, description. Thin `border` border, clean spacing.

### 5.5 CreatePollScreen
**Matches StrawPoll's create flow exactly:**

1. **Title input:** Large, clean bordered. "What would you like to ask?" placeholder. Focus = `primary` border.

2. **Description:** Optional text area below, same style.

3. **Options section:**
   - Each option: horizontal row with option number, text input, emoji button (small), remove X button
   - "Add Option" button below (outline style, `primary` text)
   - Paste bulk option support
   - Min 2 options, max 10

4. **Settings section (collapsible like StrawPoll):**
   - "Advanced Settings" header with chevron toggle
   - Toggle switches (StrawPoll-style): `primary` when active, gray when inactive
   - Settings: Allow multiple selections, Require authentication, IP restriction
   - Show results: segmented control (Always / After vote / After deadline / Never)
   - Deadline: date/time picker trigger

5. **Create button:** Fixed bottom. Full-width `primary` bg, "Create Poll" text, rounded.

**Card structure:** Everything in a single white card with `border`, optional 3px `borderAccent` top.

### 5.6 PollDetailScreen
**Clean voting interface (StrawPoll-style):**

1. **Poll header:** Title in `displaySmall`. Description in `bodyMedium` `textSecondary`. Status badge + vote count + view count in a metadata row.

2. **Live indicator:** If Socket.io connected: small green dot + "Live" text, top-right.

3. **Options list:** Each option as a card/row:
   - Clean bordered container, `radiusMd`
   - Left: radio circle (single) or checkbox (multi) -- `primary` when selected
   - Center: emoji (if any) + option text
   - When results visible: progress bar bg fill (using poll option colors), percentage right-aligned
   - Selected state: `primarySubtle` bg, `primary` border (2px)

4. **Vote button:** Appears when selection made. Full-width `primary` button "Vote". Disabled state if already voted.

5. **Action row:** Share, Results, and creator actions (Edit, Close, Delete) as icon buttons in a horizontal row. Icons in `textSecondary`, touch targets 44x44.

6. **Poll info:** Collapsible section at bottom (created date, deadline, settings) -- progressive disclosure like StrawPoll's "Show advanced settings".

### 5.7 ResultsScreen
**StrawPoll-style results with charts:**

1. **Poll title** + metadata row (total votes, views, status).

2. **Results chart area:**
   - Horizontal bar chart (default view) -- bars use the poll option colors array
   - Each bar: option text left, percentage + count right, colored fill bar
   - Bars sorted by vote count (highest first)
   - Pie/donut chart toggle option (segmented control: Bar | Pie)

3. **Detailed results list:** Below chart. Each option row: rank number, colored dot, option text, vote count, percentage. Like StrawPoll's results breakdown.

4. **Stats cards:** Three inline stats: Total Votes, Unique Voters, Time Remaining. Clean bordered cards.

### 5.8 ShareScreen
1. **QR Code card:** Centered, clean bordered card. QR code in center. "Scan to vote" text above. Theme-aware (white bg in light, dark bg in dark with inverted QR colors).

2. **Share link:** Input showing URL + "Copy" button. Copied state: text becomes "Copied!" in `success` for 2s.

3. **Share buttons:** 2x2 grid -- Copy Link, System Share, WhatsApp, Twitter/X. Each as bordered card with platform icon + label.

### 5.9 DashboardScreen
**User's polls list:**

1. **Header:** "My Polls" + poll count. "+" create button top-right.

2. **Filter chips:** "All", "Active", "Closed" horizontal chips. Active chip: `primary` bg, white text. Inactive: `surfaceSubtle` bg, `textSecondary` text.

3. **Poll list:** Same card style as HomeScreen recent polls. Left border colored by status.

4. **Empty state:** Centered icon, "No polls yet" heading, "Create your first poll" body, primary CTA button.

5. **Pagination:** "Load More" button at bottom, or skeleton cards during loading.

### 5.10 ProfileScreen
1. **Profile card:** Centered avatar circle (80x80) with `primary` ring border. Name in `headingLarge`. Email in `bodySmall` `textSecondary`. "Member since" date.

2. **Stats row:** Three stat items inline: Polls, Votes, Joined. Numbers in `headingMedium`, labels in `labelSmall`.

3. **Menu list:** Clean bordered card. Items: Edit Profile, My Polls, Change Password. Each with icon + label + chevron. For admins: divider + Admin Dashboard, Moderation, Users.

4. **Theme toggle:** Prominent toggle between menu and actions. Sun/Moon icons with sliding thumb. `primary` active color.

5. **Actions:** "Log Out" outline button. "Delete Account" text link in `error`.

### 5.11 EditProfileScreen
Simple form card. Read-only email (grayed), editable name. Save/Cancel buttons.

### 5.12 Admin Screens

**AdminDashboardScreen:**
- 2x2 stats grid (Users, Polls, Votes, Reports) -- each card with icon, large number, label, "+X today" in `success`
- 3px colored top-border on each card (emerald, blue, amber, red)
- Quick actions row: Moderation, Users, Reports
- Recent/Top polls lists

**AdminModerationScreen:**
- Filter pills: PENDING, REVIEWED, RESOLVED, DISMISSED (with count badges)
- Report cards: status dot, reason badge, poll title, reporter info, action buttons

**AdminUsersScreen:**
- Search input. User cards: avatar, name, email, role badge, status. Action buttons.

---

## 6. Component Library

### Existing Components (Redesign)

| Component | StrawPoll-Inspired Changes |
|---|---|
| **Button** | Solid `primary` bg + white text (primary variant). Outline: `primary` border + text. Ghost: no border, `primary` text. Rounded `radiusLg`. Press: opacity 0.85. Disabled: opacity 0.5. Loading: spinner replaces text. |
| **Input** | 1px `inputBorder`, `radiusMd`. Focus: `inputFocusBorder` (primary). Error: `error` border + message below. Label above in `labelMedium`. Clean, no heavy shadows. |
| **Loading** | Replace with SkeletonLoader (shimmer animation). Keep simple spinner for inline use. |
| **Modal** | Semi-transparent `overlay` backdrop. Card: `surface` bg, `radius2xl`, 3px `borderAccent` top. Slide-up animation. |
| **QRCode** | Theme-aware colors (light: black-on-white, dark: white-on-dark). Logo center overlay. |
| **PollCard** | White card, 1px `border`, 3px colored left-border (active=primary, closed=gray). Title + metadata. Press: `surfaceHover` bg. |
| **PollOption** | Clean bordered row. Custom radio/checkbox in `primary`. Selected: `primarySubtle` bg + `primary` border. Progress bar with poll option colors. |

### New Components

| Component | Description |
|---|---|
| **ThemeToggle** | Sun/moon switch. Pill shape, sliding thumb, `primary` active indicator. |
| **SegmentedControl** | Horizontal segments (like StrawPoll's show-results toggle). Active: `primary` bg + white text. Sliding indicator animation. |
| **AnimatedNumber** | Number with scroll-up animation for vote count changes. |
| **SkeletonLoader** | Shimmer gradient blocks for loading states. |
| **CustomTabBar** | Clean tab bar. Active: `primary` icon+label + dot indicator above. Create tab: subtle `primarySubtle` circle bg. |
| **StatusBadge** | Pill with dot + text. Green=active, gray=closed, amber=warning, red=reported. |
| **AccentCard** | Card wrapper with optional 3px colored top-border (StrawPoll signature style). |

---

## 7. Custom Tab Bar

- 4 tabs: Home, Create, Dashboard, Profile (same as now)
- Clean white/dark bg with top `border` line
- Active tab: `primary` colored icon + label, small dot indicator above icon
- Inactive tab: `textTertiary` icon + label
- Create tab: icon wrapped in 40x40 `primarySubtle` circle (full `primary` bg when active)
- Height: 64px + safe area
- Haptic feedback on tap (light impact)

---

## 8. Animation Strategy (Subtle, Not Flashy -- Matches StrawPoll's Professional Feel)

**Package:** `react-native-reanimated` v3.x

| Animation | Details |
|---|---|
| **Screen transitions** | Default slide-from-right, 250ms |
| **Button press** | Opacity to 0.85 (100ms) -- clean, not bouncy |
| **Input focus** | Border color transition (150ms) |
| **Vote submission** | Button text -> checkmark, bg -> success (200ms). Progress bars animate to final width (400ms spring). |
| **Real-time updates** | Progress bar width springs to new value (300ms). Vote count ticks up with AnimatedNumber. |
| **Tab switch** | Dot indicator slides with spring (damping:18, stiffness:180) |
| **Theme toggle** | Thumb slides with spring, icon crossfade |
| **Skeleton shimmer** | Gradient sweeps left-to-right, 1.5s repeat |
| **List items** | Subtle stagger entrance (30ms delay, fade+translateY) |
| **Pull-to-refresh** | Native RefreshControl with `primary` tint color |
| **Chart entrance** | Bars grow from 0 width (staggered 80ms, 400ms spring) |

No particle bursts, confetti, or floating avatars. Keep it **clean and professional** like StrawPoll.

---

## 9. New Packages Required

| Package | Purpose |
|---|---|
| `react-native-reanimated` ^3.x | Animations |
| `expo-haptics` ~12.x | Tab/vote haptic feedback |
| `@expo-google-fonts/inter` | Typography |
| `expo-linear-gradient` ~12.x | Gradients, shimmer |

Note: Fewer packages than before -- dropped Space Grotesk (using Inter only, like StrawPoll's single-font approach).

---

## 10. Implementation Sequence

### Phase 1: Foundation
1. Create [types.ts](mobile/src/theme/types.ts) -- ThemeColors interface, ThemeMode type
2. Create [lightTheme.ts](mobile/src/theme/lightTheme.ts) + [darkTheme.ts](mobile/src/theme/darkTheme.ts)
3. Create [tokens.ts](mobile/src/theme/tokens.ts) -- spacing, radii, typography, shadows
4. Create [ThemeContext.tsx](mobile/src/theme/ThemeContext.tsx) + [useTheme.ts](mobile/src/theme/useTheme.ts) + [index.ts](mobile/src/theme/index.ts)
5. Update [App.tsx](mobile/App.tsx) -- ThemeProvider, load Inter font, StatusBar theme
6. Install packages: `react-native-reanimated`, `expo-haptics`, `expo-linear-gradient`, `@expo-google-fonts/inter`
7. Update [babel.config.js](mobile/babel.config.js) -- replace `nativewind/babel` with `react-native-reanimated/plugin`

### Phase 2: Components
1. Redesign [Button.tsx](mobile/src/components/common/Button.tsx) -- theme + press animation
2. Redesign [Input.tsx](mobile/src/components/common/Input.tsx) -- theme + focus animation
3. Create `SkeletonLoader.tsx`
4. Redesign [Modal.tsx](mobile/src/components/common/Modal.tsx) -- theme + accent top-border
5. Redesign [PollCard.tsx](mobile/src/components/poll/PollCard.tsx) -- left-border accent, clean style
6. Redesign [PollOption.tsx](mobile/src/components/poll/PollOption.tsx) -- custom radio/checkbox, progress bar
7. Redesign [QRCode.tsx](mobile/src/components/common/QRCode.tsx) -- theme-aware
8. Create `ThemeToggle.tsx`, `SegmentedControl.tsx`, `AnimatedNumber.tsx`, `StatusBadge.tsx`, `AccentCard.tsx`
9. Create [CustomTabBar.tsx](mobile/src/navigation/CustomTabBar.tsx)

### Phase 3: Screen Migration
1. [AppNavigator.tsx](mobile/src/navigation/AppNavigator.tsx) -- CustomTabBar + nav theme
2. [LoginScreen.tsx](mobile/src/screens/auth/LoginScreen.tsx) + [RegisterScreen.tsx](mobile/src/screens/auth/RegisterScreen.tsx)
3. [HomeScreen.tsx](mobile/src/screens/home/HomeScreen.tsx) -- hero section, recent polls
4. [PollDetailScreen.tsx](mobile/src/screens/poll/PollDetailScreen.tsx) -- voting UI
5. [CreatePollScreen.tsx](mobile/src/screens/poll/CreatePollScreen.tsx) -- stepped form
6. [ResultsScreen.tsx](mobile/src/screens/poll/ResultsScreen.tsx) -- bar/pie charts
7. [ShareScreen.tsx](mobile/src/screens/poll/ShareScreen.tsx) -- QR + share grid
8. [DashboardScreen.tsx](mobile/src/screens/dashboard/DashboardScreen.tsx) -- filters, poll list
9. [ProfileScreen.tsx](mobile/src/screens/profile/ProfileScreen.tsx) -- theme toggle
10. [EditProfileScreen.tsx](mobile/src/screens/profile/EditProfileScreen.tsx) + [EditPollScreen.tsx](mobile/src/screens/poll/EditPollScreen.tsx)
11. [ForgotPasswordScreen.tsx](mobile/src/screens/auth/ForgotPasswordScreen.tsx) + [ResetPasswordScreen.tsx](mobile/src/screens/auth/ResetPasswordScreen.tsx)
12. Admin screens

### Phase 4: Polish
1. Skeleton screens for all loading states
2. Vote + results animations
3. Haptic feedback
4. WCAG contrast verification for all token pairs in both themes
5. Test on iOS simulator + Android emulator

---

## 11. Key Architectural Decisions

- **StyleSheet over NativeWind** -- NativeWind v2 configured but unused. StyleSheet works directly with Reanimated.
- **Single font (Inter)** -- matches StrawPoll's clean single-font approach, simpler to manage.
- **Minimal shadows, border-focused** -- like StrawPoll. Cards use 1px borders, not heavy shadows.
- **3px accent top-borders** -- StrawPoll's signature visual element, adapted with our emerald/amber colors.
- **Progressive disclosure** -- collapsible settings, collapsible poll info (like StrawPoll).
- **No breaking API changes** -- purely visual. Stores/services/types unchanged.
- **Victory Native retained** for charts -- restyle with new palette.
- **Gradual migration** -- semantic tokens allow one screen at a time.

---

## 12. Critical Files

| File | Change |
|---|---|
| [colors.ts](mobile/src/theme/colors.ts) | Replace with new token system |
| [App.tsx](mobile/App.tsx) | ThemeProvider, font loading, StatusBar |
| [AppNavigator.tsx](mobile/src/navigation/AppNavigator.tsx) | CustomTabBar, nav theme |
| [babel.config.js](mobile/babel.config.js) | Swap nativewind/babel for reanimated/plugin |
| All 15 screen files | Theme + visual redesign |
| All 7 component files | Theme + redesign |

---

## 13. Verification

1. Toggle dark/light on ProfileScreen -- verify all screens render correctly in both
2. Vote flow: select option -> cast vote -> progress bars animate -> results display
3. Inter font renders correctly on both platforms
4. Tab bar: sliding indicator, Create tab highlight, haptic
5. Skeleton loading appears during data fetches
6. Amber top-border accent visible on cards (Login, Create, Modal)
7. WCAG AA contrast (4.5:1) for all text/bg pairs in both themes
8. Run `expo start`, test iOS + Android
