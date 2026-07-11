import { User } from './api';

// A tiny in-memory store for the logged-in user (fine for a demo).
let currentUser: User | null = null;

export function setCurrentUser(user: User | null) {
  currentUser = user;
}

export function getCurrentUser(): User | null {
  return currentUser;
}
