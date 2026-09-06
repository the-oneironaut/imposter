import type { Item } from "./types";

export const DRAWING_ITEM_CATEGORIES: { category: string; items: string[] }[] = [
  {
    category: "Animals",
    items: [
      "Cat",
      "Dog",
      "Elephant",
      "Giraffe",
      "Penguin",
      "Octopus",
      "Turtle",
      "Butterfly",
      "Crocodile",
      "Owl",
      "Rabbit",
      "Whale",
      "Kangaroo",
      "Flamingo",
      "Squirrel",
    ],
  },
  {
    category: "Vehicles",
    items: [
      "Bicycle",
      "Scooter",
      "Train",
      "Airplane",
      "Sailboat",
      "Rocket",
      "Submarine",
      "Tractor",
      "Helicopter",
      "Motorcycle",
      "Skateboard",
      "Fire Truck",
      "Hot Air Balloon",
      "Roller Skates",
      "Canoe",
    ],
  },
  {
    category: "Everyday Objects",
    items: [
      "Umbrella",
      "Backpack",
      "Camera",
      "Teapot",
      "Alarm Clock",
      "Guitar",
      "Key",
      "Glasses",
      "Toothbrush",
      "Desk Lamp",
      "Telescope",
      "Suitcase",
      "Headphones",
      "Magnet",
      "Watering Can",
    ],
  },
];

export const DRAWING_ITEMS: Item[] = DRAWING_ITEM_CATEGORIES.flatMap(
  ({ category, items }) =>
    items.map((text, index) => ({
      id: `drawing-${category.toLowerCase().replaceAll(" ", "-")}-${index + 1}`,
      text,
      category,
      createdAt: "built-in",
    }))
);
