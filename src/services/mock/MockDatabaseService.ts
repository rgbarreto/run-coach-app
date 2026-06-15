import { IDatabaseService } from '../interfaces/IDatabaseService';
import { User, UserRole } from '@/domain/models/User';
import { WorkoutPlan } from '@/domain/models/WorkoutPlan';
import { Activity } from '@/domain/models/Activity';
import { HealthMetric } from '@/domain/models/HealthMetrics';

export class MockDatabaseService implements IDatabaseService {
  private users: Map<string, User> = new Map();
  private workouts: Map<string, WorkoutPlan> = new Map();
  private activities: Map<string, Activity[]> = new Map();
  private healthMetrics: Map<string, HealthMetric[]> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed Users
    const admin = new User({
      id: 'admin-1',
      name: 'Rodrigo Barreto (Admin)',
      email: 'admin@treino.com',
      role: 'admin',
      createdAt: new Date('2026-01-01')
    });
    
    const coach = new User({
      id: 'coach-1',
      name: 'Treinador Marcos',
      email: 'marcos@treino.com',
      role: 'trainer',
      createdAt: new Date('2026-01-10')
    });

    const athlete = new User({
      id: 'athlete-1',
      name: 'Thiago Silva (Atleta)',
      email: 'thiago@treino.com',
      role: 'athlete',
      createdAt: new Date('2026-02-01')
    });

    this.users.set(admin.id, admin);
    this.users.set(coach.id, coach);
    this.users.set(athlete.id, athlete);

    // Seed Health Metrics for athlete-1 showing a visual progress trend (last 10 days)
    const metrics: HealthMetric[] = [];
    const baseDate = new Date();
    for (let i = 14; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - i);
      
      // Heart rate decreasing from 62 to 55 (getting fitter)
      const rhr = Math.round(62 - (14 - i) * 0.5 + (Math.random() * 2 - 1));
      // VO2 max increasing from 44 to 45.8
      const vo2 = 44 + (14 - i) * 0.12 + (Math.random() * 0.2 - 0.1);
      // Sleep varying between 6.5 and 8.5 hours
      const sleep = 400 + Math.round((Math.random() * 120)) + (i % 3 === 0 ? 60 : 0);
      // Recovery time in hours
      const recovery = i % 4 === 0 ? Math.round(Math.random() * 24 + 12) : Math.round(Math.random() * 12);
      // Body battery
      const bodyBattery = Math.round(60 + (sleep / 60) * 4 + (Math.random() * 10 - 5));

