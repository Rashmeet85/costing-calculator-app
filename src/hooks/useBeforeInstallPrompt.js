import { useEffect, useState } from "react";

export function useBeforeInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);

  useEffect(() => {
    const handlePrompt = (event) => {
      event.preventDefault();
      setPromptEvent(event);
    };

    const clearPrompt = () => setPromptEvent(null);

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", clearPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", clearPrompt);
    };
  }, []);

  return {
    isInstallable: Boolean(promptEvent),
    install: async () => {
      if (!promptEvent) {
        return;
      }

      await promptEvent.prompt();
      await promptEvent.userChoice;
      setPromptEvent(null);
    },
  };
}
