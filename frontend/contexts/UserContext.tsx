import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email: string;
  isMember: boolean;
  memberName?: string | null;
}

interface UserContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  isMember: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
  hasProfile: boolean;
  setUser: (user: { email: string; isMember: boolean; memberName?: string | null }) => void;
  setIsMember: (isMember: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = '@conscience_soufie_user_profile';

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMemberState] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedProfile = JSON.parse(stored);
        setProfile(parsedProfile);
        setIsMemberState(parsedProfile.isMember || false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (newProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
      setIsMemberState(newProfile.isMember || false);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const clearProfile = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setProfile(null);
      setIsMemberState(false);
    } catch (error) {
      console.error('Error clearing profile:', error);
      throw error;
    }
  };

  const setUser = (user: { email: string; isMember: boolean; memberName?: string | null }) => {
    const newProfile: UserProfile = {
      email: user.email,
      isMember: user.isMember,
      memberName: user.memberName,
    };
    saveProfile(newProfile);
  };

  const setIsMember = (memberStatus: boolean) => {
    setIsMemberState(memberStatus);
    if (profile) {
      saveProfile({ ...profile, isMember: memberStatus });
    }
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        isLoading,
        isMember,
        saveProfile,
        clearProfile,
        hasProfile: !!profile,
        setUser,
        setIsMember,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
