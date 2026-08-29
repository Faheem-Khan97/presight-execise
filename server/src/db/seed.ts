import { faker } from "@faker-js/faker";
import type Database from "better-sqlite3";
import { getDb } from "./client";
import { migrate } from "./migrate";

const SEED = 42;
const USER_COUNT = 5000;

const NATIONALITIES = [
  "Nigerian", "Brazilian", "Japanese", "German", "Indian", "Canadian", "French",
  "Egyptian", "Mexican", "Korean", "Italian", "Spanish", "Australian", "Kenyan",
  "Turkish", "Vietnamese", "Polish", "Swedish", "Argentinian", "Filipino",
  "Chinese", "Thai", "Dutch", "Greek", "Portuguese", "Moroccan", "Ghanaian",
  "Colombian", "Peruvian", "Chilean", "Norwegian", "Danish", "Finnish", "Irish",
  "Swiss", "Austrian", "Indonesian", "Malaysian", "Ethiopian", "Ukrainian",
];

const HOBBIES = [
  "Photography", "Chess", "Hiking", "Cooking", "Gaming", "Painting", "Reading",
  "Cycling", "Swimming", "Yoga", "Gardening", "Fishing", "Running", "Dancing",
  "Traveling", "Knitting", "Surfing", "Climbing", "Baking", "Writing",
  "Singing", "Pottery", "Woodworking", "Birdwatching", "Sailing", "Skiing",
  "Skateboarding", "Calligraphy", "Astronomy", "Archery", "Kayaking",
  "Meditation", "Volunteering", "Blogging", "Juggling", "Origami",
  "Beekeeping", "Brewing", "Collecting", "Camping",
];

function randomHobbyNames(): string[] {
  const weights = [0.05, 0.1, 0.2, 0.22, 0.18, 0.12, 0.06, 0.04, 0.02, 0.008, 0.002];
  const roll = faker.number.float({ min: 0, max: 1 });
  let cumulative = 0;
  let count = weights.length - 1;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (roll <= cumulative) {
      count = i;
      break;
    }
  }
  return faker.helpers.arrayElements(HOBBIES, count);
}

export function seed(db: Database.Database = getDb()): void {
  faker.seed(SEED);
  migrate(db);

  db.exec("DELETE FROM user_hobbies; DELETE FROM users; DELETE FROM hobbies; DELETE FROM nationalities;");

  const insertNationality = db.prepare("INSERT INTO nationalities (id, name) VALUES (?, ?)");
  const insertHobby = db.prepare("INSERT INTO hobbies (id, name) VALUES (?, ?)");
  const insertUser = db.prepare(
    "INSERT INTO users (id, avatar, first_name, last_name, age, nationality_id) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const insertUserHobby = db.prepare("INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)");

  const seedAll = db.transaction(() => {
    const nationalityIds = new Map<string, number>();
    NATIONALITIES.forEach((name, index) => {
      const id = index + 1;
      insertNationality.run(id, name);
      nationalityIds.set(name, id);
    });

    const hobbyIds = new Map<string, number>();
    HOBBIES.forEach((name, index) => {
      const id = index + 1;
      insertHobby.run(id, name);
      hobbyIds.set(name, id);
    });

    for (let id = 1; id <= USER_COUNT; id++) {
      const sex = faker.person.sexType();
      const nationalityName = faker.helpers.arrayElement(NATIONALITIES);

      insertUser.run(
        id,
        `https://api.dicebear.com/9.x/avataaars/svg?seed=${id}`,
        faker.person.firstName(sex),
        faker.person.lastName(),
        faker.number.int({ min: 18, max: 80 }),
        nationalityIds.get(nationalityName)!,
      );

      for (const hobbyName of randomHobbyNames()) {
        insertUserHobby.run(id, hobbyIds.get(hobbyName)!);
      }
    }
  });

  seedAll();
}

if (require.main === module) {
  seed();
  console.log(`Seeded ${USER_COUNT} users.`);
}
