export const DEFAULT_ITEM_CATEGORIES: { category: string; items: string[] }[] = [
  {
    category: "Food",
    items: [
      "Biryani", "Haleem", "Dosa", "Kebab", "Pani Puri", "Filter Coffee",
      "Kheer", "Samosa", "Sheer Khurma", "Butter Chicken", "Gulab Jamun",
      "Mysore Pak", "Bisi Bele Bath", "Nihari", "Vada Pav", "Chai", "Roti",
      "Dum Ka Chicken", "Falooda", "Pav Bhaji", "Masala Dosa", "Shawarma",
      "Fried Rice", "Seekh Kebab", "Rasmalai", "Chole Bhature", "Mutton Curry",
    ],
  },
  {
    category: "Bangalore",
    items: [
      "MG Road", "Brigade Road", "Commercial Street", "Lalbagh", "Cubbon Park",
      "Majestic", "Chickpet", "Koramangala", "Indiranagar", "Electronic City",
      "Whitefield", "Mantri Mall", "Vidhana Soudha", "Bannerghatta Road",
      "Nandi Hills", "Mysore Palace", "Tipu Sultan's Palace", "Forum Mall",
      "BMTC Bus", "Bangalore Traffic",
    ],
  },
  {
    category: "Corporate",
    items: [
      "Standup Meeting", "Appraisal", "Notice Period", "Work From Home",
      "LinkedIn", "Teams Call", "Sprint Planning", "Manager", "Onsite Trip",
      "Offer Letter", "Hike", "Background Verification", "Slack Message",
      "Town Hall", "KPI", "Probation Period", "Resignation", "Bench",
      "Client Call", "Laptop Bag", "Cab Pickup", "Pantry", "ID Card",
    ],
  },
  {
    category: "Wedding & Family",
    items: [
      "Mehndi", "Nikah", "Walima", "Baraat", "Rishta", "Mahr",
      "Shaadi Shopping", "Wedding Card", "Family WhatsApp Group", "Cousin Drama",
      "Eid Gift Money", "Attar", "Gold Set", "Joint Family", "Daawat",
      "Relatives Ki Advice",
    ],
  },
  {
    category: "Bollywood",
    items: [
      "Shah Rukh Khan", "3 Idiots", "Pushpa", "KGF", "Salman Khan",
      "Dilwale Dulhania Le Jayenge", "Lagaan", "Dil Chahta Hai",
      "Andaz Apna Apna", "Sholay", "Dangal", "Bajrangi Bhaijaan",
      "Kantara", "Hera Pheri", "Gangs of Wasseypur",
    ],
  },
  {
    category: "Islamic Culture",
    items: [
      "Eid ul-Fitr", "Eid ul-Adha", "Ramadan", "Taraweeh", "Iftar",
      "Sehri", "Jummah", "Masjid", "Topi", "Kurta Pajama", "Dates",
      "Qurbani", "Eidi", "Milad", "Dua",
    ],
  },
  {
    category: "Cricket",
    items: [
      "Virat Kohli", "MS Dhoni", "IPL", "RCB", "Gully Cricket", "LBW",
      "Sixer", "Last Over Finish", "Umpire", "Cricket Commentary",
      "Babar Azam", "World Cup", "Mankading", "DRS Review", "Cricket Bat",
    ],
  },
];

export const DEFAULT_ITEMS: { text: string; category: string }[] =
  DEFAULT_ITEM_CATEGORIES.flatMap(({ category, items }) =>
    items.map((text) => ({ text, category }))
  );

