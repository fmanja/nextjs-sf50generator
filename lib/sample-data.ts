import { Employee } from "@/types";

// Employees: 25 records with basic fields required by PRD data model
const cities = [
  "Washington, DC",
  "Fairfax, VA",
  "Baltimore, MD",
  "Philadelphia, PA",
  "Richmond, VA",
  "Pittsburgh, PA",
  "Norfolk, VA",
  "Harrisburg, PA",
  "Wilmington, DE",
  "Arlington, VA",
];

function seededRand(seed: number) {
  // simple xorshift-ish pseudo-random for deterministic mock data
  let x = seed || 123456789;
  return () => (x = (x ^ (x << 13)) ^ (x >> 17) ^ (x << 5), Math.abs(x) % 1000 / 1000);
}

const rand = seededRand(42);

const employeeNames = [
  "Michael Rodriguez",
  "Sarah Williams",
  "David Kim",
  "Jennifer Martinez",
  "James Thompson",
  "Emily Anderson",
  "Robert Lee",
  "Amanda Garcia",
  "Christopher Brown",
  "Jessica Taylor",
  "Daniel Wilson",
  "Ashley Moore",
  "Matthew Davis",
  "Lauren Jackson",
  "Andrew White",
  "Nicole Harris",
  "Kevin Martin",
  "Rachel Clark",
  "Brian Lewis",
  "Stephanie Walker",
  "Ryan Hall",
  "Megan Young",
  "Justin King",
  "Brittany Wright",
  "Tyler Lopez",
];

export const employees: Employee[] = Array.from({ length: 25 }).map((_, i) => {
  const grade = 7 + (i % 9); // 7..15
  const step = 1 + (i % 10); // 1..10
  const series = [201, 343, 2210, 511, 1102, 511, 201, 2210][i % 8];
  const base = 50000 + grade * 3500 + step * 800;
  const salary = Math.round(base + rand() * 5000);
  const city = cities[i % cities.length];
  return {
    id: `e-${i + 1}`,
    name: employeeNames[i],
    series,
    grade,
    step,
    salary,
    dutyStation: city,
  };
});

