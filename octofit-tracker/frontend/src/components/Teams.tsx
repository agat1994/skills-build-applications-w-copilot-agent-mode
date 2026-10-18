import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = {
  id?: number | string;
  _id?: string;
  name?: string;
  members?: Array<string | { username?: string; name?: string }>;
  description?: string;
};

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadTeams() {
      try {
        const data = await getJson<unknown>('/api/teams', { signal: controller.signal });
        const records = Array.isArray(data)
          ? data
          : data && typeof data === 'object' && 'teams' in data && Array.isArray(data.teams)
            ? data.teams
            : [];
        setTeams(records as Team[]);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Unable to load teams.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadTeams();
    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="teams-heading">
      <h1 id="teams-heading">Teams</h1>
      <p>Manage teams and members.</p>
      {loading ? (
        <p role="status">Loading teams…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : teams.length === 0 ? (
        <p>No teams found.</p>
      ) : (
        <ul>
          {teams.map((team, index) => (
            <li key={team.id ?? team._id ?? `${team.name ?? 'team'}-${index}`}>
              <h2>{team.name ?? 'Unnamed team'}</h2>
              {team.description && <p>{team.description}</p>}
              <p>
                Members: {team.members?.length ?? 0}
                {team.members && team.members.length > 0 && (
                  <> ({team.members.map((member) => typeof member === 'string' ? member : member.name ?? member.username ?? 'Member').join(', ')})</>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
