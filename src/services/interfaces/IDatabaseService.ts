import { User, UserRole } from '@/domain/models/User';
import { WorkoutPlan } from '@/domain/models/WorkoutPlan';
import { Activity } from '@/domain/models/Activity';
import { HealthMetric } from '@/domain/models/HealthMetrics';

export interface IDatabaseService {
  getUser(id: string): Promise<User | null>;
  createUser(user: User): Promise<void>;
  updateUserRole(id: string, role: UserRole): Promise<void>;
  
  getAthletesByCoach(coachId: string): Promise<User[]>;
  getCoaches(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  getWorkoutPlans(athleteId: string): Promise<WorkoutPlan[]>;
  createWorkoutPlan(plan: WorkoutPlan): Promise<void>;
  updateWorkoutPlan(plan: WorkoutPlan): Promise<void>;
  
  getActivities(athleteId: string): Promise<Activity[]>;
  saveActivity(activity: Activity): Promise<void>;
  
  getHealthMetrics(athleteId: string): Promise<HealthMetric[]>;
  saveHealthMetric(metric: HealthMetric): Promise<void>;
}
