// import { Household } from "./apitypes";
// import Photo from "@/assets/donaldT.jpg"
// import Tambo from "@/assets/Tambo.png"

// const isAdopted = (role: string) => /adopted/i.test(role);
// const isStep = (role: string) => /step/i.test(role);
// const relTypeForChild = (role: string) =>
//   isAdopted(role) ? "adopted" : isStep(role) ? "step" : "blood";

// export type UINode = Node & { name: string; role: string };
// const roleCategories = {
//   spouse: ["Spouse", "Partner"],

//   children: [
//     "Son", "Daughter",
//     "Stepdaughter", "Stepson",
//     "Adopted Daughter", "Adopted Son",
//     "Stepdaughter in law", "Stepson in law",
//     "Daughter in law", "Son in law"
//   ],

//   parents: [
//     "Father", "Mother",
//     "Stepfather", "Stepmother",
//     "Father in law", "Mother in law"
//   ],

//   grandparents: [
//     "Grandfather", "Grandmother",
//     "Stepgranddaughter", "Stepgrandson",
//     "Granddaughter", "Grandson",
//     "Granddaughter in law", "Grandson in law"
//   ],

//   siblings: [
//     "Brother", "Sister",
//     "Stepbrother", "Stepsister",
//     "Brother in law", "Sister in law"
//   ],

//   extended: [
//     "Auntie", "Uncle", "Cousin",
//     "Nephew", "Niece"
//   ],

//   others: [
//     "Friend", "Tenant",
//     "House maid/helper", "Others"
//   ]
// }


// export function buildFamilyTree(household: Household) {
//   const { member: members } = household;

//   const getFullName = (r: any) => `${r.Firstname} ${r.Lastname}`;

//   const head = members?.find(r => r.Role === "Head");
//   const spouse = members?.find(r => roleCategories.spouse.includes(r.Role));

//   return members.map(r => {
//     let parents: string[] = [];

//     // Head → root
//     if (r.Role === "Head") {
//       parents = [];
//     }

//     // Spouse → linked to Head
//     else if (roleCategories.spouse.includes(r.Role)) {
//       if (head) parents.push(head.ID.toString());
//     }

//     // Children → Head (and Spouse if present)
//     else if (roleCategories.children.includes(r.Role)) {
//       if (head) parents.push(head.ID.toString());
//       if (spouse) parents.push(spouse.ID.toString());
//     }

//     // Parents of Head
//     else if (roleCategories.parents.includes(r.Role)) {
//       if (head) {
//         parents = []; // top generation in the household
//       }
//     }

//     // Grandparents of Head
//     else if (roleCategories.grandparents.includes(r.Role)) {
//       const parent = members.find(m => roleCategories.parents.includes(m.Role));
//       if (parent) parents.push(parent.ID.toString());
//     }

//     // Siblings of Head
//     else if (roleCategories.siblings.includes(r.Role)) {
//       // siblings share parents with head
//       const headParents = members.filter(m => roleCategories.parents.includes(m.Role));
//       parents = headParents.map(m => m.ID.toString());
//     }

//     // In-laws → tied to spouse or related sibling
//     else if (r.Role.toLowerCase().includes("in law")) {
//       if (spouse) {
//         parents.push(spouse.ID.toString());
//       } else if (head) {
//         parents.push(head.ID.toString());
//       }
//     }

//     // Extended/others → fallback to Head
//     else {
//       if (head) parents.push(head.ID.toString());
//     }

//     return {
//       id: r.ID.toString(),
//       name: getFullName(r),
//       role: r.Role,
//       parents,
//     };
//   });
// }


