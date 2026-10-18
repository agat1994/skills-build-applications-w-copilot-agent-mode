import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Activity = {
  id?: string | number;
  name?: string;
  type?: string;
  activity?: string;
  activity_type?: string;
  minutes?: number;
  duration?: number;
  points?: number;
  date?: string;
  user?: string | { username?: string; name?: string };
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivities() {
      try {
        const data = await getJson<unknown>('/api/activities', { signal: controller.signal });
        const items = Array.isArray(data)
          ? data
          : data && typeof data === 'object' && 'activities' in data && Array.isArray(data.activities)
            ? data.activities
            : [];
        setActivities(items as Activity[]);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load activities.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadActivities();
    return () => controller.abort();
  }, []);

  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points.">
      {loading ? (
        <p role="status">Loading activities…</p>
      ) : error ? (
        <p role="alert">Unable to load activities: {error}</p>
      ) : activities.length === 0 ? (
        <p>No activities found.</p>
      ) : (
        <ul aria-label="Activities list">
          {activities.map((activity, index) => {
            const title = activity.name ?? activity.activity ?? activity.activity_type ?? activity.type ?? 'Activity';
            const participant = typeof activity.user === 'object'
              ? activity.user?.name ?? activity.user?.username
              : activity.user;
            return (
              <li key={activity.id ?? `${title}-${index}`}>
                <strong>{title}</strong>
                {participant && <span> — {participant}</span>}
                {(activity.minutes ?? activity.duration) != null && (
                  <span> · {activity.minutes ?? activity.duration} minutes</span>
                )}
                {activity.points != null && <span> · {activity.points} points</span>}
                {activity.date && <time dateTime={activity.date}> · {activity.date}</time>}
              </li>
            );
          })}
        </ul>
      )}
    </CapabilityCard>
  );
}
