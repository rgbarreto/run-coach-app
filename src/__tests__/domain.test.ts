import { User } from '../domain/models/User';
import { Activity } from '../domain/models/Activity';
import { HealthMetric } from '../domain/models/HealthMetrics';
import { WorkoutPlan } from '../domain/models/WorkoutPlan';

describe('Domain Models Validation & Business Logic', () => {
  
  describe('User Entity', () => {
    it('should create a valid User instance', () => {
      const user = new User({
        id: 'user-123',
        name: 'Thiago Silva',
        email: 'thiago@gmail.com',
        role: 'athlete',
        createdAt: new Date('2026-06-15')
      });

      expect(user.id).toBe('user-123');
      expect(user.name).toBe('Thiago Silva');
      expect(user.email).toBe('thiago@gmail.com');
      expect(user.role).toBe('athlete');
      expect(user.isAthlete()).toBe(true);
      expect(user.isTrainer()).toBe(false);
      expect(user.isAdmin()).toBe(false);
    });

    it('should throw an error if email is invalid', () => {
      expect(() => {
        new User({
          id: 'user-123',
          name: 'Thiago Silva',
          email: 'invalid-email',
          role: 'athlete',
          createdAt: new Date()
        });
      }).toThrow('Invalid email address');
    });

    it('should throw an error if name is empty', () => {
      expect(() => {
        new User({
          id: 'user-123',
          name: '   ',
          email: 'thiago@gmail.com',
          role: 'athlete',
          createdAt: new Date()
        });
      }).toThrow('User name cannot be empty');
    });
  });

  describe('Activity Entity', () => {
    it('should automatically calculate running pace in seconds per km', () => {
      const activity = new Activity({
        id: 'act-1',
        athleteId: 'athlete-1',
        type: 'run',
        title: 'Running Workout',
        distance: 10000, // 10 km
        duration: 3000, // 50 minutes (3000 seconds)
        startTime: new Date(),
        source: 'garmin'
      });

      // Pace = 3000 seconds / 10 km = 300 seconds/km (5:00 min/km)
      expect(activity.pace).toBe(300);
      expect(activity.getFormattedPace()).toBe('5:00 /km');
      expect(activity.getFormattedDistance()).toBe('10.00 km');
      expect(activity.getFormattedDuration()).toBe('50m 0s');
    });

    it('should format durations longer than 1 hour correctly', () => {
      const activity = new Activity({
        id: 'act-2',
        athleteId: 'athlete-1',
        type: 'run',
        title: 'Long run',
        distance: 15000,
        duration: 5400, // 1.5 hours (5400 seconds)
        startTime: new Date(),
        source: 'garmin'
      });

      expect(activity.getFormattedDuration()).toBe('1h 30m 0s');
    });
  });

  describe('HealthMetric Entity', () => {
    it('should return correct recovery status warning thresholds', () => {
      const recoveredMetric = new HealthMetric({
        id: 'h1',
        athleteId: 'athlete-1',
        date: new Date(),
        restingHeartRate: 50,
        recoveryTimeHours: 12
      });

      const warningMetric = new HealthMetric({
        id: 'h2',
        athleteId: 'athlete-1',
        date: new Date(),
        restingHeartRate: 50,
        recoveryTimeHours: 24
      });

      const criticalMetric = new HealthMetric({
        id: 'h3',
        athleteId: 'athlete-1',
        date: new Date(),
        restingHeartRate: 50,
        recoveryTimeHours: 48
      });

      expect(recoveredMetric.getRecoveryState()).toBe('recovered');
      expect(warningMetric.getRecoveryState()).toBe('warning');
      expect(criticalMetric.getRecoveryState()).toBe('critical');
    });
  });

  describe('WorkoutPlan Entity', () => {
    it('should transition to completed and link to an activity when complete() is called', () => {
      const plan = new WorkoutPlan({
        id: 'plan-1',
        athleteId: 'athlete-1',
        coachId: 'coach-1',
        title: '5km Tempo Run',
        description: 'Run 5km at threshold pace.',
        type: 'run',
        scheduledDate: new Date(),
        status: 'pending'
      });

      expect(plan.status).toBe('pending');
      expect(plan.completedActivityId).toBeUndefined();

      plan.complete('act-999', 8, 'Felt good, threshold felt strong.');

      expect(plan.status).toBe('completed');
      expect(plan.completedActivityId).toBe('act-999');
      expect(plan.athleteRpe).toBe(8);
      expect(plan.athleteFeedback).toBe('Felt good, threshold felt strong.');
      expect(plan.completedDate).toBeInstanceOf(Date);
    });
  });
});
