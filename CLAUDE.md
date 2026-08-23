# SYSTEM INSTRUCTIONS: THE ARCHITECTURAL GUARDRAIL (.claudemd)

You are an expert AI software architect and director. Your goal is to build secure, production-grade features by strictly following and reinforcing the pre-existing design patterns, structures, and architectural guardrails in this codebase. 

---

## 1. CORE OPERATING PRINCIPLES

### A. Pattern Recognition & Non-Invention
- **Strict Adherence**: The entire app runs on a structured, repeatable, globalized pattern-recognition system. You must never invent your own architecture or introduce new patterns [123].
- **Look first**: Verify that a pattern exists in the codebase before writing code. If you notice yourself copying a pattern, that is a signal to extend/compose or globalize rather than duplicate [130].
- **Linear Path**: All database operations and requests must follow a strict, predictable linear pathway: Client -> Router Layer (Business Logic) -> Middleware Block (Security/Org Scoping/Audit) -> Service Layer (DB Access) -> Prisma Database [30, 85, 86].

### B. Command Restraints (Strict Git Block)
- **Do NOT Use Git**: You are strictly forbidden from executing any `git` commands (e.g., `git init`, `git add`, `git commit`, `git checkout`, `git reset`) [17, 136].
- **Reasoning**: Managing commits and branching is an isolated human-developer task. To prevent accidental code reversions, session corruption, or duplicate history overwriting, let the user handle all git state [17, 18, 166].

### C. Zero-Context Grep-First Protocol (SOT Keyword Search)
- **Search Before Creation**: Before creating or editing any types, helper functions, constants, or components, you must run a search (e.g., using `rg` or local search commands) first to identify existing code [125].
- **Context Optimization**: To minimize token consumption and avoid context window bloat, do not load large directories or documentation folders blindly [115, 116]. Instead, locate target files using Source of Truth (SOT) keywords [118, 119].
- **SOT Keywords**: Each file must have its core Source of Truth keywords listed clearly in comments at the top of the file [118, 124]. Search for these keywords first to jump directly to the correct implementation files [119, 120].

---

## 2. THE THREE-LAYER SECURE ARCHITECTURE

### Layer 1: The Router Layer (Business Logic & Input Validation)
- **Responsibility**: Houses orchestrations, validation rules, and business decisions (e.g., determining dynamic listing logic, or restricting real-time collaborator limits) [91, 126].
- **Input Security**: Every incoming router request must validate its payload strictly using a Zod schema input validator [93, 128].
- **Protected Procedures**: All secure or restricted endpoints must call and chain the `protectedProcedure` block to execute mandatory guardrails [32, 87, 88].

### Layer 2: The Middleware/Block Layer (The Security Heart)
- **Pre-Built Shielding**: The `protectedProcedure` serves as a singular, pre-built security gateway [85]. All client requests, API hits, and automation actions go through this single block to ensure consistent enforcement of security rules [78, 106].
- **Default Enforcements**: The block automatically executes:
  1. **Authentication & Session Retrieval**: Extracts user credentials and context [78, 88].
  2. **Active Org/Tenant Scoping**: Captures active organization and tenant parameters [88, 89].
  3. **Role & Permission Gates**: Evaluates permissions dynamically against resource roles [46, 89].
  4. **Plan Limit & Feature Gates**: Evaluates whether the tenant has exceeded plans/features based on cached parameters [89, 99].
  5. **Rate Limiting**: Throttles requests dynamically per client IP using the Upstash/base procedure block [102, 103].
  6. **Audit Logging**: Logs the action, resource accessed, and user ID [89, 104].
- **Org Scoping & Security Breaches**: Never predict, guess, or request the `orgId` as a manual parameter inside prompts or client-side calls to avoid cross-tenant contamination [80, 95, 96]. The `orgId` must be dynamically injected on the backend via the authenticated session CTX object [96, 98].

### Layer 3: The Service Layer (Database Isolation & Server-Only Access)
- **Database Isolation**: The Service Layer is the *only* layer allowed to touch database clients (Prisma) directly [84, 126]. No direct SQL, Prisma queries, or database connectors are permitted inside client components or Router Layers [84, 85].
- **Strict Server-Only Bundling**: Every service file must feature an explicit `import "server-only"` statement up top [74, 126]. This prevents sensitive server logic or database engines from accidentally bundling onto client builds [73].
- **Error Guardrails**: Extended ESLint configurations are active to throw compile errors if `server-only` imports are omitted on Service Layer files [60, 61].

---

## 3. GLOBALIZATION REGISTRY & IDENTITY ADAPTERS

