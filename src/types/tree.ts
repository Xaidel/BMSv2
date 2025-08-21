import { Household } from "./types";

const isAdopted = (role: string) => /adopted/i.test(role);
const isStep = (role: string) => /step/i.test(role);
const relTypeForChild = (role: string) =>
  isAdopted(role) ? "adopted" : isStep(role) ? "step" : "blood";

export type UINode = Node & { name: string; role: string };
const roleCategories = {
  spouse: ["Spouse", "Partner"],

  children: [
    "Son", "Daughter",
    "Stepdaughter", "Stepson",
    "Adopted Daughter", "Adopted Son",
    "Stepdaughter in law", "Stepson in law",
    "Daughter in law", "Son in law"
  ],

  parents: [
    "Father", "Mother",
    "Stepfather", "Stepmother",
    "Father in law", "Mother in law"
  ],

  grandparents: [
    "Grandfather", "Grandmother",
    "Stepgranddaughter", "Stepgrandson",
    "Granddaughter", "Grandson",
    "Granddaughter in law", "Grandson in law"
  ],

  siblings: [
    "Brother", "Sister",
    "Stepbrother", "Stepsister",
    "Brother in law", "Sister in law"
  ],

  extended: [
    "Auntie", "Uncle", "Cousin",
    "Nephew", "Niece"
  ],

  others: [
    "Friend", "Tenant",
    "House maid/helper", "Others"
  ]
}


export function buildFamilyTree(household: Household) {
  const { members } = household;

  const getFullName = (r: any) => `${r.firstname} ${r.lastname}`;

  const head = members.find(r => r.role === "Head");
  const spouse = members.find(r => roleCategories.spouse.includes(r.role));

  return members.map(r => {
    let parents: string[] = [];

    // Head → root
    if (r.role === "Head") {
      parents = [];
    }

    // Spouse → linked to Head
    else if (roleCategories.spouse.includes(r.role)) {
      if (head) parents.push(head.id.toString());
    }

    // Children → Head (and Spouse if present)
    else if (roleCategories.children.includes(r.role)) {
      if (head) parents.push(head.id.toString());
      if (spouse) parents.push(spouse.id.toString());
    }

    // Parents of Head
    else if (roleCategories.parents.includes(r.role)) {
      if (head) {
        parents = []; // top generation in the household
      }
    }

    // Grandparents of Head
    else if (roleCategories.grandparents.includes(r.role)) {
      const parent = members.find(m => roleCategories.parents.includes(m.role));
      if (parent) parents.push(parent.id.toString());
    }

    // Siblings of Head
    else if (roleCategories.siblings.includes(r.role)) {
      // siblings share parents with head
      const headParents = members.filter(m => roleCategories.parents.includes(m.role));
      parents = headParents.map(m => m.id.toString());
    }

    // In-laws → tied to spouse or related sibling
    else if (r.role.toLowerCase().includes("in law")) {
      if (spouse) {
        parents.push(spouse.id.toString());
      } else if (head) {
        parents.push(head.id.toString());
      }
    }

    // Extended/others → fallback to Head
    else {
      if (head) parents.push(head.id.toString());
    }

    return {
      id: r.id.toString(),
      name: getFullName(r),
      role: r.role,
      parents,
    };
  });
}
