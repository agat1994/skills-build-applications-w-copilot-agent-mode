import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw badRequest('Request body must be an object');
  }
  return input as Record<string, unknown>;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw badRequest(`${field} is required`);
  }
  return value.trim();
}

function requireEmail(value: unknown, field: string): string {
  const email = requireString(value, field).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw badRequest(`${field} must be a valid email`);
  }
  return email;
}

function requireNumber(value: unknown, field: string): number {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    (typeof value === 'string' && !value.trim())
  ) {
    throw badRequest(`${field} must be a number`);
  }
  const number = Number(value);
  if (!Number.isFinite(number)) throw badRequest(`${field} must be a number`);
  return number;
}

export async function createActivity(input: unknown) {
  const body = asRecord(input);
  const userId = requireString(body.userId, 'userId');
  const teamId = requireString(body.teamId, 'teamId');
  if (!Types.ObjectId.isValid(userId)) throw badRequest('userId must be a valid ID');
  if (!Types.ObjectId.isValid(teamId)) throw badRequest('teamId must be a valid ID');
  const user = await User.findById(userId);
  const team = await Team.findById(teamId);
  if (!user || !team) throw badRequest('userId and teamId must reference existing records');
  const type = requireString(body.type, 'type');
  const minutes = requireNumber(body.minutes, 'minutes');
  if (minutes <= 0) {
    throw badRequest('minutes must be a positive number');
  }
  const created = await Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
  return created.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = asRecord(input);
  const name = requireString(body.name, 'name');
  const mascot = requireString(body.mascot, 'mascot');
  let members: Types.ObjectId[] = [];
  if (body.members !== undefined) {
    if (!Array.isArray(body.members)) throw badRequest('members must be an array');
    members = body.members.map((member) => {
      const id = requireString(member, 'member');
      if (!Types.ObjectId.isValid(id)) throw badRequest('members must contain valid user IDs');
      return new Types.ObjectId(id);
    });
    const existingMembers = await User.countDocuments({ _id: { $in: members } });
    if (existingMembers !== members.length) throw badRequest('members must reference existing users');
  }
  const created = await Team.create({ name, mascot, members });
  return created.toObject();
}

export async function getLeaderboard() {
  const [teams, activities] = await Promise.all([Team.find().lean(), Activity.find().lean()]);
  const totals = new Map<string, number>();
  for (const activity of activities) {
    const teamId = activity.team.toString();
    totals.set(teamId, (totals.get(teamId) ?? 0) + activity.points);
  }
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: totals.get(team._id.toString()) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const email = requireEmail(userEmail, 'userEmail');
  const user = await User.findOne({ email });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  const recent = (await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(10)
    .lean()) as any[];
  const focus = user.fitnessGoal || recent[0]?.type;
  const all = (await Workout.find().lean()) as any[];
  const ordered = all.sort((a, b) => Number(b.focus === focus) - Number(a.focus === focus));
  return ordered.slice(0, 3).map((workout) => ({
    ...workout,
    reason: workout.focus === focus
      ? `This workout supports your ${focus} goal.`
      : `This workout offers a complementary focus to your recent activity.`,
  }));
}

export { User };
