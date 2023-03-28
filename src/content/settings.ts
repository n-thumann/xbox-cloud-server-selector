interface Settings {
  region: Item;
  ipVersion: Item;
}

interface Item {
  text: string;
  value: string;
}

export { Settings, Item };
