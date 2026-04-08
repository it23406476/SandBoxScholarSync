type CommunityServerState = {
  likesByUser: Map<string, Set<string>>;
  readNotificationIdsByUser: Map<string, Set<string>>;
};

declare global {
  var communityServerState: CommunityServerState | undefined;
}

function getState(): CommunityServerState {
  if (!globalThis.communityServerState) {
    globalThis.communityServerState = {
      likesByUser: new Map<string, Set<string>>(),
      readNotificationIdsByUser: new Map<string, Set<string>>(),
    };
  }

  return globalThis.communityServerState;
}

export function getUserLikedPostIds(userId: string): string[] {
  const state = getState();
  return [...(state.likesByUser.get(userId) ?? new Set<string>())];
}

export function toggleUserPostLike(userId: string, postId: string): boolean {
  const state = getState();
  const userLikes = state.likesByUser.get(userId) ?? new Set<string>();

  if (userLikes.has(postId)) {
    userLikes.delete(postId);
    state.likesByUser.set(userId, userLikes);
    return false;
  }

  userLikes.add(postId);
  state.likesByUser.set(userId, userLikes);
  return true;
}

export function isNotificationRead(userId: string, notificationId: string): boolean {
  const state = getState();
  return state.readNotificationIdsByUser.get(userId)?.has(notificationId) ?? false;
}

export function markNotificationsRead(userId: string, notificationIds: string[]) {
  const state = getState();
  const readIds = state.readNotificationIdsByUser.get(userId) ?? new Set<string>();

  for (const notificationId of notificationIds) {
    readIds.add(notificationId);
  }

  state.readNotificationIdsByUser.set(userId, readIds);
}
