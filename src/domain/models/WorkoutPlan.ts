export type WorkoutType = 'run' | 'gym';
export type WorkoutStatus = 'pending' | 'completed' | 'skipped';

export interface WorkoutPlanProps {
  id: string;
  athleteId: string;
  coachId: string;
  title: string;
  description: string;
  type: WorkoutType;
  scheduledDate: Date;
  status: WorkoutStatus;
  
  // Running details
  targetDistance?: number; // meters
  targetDuration?: number; // seconds
  targetPace?: string; // e.g. "5:30/km"
  intervals?: string; // description of intervals e.g. "4x 1km @ 4:30 with 2m recovery"
  
  // Gym details
  exercises?: {
    name: string;
    sets: number;
    reps: string; // e.g. "10" or "8-12"
    weight?: string; // e.g. "50kg" or "RPE 8"
    notes?: string;
  }[];

  // Feedback/Results
  completedActivityId?: string; // Links to Activity after sync or log
  athleteFeedback?: string;
  athleteRpe?: number; // 1-10 rating of perceived exertion
  completedDate?: Date;
}

export class WorkoutPlan {
  private props: WorkoutPlanProps;

  constructor(props: WorkoutPlanProps) {
    this.validate(props);
    this.props = { ...props };
  }

  private validate(props: WorkoutPlanProps): void {
    if (!props.id) throw new Error('Workout Plan ID is required');
    if (!props.athleteId) throw new Error('Athlete ID is required');
    if (!props.coachId) throw new Error('Coach ID is required');
    if (!props.title || props.title.trim() === '') throw new Error('Workout title cannot be empty');
  }

  get id(): string { return this.props.id; }
  get athleteId(): string { return this.props.athleteId; }
  get coachId(): string { return this.props.coachId; }
  get title(): string { return this.props.title; }
  get description(): string { return this.props.description; }
  get type(): WorkoutType { return this.props.type; }
  get scheduledDate(): Date { return this.props.scheduledDate; }
  get status(): WorkoutStatus { return this.props.status; }
  get targetDistance(): number | undefined { return this.props.targetDistance; }
  get targetDuration(): number | undefined { return this.props.targetDuration; }
  get targetPace(): string | undefined { return this.props.targetPace; }
  get intervals(): string | undefined { return this.props.intervals; }
  get exercises() { return this.props.exercises; }
  get completedActivityId(): string | undefined { return this.props.completedActivityId; }
  get athleteFeedback(): string | undefined { return this.props.athleteFeedback; }
  get athleteRpe(): number | undefined { return this.props.athleteRpe; }
  get completedDate(): Date | undefined { return this.props.completedDate; }

  // Business logic
  complete(activityId: string, rpe?: number, feedback?: string): void {
    this.props.status = 'completed';
    this.props.completedActivityId = activityId;
    this.props.athleteRpe = rpe;
    this.props.athleteFeedback = feedback;
    this.props.completedDate = new Date();
  }

  skip(feedback?: string): void {
    this.props.status = 'skipped';
    this.props.athleteFeedback = feedback;
  }

  toDTO() {
    return {
      id: this.props.id,
      athleteId: this.props.athleteId,
      coachId: this.props.coachId,
      title: this.props.title,
      description: this.props.description,
      type: this.props.type,
      scheduledDate: this.props.scheduledDate.toISOString().split('T')[0],
      status: this.props.status,
      targetDistance: this.props.targetDistance,
      targetDuration: this.props.targetDuration,
      targetPace: this.props.targetPace,
      intervals: this.props.intervals,
      exercises: this.props.exercises,
      completedActivityId: this.props.completedActivityId,
      athleteFeedback: this.props.athleteFeedback,
      athleteRpe: this.props.athleteRpe,
      completedDate: this.props.completedDate?.toISOString(),
    };
  }
}
