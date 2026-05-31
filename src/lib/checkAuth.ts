import { NextRequest } from 'next/server';
import { admin } from './firebaseAdmin';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  [key: string]: any;
}

export async function checkAuth(req: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken as AuthenticatedUser;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}
