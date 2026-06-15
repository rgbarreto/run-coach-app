import { Activity } from '@/domain/models/Activity';
import { HealthMetric } from '@/domain/models/HealthMetrics';

export interface IHealthDataService {
  connectGarmin(athleteId: string): Promise<string>; // Returns auth redirect URL
  disconnectGarmin(athleteId: string): Promise<void>;
  isGarminConnected(athleteId: string): Promise<boolean>;
  syncLatestData(athleteId: string): Promise<{ activities: Activity[]; metrics: HealthMetric[] }>;
  syncPersonalData(athleteId: string, email: string, password: string): Promise<{ activities: Activity[]; metrics: HealthMetric[] }>;
}
