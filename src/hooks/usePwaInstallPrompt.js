import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  getSnapshot,
  initPwaInstallPromptStore,
  promptInstall as promptInstallFromStore,
  subscribe,
} from "../utils/pwaInstallPromptStore";

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iOS = /iphone|ipad|ipod/i.test(ua);
  const iPadOs =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = (navigator.userAgent || "").toLowerCase();
  return (
    ua.includes("wv") ||
    ua.includes("fbav") ||
    ua.includes("fban") ||
    ua.includes("instagram") ||
    ua.includes("line") ||
    ua.includes("twitter")
  );
}

export function usePwaInstallPrompt() {
  initPwaInstallPromptStore();

  const { deferredPrompt, installed } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  const isIos = useMemo(() => isIosDevice(), []);
  const inApp = useMemo(() => isInAppBrowser(), []);

  const promptInstall = useCallback(async () => {
    return promptInstallFromStore();
  }, []);

  return {
    installed,
    isIos,
    inApp,
    canPromptInstall: !installed && !!deferredPrompt,
    promptInstall,
  };
}
