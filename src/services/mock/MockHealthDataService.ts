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

  async syncPersonalData(athleteId: string, email: string, password: string): Promise<{ activities: Activity[]; metrics: HealthMetric[] }> {
    try {
      const response = await fetch('http://localhost:3000/garmin/personal-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, athleteId })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.synced) {
        throw new Error(result.message || 'Falha desconhecida no retorno do servidor.');
      }

      // Map raw JSON to Domain Entities
      const activities = result.synced.activities.map((act: any) => new Activity({
        ...act,
        startTime: new Date(act.startTime)
      }));

      const metrics = result.synced.metrics.map((met: any) => new HealthMetric({
        ...met,
        date: new Date(met.date)
      }));

      this.connectedUsers.add(athleteId); // Mark connected on success

      return { activities, metrics };

    } catch (error: any) {
      console.error('[HealthService] Personal Sync Error:', error.message);
      throw new Error(
        `Falha na sincronização pessoal. Verifique se o servidor backend está rodando em http://localhost:3000 (npm start na pasta backend). Detalhes: ${error.message}`
      );
    }
  }
}
