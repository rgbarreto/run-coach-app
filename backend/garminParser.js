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

/**
 * Parses data fetched from the personal garmin-connect Node client
 */
export function parsePersonalGarminActivity(personalActivity, athleteId) {
  const distance = personalActivity.distance || 0;
  const duration = personalActivity.duration || personalActivity.elapsedDuration || 0;
  const activityType = (personalActivity.activityType?.typeKey || personalActivity.activityType || '').toLowerCase();
  
  let type = 'other';
  if (activityType.includes('running') || activityType.includes('run')) {
    type = 'run';
  } else if (activityType.includes('strength') || activityType.includes('gym') || activityType.includes('fitness')) {
    type = 'gym';
  }

  let pace;
  if (type === 'run' && distance > 0 && duration > 0) {
    pace = Math.round(duration / (distance / 1000));
  }

  return {
    id: `garmin-personal-act-${personalActivity.activityId || Math.random().toString(36).substring(2, 9)}`,
    athleteId,
    type,
    title: personalActivity.activityName || (type === 'run' ? 'Corrida Pessoal' : 'Fortalecimento Pessoal'),
    distance: Math.round(distance), // in meters
    duration: Math.round(duration), // in seconds
    startTime: personalActivity.startTimeLocal || new Date().toISOString(),
    averageHeartRate: personalActivity.averageHR || personalActivity.averageHeartRate,
    maxHeartRate: personalActivity.maxHR || personalActivity.maxHeartRate,
    calories: personalActivity.calories,
    pace,
    cadence: personalActivity.averageRunningCadenceInStepsPerMinute || personalActivity.averageCadence,
    elevationGain: personalActivity.elevationGain || 0,
    source: 'garmin',
    externalId: String(personalActivity.activityId)
  };
}

export function parsePersonalGarminDaily(personalDaily, athleteId) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  return {
    id: `garmin-personal-daily-${Math.random().toString(36).substring(2, 9)}`,
    athleteId,
    date: personalDaily.date || todayStr,
    restingHeartRate: personalDaily.restingHeartRate || 60,
    vo2Max: personalDaily.vo2Max || undefined,
    sleepDurationMinutes: personalDaily.sleepDurationMinutes || undefined,
    bodyBattery: personalDaily.bodyBattery || undefined,
    hrvStatus: personalDaily.hrvStatus || undefined,
    steps: personalDaily.steps || 0,
    activeCalories: personalDaily.activeCalories || 0
  };
}

