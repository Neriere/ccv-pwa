let initialized = false;
let snapshot = { deferredPrompt: null, installed: false };

const listeners = new Set();

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator?.standalone === true
  );
}

function notify() {
  for (const listener of listeners) listener();
}

function setSnapshot(next) {
  const nextDeferredPrompt = Object.prototype.hasOwnProperty.call(
    next,
    "deferredPrompt"
  )
    ? next.deferredPrompt
    : snapshot.deferredPrompt;
  const nextInstalled = Object.prototype.hasOwnProperty.call(next, "installed")
    ? next.installed
    : snapshot.installed;

  if (
    snapshot.deferredPrompt === nextDeferredPrompt &&
    snapshot.installed === nextInstalled
  ) {
    return;
  }

  snapshot = { deferredPrompt: nextDeferredPrompt, installed: nextInstalled };
  notify();
}

export function initPwaInstallPromptStore() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  setSnapshot({ installed: isStandaloneMode() });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    setSnapshot({ deferredPrompt: event });
  });

  window.addEventListener("appinstalled", () => {
    setSnapshot({ installed: true, deferredPrompt: null });
  });

  // Keep installed state reasonably fresh (e.g., if opened in standalone).
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const nextInstalled = isStandaloneMode();
      setSnapshot({ installed: nextInstalled });
    }
  });
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return snapshot;
}

export async function promptInstall() {
  const deferredPrompt = snapshot.deferredPrompt;
  if (!deferredPrompt) return { outcome: "unavailable" };

  deferredPrompt.prompt();
  try {
    const choice = await deferredPrompt.userChoice;
    return choice;
  } finally {
    setSnapshot({ deferredPrompt: null });
  }
}
