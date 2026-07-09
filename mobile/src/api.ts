// The backend address - your LIVE Railway deployment.
// Because it's public, the app works everywhere with no laptop needed:
// Expo Go on any phone, the web preview, and the published demo build.
export const API_URL = 'https://pixelhive-backend-production.up.railway.app';

export type User = {
  id: number;
  email: string;
  fullName: string;
  role: string;
};

export type Project = {
  id: number;
  title: string;
  status: string;
  price: number | null;
  description?: string;
  creator?: User;
  client?: User | null;
};

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid email or password');
  return res.json();
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/api/projects`);
  if (!res.ok) throw new Error('Could not load projects');
  return res.json();
}
