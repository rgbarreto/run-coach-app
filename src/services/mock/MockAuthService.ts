import { IAuthService } from '../interfaces/IAuthService';
import { User, UserRole } from '@/domain/models/User';
import { IDatabaseService } from '../interfaces/IDatabaseService';

export class MockAuthService implements IAuthService {
  private currentUser: User | null = null;
  private db: IDatabaseService;
  private listeners: Set<(user: User | null) => void> = new Set();

  constructor(db: IDatabaseService) {
    this.db = db;
    // Default to mock athlete as logged in for development convenience
    this.initSession();
  }

  private async initSession() {
    const athlete = await this.db.getUser('athlete-1');
    if (athlete) {
      this.currentUser = athlete;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.currentUser));
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async signIn(email: string, password: string): Promise<User> {
    const users = await this.db.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
      this.currentUser = user;
      this.notifyListeners();
      return user;
    } else {
      // Create a default user on demand if login doesn't match seed data
      const id = 'user-' + Math.random().toString(36).substring(2, 9);
      const isCoachEmail = email.includes('coach') || email.includes('trainer');
      const isAdminEmail = email.includes('admin');
      let role: UserRole = 'athlete';
      if (isCoachEmail) role = 'trainer';
      if (isAdminEmail) role = 'admin';

      const newUser = new User({
        id,
        name: email.split('@')[0].toUpperCase(),
        email,
        role,
        createdAt: new Date()
      });
      await this.db.createUser(newUser);
      this.currentUser = newUser;
      this.notifyListeners();
      return newUser;
    }
  }

  async signUp(email: string, password: string, name: string, role: 'athlete' | 'trainer'): Promise<User> {
    const id = 'user-' + Math.random().toString(36).substring(2, 9);
    const newUser = new User({
      id,
      name,
      email,
      role,
      createdAt: new Date()
    });
    
    await this.db.createUser(newUser);
    this.currentUser = newUser;
    this.notifyListeners();
    return newUser;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.notifyListeners();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    // Fire initially
    callback(this.currentUser);
    
    return () => {
      this.listeners.delete(callback);
    };
  }
}
