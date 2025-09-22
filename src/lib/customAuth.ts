import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface SignUpData {
  username: string;
  password: string;
}

export interface SignInData {
  username: string;
  password: string;
}

// Simple hash function (in production, use bcrypt or similar)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Verify password against hash
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

// Store user in localStorage (temporary until migration is complete)
const storeUserSession = (user: User): void => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

// Get user from localStorage
const getUserFromStorage = (): User | null => {
  const userData = localStorage.getItem('auth_user');
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

// Sign up user (placeholder until migration is run)
export const signUp = async (data: SignUpData) => {
  try {
    // For now, simulate signup with localStorage until migration is complete
    const existingUsers = JSON.parse(localStorage.getItem('temp_users') || '[]');
    const userExists = existingUsers.find((u: any) => u.username === data.username);
    
    if (userExists) {
      return { error: 'Username already exists' };
    }

    // Create new user
    const newUser = {
      id: 'temp-' + Date.now(),
      username: data.username,
      password_hash: await hashPassword(data.password),
      created_at: new Date().toISOString(),
    };

    existingUsers.push(newUser);
    localStorage.setItem('temp_users', JSON.stringify(existingUsers));

    return { 
      user: {
        id: newUser.id,
        username: newUser.username,
        created_at: newUser.created_at,
      }, 
      error: null 
    };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Sign in user (placeholder until migration is run)
export const signIn = async (data: SignInData) => {
  try {
    // For now, use localStorage until migration is complete
    const existingUsers = JSON.parse(localStorage.getItem('temp_users') || '[]');
    const user = existingUsers.find((u: any) => u.username === data.username);

    if (!user) {
      return { error: 'Invalid username or password' };
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password_hash);
    if (!isValidPassword) {
      return { error: 'Invalid username or password' };
    }

    // Store user session
    const userData = {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
    };
    
    storeUserSession(userData);

    return { user: userData, error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Sign out user
export const signOut = async () => {
  // Remove from localStorage
  localStorage.removeItem('auth_user');
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  return getUserFromStorage();
};

// Change password (placeholder until migration is run)
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Not authenticated' };
    }

    // For now, use localStorage until migration is complete
    const existingUsers = JSON.parse(localStorage.getItem('temp_users') || '[]');
    const userIndex = existingUsers.findIndex((u: any) => u.id === currentUser.id);
    
    if (userIndex === -1) {
      return { error: 'User not found' };
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, existingUsers[userIndex].password_hash);
    if (!isValidPassword) {
      return { error: 'Current password is incorrect' };
    }

    // Update password
    existingUsers[userIndex].password_hash = await hashPassword(newPassword);
    localStorage.setItem('temp_users', JSON.stringify(existingUsers));

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};