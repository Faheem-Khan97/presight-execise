import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { faker } from "@faker-js/faker";
import type { User } from "../types/user";

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

faker.seed(SEED);

function randomHobbies(): string[] {
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

function generateUser(id: number): User {
  const sex = faker.person.sexType();
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName();

  return {
    id,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${id}`,
    first_name: firstName,
    last_name: lastName,
    age: faker.number.int({ min: 18, max: 80 }),
    nationality: faker.helpers.arrayElement(NATIONALITIES),
    hobbies: randomHobbies(),
  };
}

const users: User[] = Array.from({ length: USER_COUNT }, (_, index) => generateUser(index + 1));

const outputPath = fileURLToPath(new URL("./data/users.json", import.meta.url));
writeFileSync(outputPath, JSON.stringify(users, null, 2));

console.log(`Generated ${users.length} users -> ${outputPath}`);
