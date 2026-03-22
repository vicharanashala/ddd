export type Student = {
  name: string;
  email: string;
  attempts: number;
  completed: number;
  timeTaken: number; // in minutes or seconds
};

export function getChampions(
  data: Student[],
  totalQuizzes: number
) {
  return data
    .filter((s) => s.completed === totalQuizzes)
    .sort((a, b) => {
      // Priority 1: fewer attempts
      if (a.attempts !== b.attempts) {
        return a.attempts - b.attempts;
      }

      // Priority 2: faster completion
      return a.timeTaken - b.timeTaken;
    })
    .slice(0, 3)
    .map((s, index) => ({
      ...s,
      rank: index + 1,
    }));
}