/**
 * @fileoverview Install prompt component
 * Renders the browser's "Add to home screen" affordance and, on iOS Safari,
 * a static instruction card, since iOS has no beforeinstallprompt event.
 *
 * @component
 * @returns {JSX.Element} Install button or instruction card
 */
import { Button } from "flowbite-react";
import InstallSvg from "../assets/install-app.svg?react";
import { useEffect, useState } from "react";
import { buttonTheme } from "../config/button-theme.config";
import {
  promptInstall,
  setupInstallListeners,
} from "../utils/pwa/install.util";
import { useSelector } from "react-redux";

/**
 * Detects whether the browser is iOS Safari, which has no install prompt.
 *
 * @returns {boolean} True on iOS Safari
 */
const isIosSafari = () => {
  const ua = navigator.userAgent || "";
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
  return isIos && isSafari;
};

/**
 * Install Prompt Component
 *
 * Shows an "Install" affordance when the browser supports it. On iOS Safari
 * it renders a static "Add to Home Screen" card instead, since that platform
 * has no programmatic install path.
 *
 * @component
 * @returns {JSX.Element} Install affordance
 */
const InstallPrompt = () => {
  const { isInstallable, isInstalled } = useSelector((state) => state.pwa);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setupInstallListeners();
    setIsIos(isIosSafari());
  }, []);

  if (isInstalled) return null;

  if (isIos) {
    return (
      <div className="text-xs text-neutrals-700 px-4 py-2 border-b border-neutrals-200">
        <span className="font-semibold">Add to Home Screen: </span>
        tap the Share button <span className="font-semibold">+</span> then
        &quot;Add to Home Screen&quot;.
      </div>
    );
  }

  if (!isInstallable) return null;

  return (
    <Button
      theme={buttonTheme}
      className="focus:ring-0 *:p-0 *:gap-1.5 *:items-center"
      onClick={promptInstall}
      title="Install the app on your device"
    >
      <InstallSvg className="*:stroke-baseblack group-hover:*:stroke-secondary-600 group-active:*:stroke-secondary-700" />
      <span className="max-[480px]:sr-only text-sm font-semibold text-baseblack group-hover:text-secondary-600 group-active:text-secondary-700">
        Install
      </span>
    </Button>
  );
};

export default InstallPrompt;