export type UserRole = 'athlete' | 'trainer' | 'admin';

export interface UserProps {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.validate(props);
    this.props = { ...props };
  }

  private validate(props: UserProps): void {
    if (!props.id) throw new Error('User ID is required');
    if (!props.name || props.name.trim() === '') throw new Error('User name cannot be empty');
    if (!props.email || !props.email.includes('@')) throw new Error('Invalid email address');
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get email(): string { return this.props.email; }
  get role(): UserRole { return this.props.role; }
  get createdAt(): Date { return this.props.createdAt; }

  isAdmin(): boolean {
    return this.props.role === 'admin';
  }

  isTrainer(): boolean {
    return this.props.role === 'trainer' || this.props.role === 'admin';
  }

  isAthlete(): boolean {
    return this.props.role === 'athlete';
  }

  updateName(newName: string): void {
    if (!newName || newName.trim() === '') throw new Error('Name cannot be empty');
    this.props.name = newName;
  }

  changeRole(newRole: UserRole): void {
    this.props.role = newRole;
  }

  toDTO() {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      role: this.props.role,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
