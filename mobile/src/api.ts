import { getToken } from './auth';

// The backend address - your LIVE Railway deployment.
// Because it's public, the app works everywhere with no laptop needed.
export const API_URL = 'https://pixelhive-backend-production.up.railway.app';

export type User = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt?: string;
};

export type LoginResult = {
  token: string;
  user: User;
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

export type MediaAsset = {
  id: number;
  fileName: string;
  s3KeyOriginal: string;
  s3KeyPreview: string | null;
  fileSize: number | null;
  previewData?: string | null; // base64 data-URL of the uploaded picture
  status: string; // uploaded | watermarked | released
  viewCount: number;
  downloadCount: number;
};

export type Contract = {
  id: number;
  content: string;
  status: string; // draft | sent | signed
  signedAt: string | null;
};

export type Message = {
  id: number;
  content: string;
  createdAt: string;
  sender?: User;
};

export type NotificationItem = {
  id: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

// Every authenticated request carries the JWT from login.
function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = { ...(options.headers as any) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, { ...options, headers });
}

async function jsonOrThrow(res: Response, message: string) {
  if (res.status === 401) throw new Error('Session expired - please log in again');
  if (!res.ok) throw new Error(message);
  return res.json();
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid email or password');
  return res.json();
}

export async function register(
  fullName: string,
  email: string,
  password: string,
  role: string
): Promise<User> {
  const res = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password, role }),
  });
  if (!res.ok) throw new Error('Could not create account. That email may already be in use.');
  return res.json();
}

export async function getProjects(): Promise<Project[]> {
  return jsonOrThrow(await apiFetch('/api/projects'), 'Could not load projects');
}

export async function getProject(id: number): Promise<Project> {
  return jsonOrThrow(await apiFetch(`/api/projects/${id}`), 'Could not load project');
}

export async function getProjectMedia(projectId: number): Promise<MediaAsset[]> {
  return jsonOrThrow(
    await apiFetch(`/api/media?projectId=${projectId}`),
    'Could not load media'
  );
}

export async function getContract(projectId: number): Promise<Contract | null> {
  const list: Contract[] = await jsonOrThrow(
    await apiFetch(`/api/contracts?projectId=${projectId}`),
    'Could not load contract'
  );
  return list.length ? list[0] : null;
}

export async function generateContract(projectId: number): Promise<Contract> {
  return jsonOrThrow(
    await apiFetch('/api/contracts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    }),
    'Could not generate contract'
  );
}

export async function signContract(contractId: number): Promise<Contract> {
  return jsonOrThrow(
    await apiFetch(`/api/contracts/${contractId}/sign`, { method: 'POST' }),
    'Could not sign contract'
  );
}

export async function payForProject(projectId: number, amount: number): Promise<any> {
  return jsonOrThrow(
    await apiFetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, amount, paystackRef: 'DEMO-' + Date.now() }),
    }),
    'Payment failed'
  );
}

export async function uploadMedia(
  projectId: number,
  fileName: string,
  fileSize: number,
  previewData?: string
): Promise<MediaAsset> {
  return jsonOrThrow(
    await apiFetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        fileName,
        s3KeyOriginal: `originals/p${projectId}/${fileName}`,
        s3KeyPreview: `previews/p${projectId}/${fileName}`,
        fileSize,
        previewData,
      }),
    }),
    'Upload failed'
  );
}

export async function getMessages(projectId: number): Promise<Message[]> {
  return jsonOrThrow(
    await apiFetch(`/api/messages?projectId=${projectId}`),
    'Could not load messages'
  );
}

export async function sendMessage(
  projectId: number,
  senderId: number,
  content: string
): Promise<Message> {
  return jsonOrThrow(
    await apiFetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, senderId, content }),
    }),
    'Could not send message'
  );
}

export async function getNotifications(userId: number): Promise<NotificationItem[]> {
  return jsonOrThrow(
    await apiFetch(`/api/notifications?userId=${userId}`),
    'Could not load notifications'
  );
}

export async function markNotificationRead(id: number): Promise<NotificationItem> {
  return jsonOrThrow(
    await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' }),
    'Could not update notification'
  );
}