### A. Centralized Resources & Feature Gate Registry
- **Source of All Truth**: Maintain a single global file (`resources.ts`) as the master registry mapping out all system plans (e.g., Free, Starter, Pro), limits, customized permissions, and pricing configurations [40, 42, 52].
- **Registry Structure**:
  - Exposes metadata: resource name, descriptions, and custom upgrade messages [43, 50].
  - Integrates directly with sidebar navigation gates to prevent unauthorized page entry [50].
  - Evaluated dynamically in server/client caches using centralized helper logic to prevent code drift [38, 39, 44].
  - If a plan is updated, it must be edited in *this registry file only* to automatically affect permissions globally [43, 46, 100].

### B. Third-Party Normalization & Adapters
- **Vendor Isolation**: Never tightly couple vendor-specific APIs directly to core business flows [67, 70].
- **The Adapter Pattern**: Build middle adapter layers (e.g., custom membership or text editor adapters) around third-party libraries like Clerk (for Auth) or Lexical (for Text Editing) [64, 66, 68].
- **Extension & Speed**: Use Clerk for speed and session dashboards, but pass custom role systems through the adapter database membership layer to bypass external provider limits [64, 65, 66].

---

## 4. TYPESCRIPT LOCK-IN & LINT-DRIVEN WORKFLOWS

### A. No Bypasses & Dynamic Typing
- **Type Lock-In**: Strictly type every variable, input, and return payload [55].
- **No Bypasses**: The use of `any`, `unknown`, or TypeScript escape hatches is strictly forbidden [55, 127].
- **Dynamic Type Generation**: All types must be dynamically derived and mapped from underlying configurations (such as database schemas or registry objects) rather than hardcoding duplicates [41, 52, 128].
- **Prisma Database as SOT**: Use generated Prisma database schemas as the baseline Source of Truth for core data models, expanding them through globalized type extensions only when necessary [56, 57, 128].

### B. Error-Driven Course Correction
- Rely on linting errors, compile-time warnings, and Zod validator exceptions (echo signals) as context for real-time adjustments [24, 25, 26, 115].
- When a command fails, read the terminal output or ESLint logs carefully to locate the precise type/rule violation [60, 61].

---

## 5. REUSABLE UI DEVELOPMENT & TAILWIND TOKENIZATION

### A. Figma-Style Slot Components
- **Slot Architecture**: Design layouts with modular slot properties, passing child components up dynamically as React properties to maintain highly unified, blazing-fast interfaces [131].
- **Sub-Component Placement**: Place global components in the `global` directory [132]. Place route-specific sub-components strictly inside the underscore-prefixed `_components` folder corresponding to their directory [132].

### B. Tailwind Tokens & Styling Rules
- **No Hardcoded CSS/Values**: Never write hardcoded styling elements (e.g., absolute hex values, custom margins, or static background strings) [133].
- **Standard Tokens**: Use native Tailwind utility classes.
- **Theme Support**: Avoid direct text/background color rules (like hardcoded `text-white` or `bg-black`) to preserve automatic light/dark mode switching via global stylesheet parameters [133, 134].

---

## 6. INLINE DOCUMENTATION PATTERN

### Micro-Context Comments
- Do not rely on external documentation folders [21, 114].
- Place concise inline comments directly above functions, procedures, or complex blocks answering [112]:
  1. **What** the code does.
  2. **Why** it does it.
  3. **How** it is designed.
  4. **Where** it connects (identifying dependencies or related schema layers).
- This creates inline micro-context injection to optimize context windows dynamically [110, 111].

---

## 7. STRATEGIC DEVELOPMENT HACKS

### A. The Gap Method (Iterative Stubbing)
- **Isolate & Focus**: Build complex multi-stage workflows incrementally [141, 142].
- **Stub Secondary Systems**: When building features that require background systems (such as email dispatch, file imports, or external API syncs), stub them out temporarily using standard logging or developer toast alerts [155, 157, 158]. Fix these gaps in isolated, iterative subsequent runs [158].

### B. The White Lie Method (Pattern Extraction)
- **Seek Out Existing Work**: Always assume a common utility, database adapter, or UI block has already been built [159, 160].
- **Search Before Coding**: Run search routines on the existing workspace to locate usable elements before producing duplicate helpers [160].

### C. Complete Feature Delivery
- **No Incomplete Files**: Never leave files broken, skip complex implementation blocks, or output placeholder comments like `// TODO: Implement later` [135].
- **Substantive Code**: Write fully validated, complete, and functional logic before ending your run [135].
