export interface HealthMetricProps {
  id: string;
  athleteId: string;
  date: Date;
  restingHeartRate: number;
  vo2Max?: number;
  sleepDurationMinutes?: number; // sleep duration in minutes
  recoveryTimeHours?: number; // recovery time recommended by watch
  bodyBattery?: number; // Garmin body battery score (0-100)
  hrvStatus?: number; // Heart Rate Variability (ms)
  steps?: number;
  activeCalories?: number;
}

export class HealthMetric {
  private props: HealthMetricProps;

  constructor(props: HealthMetricProps) {
    this.validate(props);
    this.props = { ...props };
  }

  private validate(props: HealthMetricProps): void {
    if (!props.id) throw new Error('Metric ID is required');
    if (!props.athleteId) throw new Error('Athlete ID is required');
    if (props.restingHeartRate <= 0) throw new Error('Resting HR must be positive');
  }

  get id(): string { return this.props.id; }
  get athleteId(): string { return this.props.athleteId; }
  get date(): Date { return this.props.date; }
  get restingHeartRate(): number { return this.props.restingHeartRate; }
  get vo2Max(): number | undefined { return this.props.vo2Max; }
  get sleepDurationMinutes(): number | undefined { return this.props.sleepDurationMinutes; }
  get recoveryTimeHours(): number | undefined { return this.props.recoveryTimeHours; }
  get bodyBattery(): number | undefined { return this.props.bodyBattery; }
  get hrvStatus(): number | undefined { return this.props.hrvStatus; }
  get steps(): number | undefined { return this.props.steps; }
  get activeCalories(): number | undefined { return this.props.activeCalories; }

  // Business logic
  getSleepFormatted(): string {
    if (this.props.sleepDurationMinutes === undefined) return '--:--';
    const hours = Math.floor(this.props.sleepDurationMinutes / 60);
    const minutes = this.props.sleepDurationMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  getRecoveryState(): 'recovered' | 'warning' | 'critical' {
    if (this.props.recoveryTimeHours === undefined) return 'recovered';
    if (this.props.recoveryTimeHours > 36) return 'critical';
    if (this.props.recoveryTimeHours > 18) return 'warning';
    return 'recovered';
  }

  toDTO() {
    return {
      id: this.props.id,
      athleteId: this.props.athleteId,
      date: this.props.date.toISOString().split('T')[0],
      restingHeartRate: this.props.restingHeartRate,
      vo2Max: this.props.vo2Max,
      sleepDurationMinutes: this.props.sleepDurationMinutes,
      recoveryTimeHours: this.props.recoveryTimeHours,
      bodyBattery: this.props.bodyBattery,
      hrvStatus: this.props.hrvStatus,
      steps: this.props.steps,
      activeCalories: this.props.activeCalories,
    };
  }
}
