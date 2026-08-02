// The player identity every quiz/daily client stores in localStorage when
// someone joins the leaderboard: { username, email }. Read it from ONE place so
// the feedback forms can prefill a reply address for a signed-in player instead
// of asking them to retype it (most reports used to arrive with no way to
// answer them). Safe on the server: returns empty strings when there is no
// window, so a component can call it from an effect without guarding.
export function savedIdentity() {
  if (typeof window === 'undefined') return { username: '', email: '' };
  try {
    const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
    return {
      username: (id && typeof id.username === 'string' && id.username) || '',
      email: (id && typeof id.email === 'string' && id.email) || '',
    };
  } catch (e) {
    return { username: '', email: '' };
  }
}

export default savedIdentity;
