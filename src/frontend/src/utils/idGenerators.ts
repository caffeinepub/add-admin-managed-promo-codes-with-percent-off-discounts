// Simple local generators for ID name and address (no external API calls)

const FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

const STREET_NAMES = [
  'Main', 'Oak', 'Maple', 'Cedar', 'Elm', 'Washington', 'Lake', 'Hill', 'Park', 'Pine',
  'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sunset', 'River', 'Forest', 'Spring', 'Valley'
];

const STREET_TYPES = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Ct', 'Pl'];

const CITIES = [
  'Springfield', 'Franklin', 'Clinton', 'Madison', 'Georgetown', 'Salem', 'Fairview', 'Riverside',
  'Arlington', 'Manchester', 'Oxford', 'Clayton', 'Milton', 'Newport', 'Ashland', 'Burlington',
  'Greenville', 'Bristol', 'Lexington', 'Auburn'
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateFullName(): string {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  return `${firstName} ${lastName}`;
}

export function generateAddress(): {
  street: string;
  city: string;
  state: string;
  zip: string;
} {
  const streetNumber = randomNumber(100, 9999);
  const streetName = randomElement(STREET_NAMES);
  const streetType = randomElement(STREET_TYPES);
  const street = `${streetNumber} ${streetName} ${streetType}`;
  
  const city = randomElement(CITIES);
  
  // Generate a random state code (2 letters)
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  const state = randomElement(states);
  
  const zip = String(randomNumber(10000, 99999));
  
  return { street, city, state, zip };
}