// export const orgChart = {
//   id: 1,
//   name: "Barangay Captain",
//   resident_name: "Donald Trump",
//   photo: Photo,
//   children: [
//     {
//       name: "Councilors",
//       resident_name: "Sangguniang Barangay",
//       photo: Tambo,
//       children: [
//         { id: 2, name: "Barangay Kagawad 1", resident_name: "John Doe", photo: Photo },
//         { id: 3, name: "Barangay Kagawad 2", resident_name: "Jane Smith", photo: Photo },
//         { id: 4, name: "Barangay Kagawad 3", resident_name: "Alice Lee", photo: Photo },
//         { id: 5, name: "Barangay Kagawad 4", resident_name: "Bob Tan", photo: Photo },
//         { id: 6, name: "Barangay Kagawad 5", resident_name: "Charlie Cruz", photo: Photo },
//         { id: 7, name: "Barangay Kagawad 6", resident_name: "Diana Yu", photo: Photo },
//         { id: 8, name: "Barangay Kagawad 7", resident_name: "Edward Lim", photo: Photo },
//         {
//           name: "SK Chairperson",
//           resident_name: "Jerome Patrick Tayco",
//           photo: Photo,
//           children: [
//             { id: 9, name: "SK Kagawad 1", resident_name: "SK1 Name", photo: Photo },
//             { id: 10, name: "SK Kagawad 2", resident_name: "SK2 Name", photo: Photo },
//             { id: 11, name: "SK Kagawad 3", resident_name: "SK3 Name", photo: Photo },
//             { name: "SK Kagawad 4", resident_name: "SK4 Name", photo: Photo },
//             { name: "SK Kagawad 5", resident_name: "SK5 Name", photo: Photo },
//             { name: "SK Kagawad 6", resident_name: "SK6 Name", photo: Photo },
//             { name: "SK Kagawad 7", resident_name: "SK7 Name", photo: Photo },
//           ],
//         },
//       ],
//     },
//     { name: "Secretary", resident_name: "Evangelyn Diesta", photo: Photo },
//     { name: "Treasurer", resident_name: "Jane Doe", photo: Photo },
//     {
//       name: "BNS/BHW", resident_name: "BNS/BHW Group", photo: Tambo, children: [
//         {
//           name: "Nurse",
//           resident_name: "Joseph Durant",
//           children: [
//             {
//               resident_name: "Jennifer Doe",
//               name: "BHW"
//             },
//             {
//               resident_name: "Jennifer Doe",
//               name: "BHW"
//             }
//           ]
//         },
//       ]
//     },
//     {
//       name: "Staff",
//       resident_name: "Staff Group",
//       photo: Tambo,
//       children: [
//         { name: "Utility/Maintenance", resident_name: "Utility Name", photo: Photo },
//         { name: "Driver", resident_name: "Driver Name", photo: Photo },
//       ],
//     },
//     {
//       name: "Chief Tanod",
//       resident_name: "Sheer Jay Francisco",
//       photo: Photo,
//       children: [
//         { name: "Tanod 1", resident_name: "Tanod 1 Name", photo: Photo },
//         { name: "Tanod 2", resident_name: "Tanod 2 Name", photo: Photo },
//         { name: "Tanod 3", resident_name: "Tanod 3 Name", photo: Photo },
//         { name: "Tanod 4", resident_name: "Tanod 4 Name", photo: Photo },
//         { name: "Tanod 5", resident_name: "Tanod 5 Name", photo: Photo },
//         { name: "Tanod 6", resident_name: "Tanod 6 Name", photo: Photo },
//         { name: "Tanod 7", resident_name: "Tanod 7 Name", photo: Photo },
//         { name: "Tanod 8", resident_name: "Tanod 8 Name", photo: Photo },
//       ],
//     },
//   ],
// };

// type OrgNode = {
//   id: number;
//   role: string; // changed from "name"
//   resident_name: string;
//   photo?: string; // or whatever your image type is
//   children?: OrgNode[];
// };

// // Captain must always have children
// type CaptainNode = OrgNode & {
//   role: "Barangay Captain";
//   children: (CouncilorNode | SecretaryNode | TreasurerNode | BNSNode | StaffNode | TanodNode)[];
// };

// // Councilors group must always have children
// type CouncilorNode = OrgNode & {
//   role: "Councilors";
//   children: (OrgNode | SKChairNode)[];
// };

// // SK Chairperson must always have children
// type SKChairNode = OrgNode & {
//   role: "SK Chairperson";
//   children: OrgNode[];
// };

// // Chief Tanod must always have children
// type TanodNode = OrgNode & {
//   role: "Chief Tanod";
//   children: OrgNode[];
// };

// // Other supporting roles (children optional)
// type SecretaryNode = OrgNode & { role: "Secretary" };
// type TreasurerNode = OrgNode & { role: "Treasurer" };
// type BNSNode = OrgNode & { role: "BNS/BHW" };
// type StaffNode = OrgNode & { role: "Staff" };
