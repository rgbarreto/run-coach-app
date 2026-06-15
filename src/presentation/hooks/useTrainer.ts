import { useState, useEffect, useCallback } from 'react';
import { services } from '@/services/ServiceContainer';
import { User } from '@/domain/models/User';
import { WorkoutPlan, WorkoutType } from '@/domain/models/WorkoutPlan';
import { Activity } from '@/domain/models/Activity';
import { HealthMetric } from '@/domain/models/HealthMetrics';

export function useTrainer(coachId: string) {
  const [athletes, setAthletes] = useState<User[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<User | null>(null);
  const [athleteWorkouts, setAthleteWorkouts] = useState<WorkoutPlan[]>([]);
  const [athleteActivities, setAthleteActivities] = useState<Activity[]>([]);
  const [athleteMetrics, setAthleteMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAthletes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await services.databaseService.getAthletesByCoach(coachId);
      setAthletes(list);
      if (list.length > 0 && !selectedAthlete) {
        setSelectedAthlete(list[0]);
      }
    } catch (err) {
      setError('Erro ao carregar atletas vinculados.');
    } finally {
      setLoading(false);
    }
  }, [coachId, selectedAthlete]);

  const loadAthleteDetails = useCallback(async (athleteId: string) => {
    try {
      const db = services.databaseService;
      const [workouts, activities, metrics] = await Promise.all([
        db.getWorkoutPlans(athleteId),
        db.getActivities(athleteId),
        db.getHealthMetrics(athleteId)
      ]);
      setAthleteWorkouts(workouts);
      setAthleteActivities(activities);
      setAthleteMetrics(metrics);
    } catch (err) {
      setError('Erro ao carregar métricas do atleta.');
    }
  }, []);

  useEffect(() => {
    loadAthletes();
  }, [loadAthletes]);

  useEffect(() => {
    if (selectedAthlete) {
      loadAthleteDetails(selectedAthlete.id);
    }
  }, [selectedAthlete, loadAthleteDetails]);

  const assignWorkout = async (
    title: string,
    description: string,
    type: WorkoutType,
    scheduledDate: Date,
    details: {
      targetDistance?: number;
      targetPace?: string;
      intervals?: string;
      exercises?: { name: string; sets: number; reps: string; weight?: string; notes?: string }[];
    }
  ) => {
    if (!selectedAthlete) return;

    try {
      const newPlan = new WorkoutPlan({
        id: `plan-${Math.random().toString(36).substring(2, 9)}`,
        athleteId: selectedAthlete.id,
        coachId,
        title,
        description,
        type,
        scheduledDate,
        status: 'pending',
        ...details
      });

      await services.databaseService.createWorkoutPlan(newPlan);
      // Reload details
      await loadAthleteDetails(selectedAthlete.id);
    } catch (err: any) {
      setError('Erro ao atribuir novo treino: ' + err.message);
    }
  };

  return {
    athletes,
    selectedAthlete,
    athleteWorkouts,
    athleteActivities,
    athleteMetrics,
    loading,
    error,
    setSelectedAthlete,
    assignWorkout,
    refreshAthleteData: () => selectedAthlete && loadAthleteDetails(selectedAthlete.id)
  };
}
