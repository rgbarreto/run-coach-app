import { IHealthDataService } from '../interfaces/IHealthDataService';
import { Activity } from '@/domain/models/Activity';
import { HealthMetric } from '@/domain/models/HealthMetrics';

export class MockHealthDataService implements IHealthDataService {
  private connectedUsers: Set<string> = new Set(['athlete-1']); // Default seed user as connected

  async connectGarmin(athleteId: string): Promise<string> {
    this.connectedUsers.add(athleteId);
    // Return a mock backend url that handles the oauth signing process
    return `https://run-coach-garmin-mock.web.app/auth/garmin?athleteId=${athleteId}&callback=exp://localhost:8081`;
  }

  async disconnectGarmin(athleteId: string): Promise<void> {
    this.connectedUsers.delete(athleteId);
  }

  async isGarminConnected(athleteId: string): Promise<boolean> {
    return this.connectedUsers.has(athleteId);
  }

  async syncLatestData(athleteId: string): Promise<{ activities: Activity[]; metrics: HealthMetric[] }> {
    if (!this.connectedUsers.has(athleteId)) {
      throw new Error('Garmin is not connected');
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate new mock data to append
    const baseDate = new Date();
    
    // Create a new activity representing a fresh run that was synced
    const newActivity = new Activity({
      id: `synced-act-${Math.random().toString(36).substring(2, 9)}`,
      athleteId,
      type: 'run',
      title: 'Corrida Matinal Garmin ⌚',
      distance: 8500, // 8.5 km
      duration: 2635, // 43m 55s (5:10/km)
      startTime: baseDate,
      averageHeartRate: 152,
      maxHeartRate: 171,
      calories: 590,
      cadence: 176,
      elevationGain: 40,
      source: 'garmin',
      externalId: `garmin-activity-${Math.round(Math.random() * 1000000)}`
    });

    // Create a new health metric for today
    const newMetric = new HealthMetric({
      id: `synced-met-${Math.random().toString(36).substring(2, 9)}`,
      athleteId,
      date: baseDate,
      restingHeartRate: 53, // very fit!
      vo2Max: 46.2, // increased
      sleepDurationMinutes: 495, // 8h 15m
      recoveryTimeHours: 24,
      bodyBattery: 88,
      hrvStatus: 56,
      steps: 12400,
      activeCalories: 680
    });

    return {
      activities: [newActivity],
      metrics: [newMetric]
    };
  }
}
