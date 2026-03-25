import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { UserProfile } from '../types';

export const authService = {
  signInWithGoogle: async (): Promise<UserProfile> => {
    const result = await signInWithPopup(auth, googleProvider);
    return await authService.syncUserProfile(result.user);
  },
  login: async (email: string, password: string): Promise<UserProfile> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return await authService.syncUserProfile(result.user);
  },
  register: async (email: string, password: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const profile: UserProfile = {
      uid: user.uid, email: user.email || email, fullName: profileData.fullName || user.displayName || email.split('@')[0],
      age: profileData.age, phone: profileData.phone, preferredLanguage: profileData.preferredLanguage || 'ml', preferredScreenReader: profileData.preferredScreenReader || 'nvda'
    };
    await setDoc(doc(db, 'users', user.uid), { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return profile;
  },
  syncUserProfile: async (user: User): Promise<UserProfile> => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) return userDoc.data() as UserProfile;
    const profile: UserProfile = { uid: user.uid, email: user.email || '', fullName: user.displayName || 'User', preferredLanguage: 'ml', preferredScreenReader: 'nvda' };
    await setDoc(doc(db, 'users', user.uid), { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return profile;
  },
  logout: async () => { await signOut(auth); },
  onAuthChange: (callback: (profile: UserProfile | null) => void) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) { const profile = await authService.syncUserProfile(user); callback(profile); }
      else { callback(null); }
    });
  }
};
