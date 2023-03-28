import "./style.css";

document.addEventListener("DOMContentLoaded", load);
document.querySelector("#settings").addEventListener("change", save);

async function save() {
  const selects = document.querySelectorAll(
    "#settings select"
  ) as NodeListOf<HTMLSelectElement>;
  const settings: { [id: string]: { value: string; text: string } } = {};

  for (const select of selects) {
    const id = select.id;
    const value = select.value;
    const text = select.options[select.selectedIndex].text;

    settings[id] = { value: value, text: text };
  }

  chrome.storage.local.set(settings);
}

async function load() {
  const settings = await chrome.storage.local.get();
  const selects = document.querySelectorAll(
    "#settings select"
  ) as NodeListOf<HTMLSelectElement>;
  for (const select of selects) {
    select.value = settings[select.id]?.value ?? "default";
  }
}
