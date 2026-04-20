import { useBeforeInstallPrompt } from "../hooks/useBeforeInstallPrompt";

export default function InstallAppButton() {
  const { isInstallable, install } = useBeforeInstallPrompt();

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      className="primary-button"
      onClick={install}
    >
      Install App
    </button>
  );
}
