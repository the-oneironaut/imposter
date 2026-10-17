export const DEFAULT_ITEM_CATEGORIES: { category: string; items: string[] }[] = [
  {
    category: "Food",
    items: [
      "Biryani", "Haleem", "Dosa", "Kebab", "Pani Puri", "Filter Coffee",
      "Kheer", "Samosa", "Sheer Khurma", "Butter Chicken", "Gulab Jamun",
      "Mysore Pak", "Bisi Bele Bath", "Nihari", "Vada Pav", "Chai", "Roti",
      "Dum Ka Chicken", "Falooda", "Pav Bhaji", "Masala Dosa", "Shawarma",
      "Fried Rice", "Seekh Kebab", "Rasmalai", "Chole Bhature", "Mutton Curry",
      "Idli", "Rasam", "Pongal", "Appam", "Lassi", "Tandoori Chicken",
      "Aloo Paratha", "Dhokla", "Pesarattu", "Thali",
      "Vada", "Mango Lassi", "Kathi Roll", "Dabeli", "Thepla", "Kulfi",
      "Poha", "Upma", "Chicken 65", "Malai Kofta",
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
      "Bangalore Palace", "Ulsoor Lake", "Sankey Tank", "Namma Metro",
      "Kempegowda Airport", "Jayanagar", "HSR Layout", "VV Puram Food Street",
      "Yeshwanthpur", "Kalyan Nagar",
      "Bangalore Fort", "Hebbal Flyover", "Marathahalli", "Banashankari",
      "JP Nagar", "Kasturba Road", "Thindi Beedi", "Bangalore University",
      "Malleswaram", "Sarjapur Road",
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
      "Code Review", "Product Demo", "One-on-One", "Jira Ticket", "Email Thread",
      "Team Outing", "Release Deadline", "Salary Slip", "HR Meeting", "Business Travel",
      "Quarterly Review", "Onboarding", "Offsite", "Meeting Invite", "Access Request",
      "Bug Tracker", "Production Deploy", "Notice Board", "Payslip", "Office Commute",
    ],
  },
  {
    category: "Wedding & Family",
    items: [
      "Mehndi", "Nikah", "Walima", "Baraat", "Rishta", "Mahr",
      "Shaadi Shopping", "Wedding Card", "Family WhatsApp Group", "Cousin Drama",
      "Eid Gift Money", "Attar", "Gold Set", "Joint Family", "Daawat",
      "Relatives Ki Advice",
      "Sangeet", "Reception", "Wedding Photographer", "Baby Shower", "Housewarming",
      "Anniversary", "Family Reunion", "Matrimonial Profile", "Family Group Call", "Wedding Venue",
      "Engagement", "Roka Ceremony", "Bridesmaid", "Groom's Family", "Wedding Dance",
      "Invitation List", "Catering Menu", "Wedding Gifts", "Newlyweds", "Family Portrait",
    ],
  },
  {
    category: "Bollywood",
    items: [
      "Shah Rukh Khan", "3 Idiots", "Pushpa", "KGF", "Salman Khan",
      "Dilwale Dulhania Le Jayenge", "Lagaan", "Dil Chahta Hai",
      "Andaz Apna Apna", "Sholay", "Dangal", "Bajrangi Bhaijaan",
      "Kantara", "Hera Pheri", "Gangs of Wasseypur",
      "Queen", "Barfi", "Kahaani", "Drishyam", "Zindagi Na Milegi Dobara",
      "Kabhi Khushi Kabhie Gham", "RRR", "Jawan", "Aamir Khan", "Deepika Padukone",
      "Dil Se", "Swades", "Munna Bhai M.B.B.S.", "Om Shanti Om", "Gully Boy",
      "Andhadhun", "Stree", "Mimi", "Chak De India", "Rockstar",
    ],
  },
  {
    category: "Islamic Culture",
    items: [
      "Eid ul-Fitr", "Eid ul-Adha", "Ramadan", "Taraweeh", "Iftar",
      "Sehri", "Jummah", "Masjid", "Topi", "Kurta Pajama", "Dates",
      "Qurbani", "Eidi", "Milad", "Dua",
      "Eid Prayer", "Azaan", "Wudu", "Tasbeeh", "Zakat", "Sadaqah",
      "Hajj", "Umrah", "Prayer Mat", "Moon Sighting",
      "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Quran", "Surah",
      "Ramadan Calendar", "Laylat al-Qadr", "Friday Khutbah",
    ],
  },
  {
    category: "Cricket",
    items: [
      "Virat Kohli", "MS Dhoni", "IPL", "RCB", "Gully Cricket", "LBW",
      "Sixer", "Last Over Finish", "Umpire", "Cricket Commentary",
      "Babar Azam", "World Cup", "Mankading", "DRS Review", "Cricket Bat",
      "Yorker", "Googly", "Bouncer", "Wicketkeeper", "Opening Batter",
      "Powerplay", "Third Umpire", "Run Out", "No Ball", "Super Over",
      "Batting", "Bowling", "Fielding", "Boundary", "Six Hit", "Catch",
      "Duck", "Maiden Over", "Pitch", "Captain",
    ],
  },
];

export const DEFAULT_ITEMS: { text: string; category: string }[] =
  DEFAULT_ITEM_CATEGORIES.flatMap(({ category, items }) =>
    items.map((text) => ({ text, category }))
  );

