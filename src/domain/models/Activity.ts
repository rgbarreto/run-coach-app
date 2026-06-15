export type ActivityType = 'run' | 'gym' | 'other';

export interface ActivityProps {
  id: string;
  athleteId: string;
  type: ActivityType;
  title: string;
  distance: number; // in meters for runs, 0 for gym
  duration: number; // in seconds
  startTime: Date;
  averageHeartRate?: number;
  maxHeartRate?: number;
  calories?: number;
  // Running specific
  pace?: number; // seconds per km
  cadence?: number; // steps per minute
  elevationGain?: number; // meters
  // Gym specific
  exercises?: {
    name: string;
    sets: { reps: number; weight: number; rpe?: number }[];
  }[];
  // Sync source info
  source: 'garmin' | 'manual';
  externalId?: string; // Garmin activityId
}

export class Activity {
  private props: ActivityProps;

  constructor(props: ActivityProps) {
    this.validate(props);
    this.props = { ...props };
    
    // Automatically calculate pace for runs if not provided
    if (this.props.type === 'run' && this.props.distance > 0 && !this.props.pace) {
      this.props.pace = Math.round(this.props.duration / (this.props.distance / 1000));
    }
  }

  private validate(props: ActivityProps): void {
    if (!props.id) throw new Error('Activity ID is required');
    if (!props.athleteId) throw new Error('Athlete ID is required');
    if (props.duration <= 0) throw new Error('Duration must be greater than zero');
    if (props.type === 'run' && props.distance < 0) throw new Error('Running distance cannot be negative');
  }

  get id(): string { return this.props.id; }
  get athleteId(): string { return this.props.athleteId; }
  get type(): ActivityType { return this.props.type; }
  get title(): string { return this.props.title; }
  get distance(): number { return this.props.distance; }
  get duration(): number { return this.props.duration; }
  get startTime(): Date { return this.props.startTime; }
  get averageHeartRate(): number | undefined { return this.props.averageHeartRate; }
  get maxHeartRate(): number | undefined { return this.props.maxHeartRate; }
  get calories(): number | undefined { return this.props.calories; }
  get pace(): number | undefined { return this.props.pace; }
  get cadence(): number | undefined { return this.props.cadence; }
  get elevationGain(): number | undefined { return this.props.elevationGain; }
  get exercises() { return this.props.exercises; }
  get source(): 'garmin' | 'manual' { return this.props.source; }
  get externalId(): string | undefined { return this.props.externalId; }

  // Business logic
  getFormattedPace(): string {
    if (!this.props.pace) return '--:--';
    const minutes = Math.floor(this.props.pace / 60);
    const seconds = this.props.pace % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  }

  getFormattedDuration(): string {
    const hours = Math.floor(this.props.duration / 3600);
    const minutes = Math.floor((this.props.duration % 3600) / 60);
    const seconds = this.props.duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  }

  getFormattedDistance(): string {
    if (this.props.type === 'gym') return '-';
    const km = this.props.distance / 1000;
    return `${km.toFixed(2)} km`;
  }

  toDTO() {
    return {
      id: this.props.id,
      athleteId: this.props.athleteId,
      type: this.props.type,
      title: this.props.title,
      distance: this.props.distance,
      duration: this.props.duration,
      startTime: this.props.startTime.toISOString(),
      averageHeartRate: this.props.averageHeartRate,
      maxHeartRate: this.props.maxHeartRate,
      calories: this.props.calories,
      pace: this.props.pace,
      cadence: this.props.cadence,
      elevationGain: this.props.elevationGain,
      exercises: this.props.exercises,
      source: this.props.source,
      externalId: this.props.externalId,
    };
  }
}
