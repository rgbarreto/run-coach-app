import { useState, useEffect, useCallback } from 'react';
import { services } from '@/services/ServiceContainer';
import { Activity } from '@/domain/models/Activity';
import { HealthMetric } from '@/domain/models/HealthMetrics';
import { WorkoutPlan } from '@/domain/models/WorkoutPlan';

export function useDashboard(athleteId: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [isGarminConnected, setIsGarminConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = services.databaseService;
      const health = services.healthDataService;

      const [loadedActivities, loadedMetrics, loadedWorkouts, connected] = await Promise.all([
        db.getActivities(athleteId),
        db.getHealthMetrics(athleteId),
        db.getWorkoutPlans(athleteId),
        health.isGarminConnected(athleteId)
      ]);

      setActivities(loadedActivities);
      setHealthMetrics(loadedMetrics);
      setWorkouts(loadedWorkouts);
      setIsGarminConnected(connected);
    } catch (err: any) {
      console.error(err);
      setError('Falha ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  }, [athleteId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const connectGarmin = async () => {
    try {
      const url = await services.healthDataService.connectGarmin(athleteId);
      // In a real app, you open this URL using WebBrowser:
      // await WebBrowser.openBrowserAsync(url);
      // For mock, we will immediately toggle connection state
      setIsGarminConnected(true);
      return url;
    } catch (err: any) {
      setError('Falha ao conectar com o Garmin.');
    }
  };

  const disconnectGarmin = async () => {
    try {
      await services.healthDataService.disconnectGarmin(athleteId);
      setIsGarminConnected(false);
    } catch (err: any) {
      setError('Falha ao desconectar do Garmin.');
    }
  };

  const syncGarmin = async () => {
    if (!isGarminConnected) return;
    setSyncing(true);
    setError(null);
    try {
      const result = await services.healthDataService.syncLatestData(athleteId);
      
      const db = services.databaseService;
      
      // Save results to database
      await Promise.all([
        ...result.activities.map(a => db.saveActivity(a)),
        ...result.metrics.map(m => db.saveHealthMetric(m))
      ]);

      // Reload
      await loadData();
    } catch (err: any) {
      setError('Erro ao sincronizar dados com o Garmin.');
    } finally {
      setSyncing(false);
    }
  };

  const syncGarminPersonal = async (emailKey: string, passwordKey: string) => {
    setSyncing(true);
    setError(null);
    try {
      const result = await services.healthDataService.syncPersonalData(athleteId, emailKey, passwordKey);
      
      const db = services.databaseService;
      
      // Save results to database
      await Promise.all([
        ...result.activities.map(a => db.saveActivity(a)),
        ...result.metrics.map(m => db.saveHealthMetric(m))
      ]);

      setIsGarminConnected(true);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao sincronizar dados com suas credenciais Garmin.');
      throw err;
    } finally {
      setSyncing(false);
    }
  };
      setError('Erro ao sincronizar dados com o Garmin.');
    } finally {
      setSyncing(false);
    }
  };

  const logWorkoutManual = async (plan: WorkoutPlan, rpe: number, feedback: string) => {
    try {
      const db = services.databaseService;
      
      // 1. Create a manual activity
      const manualActivity = new Activity({
        id: `man-act-${Math.random().toString(36).substring(2, 9)}`,
        athleteId,
        type: plan.type,
        title: plan.title + ' (Manual)',
        distance: plan.targetDistance || 0,
        duration: plan.targetDuration || 3600, // 1 hour default
        startTime: new Date(),
        source: 'manual'
      });

      // 2. Save activity
      await db.saveActivity(manualActivity);

      // 3. Mark workout plan as completed
      plan.complete(manualActivity.id, rpe, feedback);
      await db.updateWorkoutPlan(plan);

      // Reload
      await loadData();
    } catch (err: any) {
      setError('Erro ao registrar treino manualmente.');
    }
  };

  return {
    activities,
    healthMetrics,
    workouts,
    isGarminConnected,
    loading,
    syncing,
    error,
    refresh: loadData,
    connectGarmin,
    disconnectGarmin,
    syncGarmin,
    syncGarminPersonal,
    logWorkoutManual
  };
}
