import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = {
  id?: number | string;
  username?: string;
  name?: string;
  team?: string | { name?: string };
  points?: number;
  total_points?: number;
  teamName?: string;
  totalPoints?: number;
  rank?: number;
};

function getEntries(payload: unknown): LeaderboardEntry[] {
  if (Array.isArray(payload)) return payload as LeaderboardEntry[];
  if (payload && typeof payload === 'object') {
    const data = payload as { results?: unknown; leaderboard?: unknown };
    if (Array.isArray(data.results)) return data.results as LeaderboardEntry[];
    if (Array.isArray(data.leaderboard)) return data.leaderboard as LeaderboardEntry[];
  }
  return [];
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadLeaderboard() {
      try {
        const payload = await getJson<unknown>('/api/leaderboard', { signal: controller.signal });
        setEntries(getEntries(payload));
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load the leaderboard.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadLeaderboard();
    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="leaderboard-title">
      <h2 id="leaderboard-title">Leaderboard</h2>
      <p>Compare team point totals.</p>
      {loading ? (
        <p role="status">Loading leaderboard...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : entries.length === 0 ? (
        <p>No leaderboard entries yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Team</th>
              <th scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const team = entry.teamName ?? (typeof entry.team === 'string' ? entry.team : entry.team?.name) ?? entry.name;
              return (
                <tr key={entry.id ?? entry.username ?? `${entry.name ?? 'entry'}-${index}`}>
                  <td>{entry.rank ?? index + 1}</td>
                  <td>{team ?? '—'}</td>
                  <td>{entry.totalPoints ?? entry.total_points ?? entry.points ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
