export const ROUTES = {
  HOME: '/',
  QUESTS: '/quests',
  QUEST_DETAIL: (id: string) => `/quests/${id}`,
  RESULTS: '/results',
  RESULTS_DETAIL: (id: string) => `/results/${id}`,
  DAO: '/dao',
  ADMIN_PLAY_GAME: '/admin',
  ADMIN_GRANTS: '/admin/grant-admin',
  ADMIN_DISTRIBUTE: '/admin/distribute',
  PROFILE: '/profile',
};
