const KEY = 'habita.intro.seen';

export const introSession = {
  seen(): boolean {
    try {
      return sessionStorage.getItem(KEY) === '1';
    } catch {
      return true;
    }
  },
  markSeen(): void {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* storage unavailable: the intro shows once per page load */
    }
  },
};
