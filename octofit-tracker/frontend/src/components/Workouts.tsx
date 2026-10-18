import { useCallback, useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Workout = {
  id?: string | number;
  name?: string;
  title?: string;
  description?: string;
  duration?: string | number;
  difficulty?: string;
  focus?: string;
  minutes?: number;
  reason?: string;
};

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWorkouts = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');

    try {
      const data = await getJson<unknown>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`);
      if (signal?.aborted) return;
      const items = Array.isArray(data)
        ? data
        : data && typeof data === 'object' && 'suggestions' in data && Array.isArray(data.suggestions)
          ? data.suggestions
          : [];
      if (!Array.isArray(items)) {
        throw new Error('Unable to load workouts. Please try again.');
      }
      setWorkouts(items);
    } catch (cause) {
      if (cause instanceof Error && cause.name === 'AbortError') return;
      setError(cause instanceof Error ? cause.message : 'Unable to load workouts. Please try again.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadWorkouts(controller.signal);
    return () => controller.abort();
  }, [loadWorkouts]);

  return (
    <section aria-labelledby="workouts-title">
      <h2 id="workouts-title">Workout suggestions</h2>
      {loading && <p role="status">Loading workouts...</p>}
      {!loading && error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void loadWorkouts()}>Try again</button>
        </div>
      )}
      {!loading && !error && workouts.length === 0 && <p>No workouts available yet.</p>}
      {!loading && !error && workouts.length > 0 && (
        <ul>
          {workouts.map((workout, index) => (
            <li key={workout.id ?? `${workout.name ?? workout.title ?? 'workout'}-${index}`}>
              <h3>{workout.name ?? workout.title ?? 'Workout'}</h3>
              {workout.description && <p>{workout.description}</p>}
              {(workout.minutes ?? workout.duration) !== undefined && <p>Duration: {workout.minutes ?? workout.duration}{typeof (workout.minutes ?? workout.duration) === 'number' ? ' minutes' : ''}</p>}
              {workout.difficulty && <p>Difficulty: {workout.difficulty}</p>}
              {workout.focus && <p>Focus: {workout.focus}</p>}
              {workout.reason && <p>{workout.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
