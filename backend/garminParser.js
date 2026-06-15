/**
 * Parser for Garmin API JSON response structures
 * Maps Garmin Connect API properties to our Domain Models DTOs
 */

/**
 * Parses Garmin Activity summary payload
 * Garmin schema documentation: https://developer.garmin.com/gc-developer-program/activity-api/
 */
export function parseGarminActivity(garminActivity, athleteId) {
  const distanceMeters = garminActivity.distanceInMeters || garminActivity.distance || 0;
  const durationSeconds = garminActivity.durationInSeconds || garminActivity.activeKilocalories || 0;
  
  let type = 'other';
  const activityType = (garminActivity.activityType || '').toLowerCase();
  if (activityType.includes('run') || activityType.includes('jog')) {
    type = 'run';
  } else if (activityType.includes('fitness') || activityType.includes('strength') || activityType.includes('gym')) {
    type = 'gym';
  }

  // Calculate pace if running
  let pace;
  if (type === 'run' && distanceMeters > 0 && durationSeconds > 0) {
    pace = Math.round(durationSeconds / (distanceMeters / 1000));
  }

  return {
    id: `garmin-act-${garminActivity.summaryId || Math.random().toString(36).substring(2, 9)}`,
    athleteId,
    type,
    title: garminActivity.activityName || (type === 'run' ? 'Corrida Garmin' : 'Musculação Garmin'),
    distance: distanceMeters,
    duration: durationSeconds,
    startTime: new Date(garminActivity.startTimeInSeconds * 1000).toISOString(),
    averageHeartRate: garminActivity.averageHeartRateInBpm || garminActivity.averageHR,
    maxHeartRate: garminActivity.maxHeartRateInBpm || garminActivity.maxHR,
    calories: garminActivity.activeKilocalories || garminActivity.calories,
    pace,
    cadence: garminActivity.averageRunCadenceInStepsPerMinute,
    elevationGain: garminActivity.elevationGainInMeters,
    source: 'garmin',
    externalId: String(garminActivity.summaryId)
  };
}

/**
 * Parses Garmin Daily Summary (resting heart rate, steps, vo2 max)
 * Garmin schema documentation: https://developer.garmin.com/gc-developer-program/daily-summary-api/
 */
export function parseGarminDaily(garminDaily, athleteId) {
  return {
    id: `garmin-daily-${garminDaily.summaryId || Math.random().toString(36).substring(2, 9)}`,
    athleteId,
    date: garminDaily.calendarDate, // e.g. "2026-06-15"
    restingHeartRate: garminDaily.restingHeartRateInBpm || garminDaily.restingHR || 60,
    vo2Max: garminDaily.vo2Max || undefined,
    sleepDurationMinutes: garminDaily.sleepDurationInSeconds ? Math.round(garminDaily.sleepDurationInSeconds / 60) : undefined,
    recoveryTimeHours: garminDaily.recoveryTimeInHours || undefined,
    bodyBattery: garminDaily.bodyBattery || undefined,
    hrvStatus: garminDaily.hrvStatus || undefined,
    steps: garminDaily.steps || 0,
    activeCalories: garminDaily.activeKilocalories || 0
  };
}
