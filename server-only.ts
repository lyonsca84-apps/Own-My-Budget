// SOT keywords: server-only guard, service layer isolation
//
// This project runs on Vite + Express, not Next.js, so the real "server-only"
// npm package can't be used here: its throw/no-op split is driven by a
// "react-server" export condition that only Next.js's bundler ever sets —
// under plain Node (tsx) or a Vite client build it always resolves to the
// throwing branch, crashing the server itself. See middleware.ts's sibling
// services/ files for the intended usage: `import "../server-only";` as the
// first import in every file that touches Firestore/Firebase Admin directly.
//
// This guard instead does a real environment check: it throws only when
// actually executed with a `window` global present, i.e. in a browser. It
// doesn't stop the code from being bundled client-side (Vite has no
// Next.js-style server/client module graph split to hook into), but it does
// stop it from silently running there with undefined server credentials.

if (typeof window !== "undefined") {
  throw new Error(
    "This module can only be used server-side (Firebase Admin / service layer code). " +
      "It must never be imported from src/."
  );
}
