import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  const settingsForm = document.querySelector("#settings");
  if (settingsForm) {
    settingsForm.addEventListener("change", save);
  }
  load();
});

function save() {
  const selects = document.querySelectorAll(
    "#settings select",
  ) as NodeListOf<HTMLSelectElement>;
  const settings: { [id: string]: { value: string; text: string } } = {};

  for (const select of selects) {
    const id = select.id;
    const value = select.value;
    const text = select.options[select.selectedIndex].text;

    settings[id] = { value, text };
  }

  chrome.storage.local.set(settings, () => {
    if (chrome.runtime.lastError) {
      console.error("Failed to save settings:", chrome.runtime.lastError.message);
    }
  });
}

function load() {
  chrome.storage.local.get((items) => {
    if (chrome.runtime.lastError) {
      console.error("Failed to load settings:", chrome.runtime.lastError.message);
      return;
    }

    const settings = items as Record<string, { text: string; value: string }>;
    const selects = document.querySelectorAll(
      "#settings select",
    ) as NodeListOf<HTMLSelectElement>;

    for (const select of selects) {
      const setting = settings[select.id];
      select.value = setting?.value ?? "default";
    }
  });
}

