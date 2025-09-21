// utility function to keep query keys consistent
export const qk = {
  widget: (id: number, userId: string) => ["widget", id, userId] as const,
};
