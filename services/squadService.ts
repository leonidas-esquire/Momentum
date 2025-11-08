import { User, Squad } from '../types';

export const SQUAD_MEMBER_LIMIT = 5;

/**
 * Finds and scores potential squads for a user based on shared identities.
 * @param user The user looking for a squad.
 * @param allSquads A list of all available squads.
 * @param maxResults The maximum number of suggestions to return.
 * @returns An array of suggested squads, sorted by alignment and momentum.
 */
export const findMatchingSquads = (
  user: User,
  allSquads: Squad[],
  maxResults: number = 3
): Squad[] => {
  if (!user || user.squadId) {
    return [];
  }

  const userIdentities = new Set(user.selectedIdentities.map(i => i.name));

  const suggestedSquads = allSquads
    .filter(squad => {
      // Filter out squads the user is already in (future-proofing) or that are full
      return squad.id !== user.squadId && squad.members.length < SQUAD_MEMBER_LIMIT;
    })
    .map(squad => {
      let score = 0;
      // High score for direct identity match
      if (userIdentities.has(squad.goalIdentity)) {
        score = 1;
      }
      return { squad, score };
    })
    .filter(item => item.score > 0) // Only include squads with a positive match score
    .sort((a, b) => {
      // Primary sort by score, secondary by shared momentum
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.squad.sharedMomentum - a.squad.sharedMomentum;
    })
    .map(item => item.squad);

  return suggestedSquads.slice(0, maxResults);
};