      metrics.push(new HealthMetric({
        id: `metric-${i}`,
        athleteId: 'athlete-1',
        date,
        restingHeartRate: rhr,
        vo2Max: parseFloat(vo2.toFixed(1)),
        sleepDurationMinutes: sleep,
        recoveryTimeHours: recovery,
        bodyBattery: Math.min(100, Math.max(0, bodyBattery)),
        hrvStatus: Math.round(45 + (14 - i) * 0.7 + (Math.random() * 8 - 4)),
        steps: 8000 + Math.round(Math.random() * 6000),
        activeCalories: 300 + Math.round(Math.random() * 500)
      }));
    }
    this.healthMetrics.set('athlete-1', metrics);

    // Seed Activities for athlete-1 (Strava style)
    const activitiesList: Activity[] = [
      new Activity({
        id: 'act-1',
        athleteId: 'athlete-1',
        type: 'run',
        title: 'Longão de Domingo 🏃‍♂️',
        distance: 12000, // 12 km
        duration: 3960, // 1h 06m (5:30/km)
        startTime: new Date(baseDate.getTime() - 2 * 24 * 3600 * 1000), // 2 days ago
        averageHeartRate: 148,
        maxHeartRate: 165,
        calories: 780,
        cadence: 172,
        elevationGain: 85,
        source: 'garmin',
        externalId: 'garmin-act-101'
      }),
      new Activity({
        id: 'act-2',
        athleteId: 'athlete-1',
        type: 'gym',
        title: 'Fortalecimento de MMII 🏋️',
        distance: 0,
        duration: 2700, // 45m
        startTime: new Date(baseDate.getTime() - 3 * 24 * 3600 * 1000), // 3 days ago
        averageHeartRate: 115,
        maxHeartRate: 140,
        calories: 280,
        exercises: [
          {
            name: 'Agachamento Livre',
            sets: [
              { reps: 10, weight: 60 },
              { reps: 10, weight: 70 },
              { reps: 8, weight: 80 }
            ]
          },
          {
            name: 'Cadeira Extensora',
            sets: [
              { reps: 12, weight: 40 },
              { reps: 12, weight: 45 },
              { reps: 10, weight: 50 }
            ]
          },
          {
            name: 'Elevação Pélvica',
            sets: [
              { reps: 15, weight: 50 },
              { reps: 12, weight: 60 },
              { reps: 12, weight: 60 }
            ]
          }
        ],
        source: 'manual'
      }),
      new Activity({
        id: 'act-3',
        athleteId: 'athlete-1',
        type: 'run',
        title: 'Treino de Tiros ⚡',
        distance: 7200, // 7.2 km
        duration: 2160, // 36m (5:00/km avg)
        startTime: new Date(baseDate.getTime() - 5 * 24 * 3600 * 1000), // 5 days ago
        averageHeartRate: 158,
        maxHeartRate: 182,
        calories: 520,
        cadence: 180,
        elevationGain: 25,
        source: 'garmin',
        externalId: 'garmin-act-102'
      })
    ];
    this.activities.set('athlete-1', activitiesList);

    // Seed Workouts Plans
    const plans: WorkoutPlan[] = [
      new WorkoutPlan({
        id: 'plan-1',
        athleteId: 'athlete-1',
        coachId: 'coach-1',
        title: 'Treino de Tiros - 5x 1km',
        description: 'Aquecimento de 15 min leve + 5 tiros de 1km com 2 min de descanso caminhando. Desaquecimento de 10 min.',
        type: 'run',
        scheduledDate: new Date(baseDate.getTime() + 1 * 24 * 3600 * 1000), // tomorrow
        status: 'pending',
        targetDistance: 8000,
        targetPace: '4:45/km',
        intervals: '5x 1km @ 4:45 com 2m recuperação ativo'
      }),
      new WorkoutPlan({
        id: 'plan-2',
        athleteId: 'athlete-1',
        coachId: 'coach-1',
        title: 'Treino de Perna A',
        description: 'Foco em força máxima de membros inferiores para corrida.',
        type: 'gym',
        scheduledDate: new Date(baseDate.getTime() + 2 * 24 * 3600 * 1000), // in 2 days
        status: 'pending',
        exercises: [
          { name: 'Agachamento Costas', sets: 4, reps: '8-10', notes: 'Manter cadência 3-1-1' },
          { name: 'Leg Press 45', sets: 3, reps: '10', notes: 'Foco em amplitude' },
          { name: 'Stiff c/ Halter', sets: 4, reps: '12', notes: 'Sentir posterior' },
          { name: 'Panturrilha Gêmeos', sets: 4, reps: '15', notes: 'Pausa de 2s no pico de contração' }
        ]
      }),
      new WorkoutPlan({
        id: 'plan-3',
        athleteId: 'athlete-1',
        coachId: 'coach-1',
        title: 'Rodagem Regenerativa',
        description: 'Trotinho leve na zona 2 de frequência cardíaca.',
        type: 'run',
        scheduledDate: new Date(baseDate.getTime() - 2 * 24 * 3600 * 1000), // 2 days ago
        status: 'completed',
        targetDistance: 6000,
        targetPace: '6:00/km',
        completedActivityId: 'act-1',
        athleteFeedback: 'Foi tranquilo, me senti recuperado no final.',
        athleteRpe: 3,
        completedDate: new Date(baseDate.getTime() - 2 * 24 * 3600 * 1000)
      })
    ];

    plans.forEach(p => this.workouts.set(p.id, p));
  }

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async createUser(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async updateUserRole(id: string, role: UserRole): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.changeRole(role);
      this.users.set(id, user);
    }
  }

  async getAthletesByCoach(coachId: string): Promise<User[]> {
    // In our mock database, return all users who are athletes
    return Array.from(this.users.values()).filter(u => u.role === 'athlete');
  }

  async getCoaches(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === 'trainer');
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getWorkoutPlans(athleteId: string): Promise<WorkoutPlan[]> {
    return Array.from(this.workouts.values()).filter(w => w.athleteId === athleteId);
  }

  async createWorkoutPlan(plan: WorkoutPlan): Promise<void> {
    this.workouts.set(plan.id, plan);
  }

  async updateWorkoutPlan(plan: WorkoutPlan): Promise<void> {
    this.workouts.set(plan.id, plan);
  }

  async getActivities(athleteId: string): Promise<Activity[]> {
    return this.activities.get(athleteId) || [];
  }

  async saveActivity(activity: Activity): Promise<void> {
    const list = this.activities.get(activity.athleteId) || [];
    list.unshift(activity); // Add to beginning
    this.activities.set(activity.athleteId, list);
  }

  async getHealthMetrics(athleteId: string): Promise<HealthMetric[]> {
    return this.healthMetrics.get(athleteId) || [];
  }

  async saveHealthMetric(metric: HealthMetric): Promise<void> {
    const list = this.healthMetrics.get(metric.athleteId) || [];
    // If metric for date already exists, replace it
    const dateStr = metric.date.toDateString();
    const index = list.findIndex(m => m.date.toDateString() === dateStr);
    if (index >= 0) {
      list[index] = metric;
    } else {
      list.push(metric);
      list.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    this.healthMetrics.set(metric.athleteId, list);
  }
}
