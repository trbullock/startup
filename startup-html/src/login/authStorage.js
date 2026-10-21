const ACCOUNTS_KEY = 'fishTrackerAccounts';
const CURRENT_USER_KEY = 'fishTrackerCurrentUser';

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function createAccount(account) {
  const accounts = readAccounts();
  const normalizedUsername = account.username.trim().toLowerCase();

  if (accounts.some((savedAccount) => savedAccount.username.toLowerCase() === normalizedUsername)) {
    throw new Error('That username is already registered.');
  }

  const savedAccount = { ...account, username: account.username.trim() };
  accounts.push(savedAccount);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

  const currentUser = { username: savedAccount.username, displayName: savedAccount.displayName };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  return currentUser;
}

export function signIn(username, password) {
  const normalizedUsername = username.trim().toLowerCase();
  const account = readAccounts().find((savedAccount) => (
    savedAccount.username.toLowerCase() === normalizedUsername && savedAccount.password === password
  ));

  if (!account) {
    return null;
  }

  const currentUser = { username: account.username, displayName: account.displayName };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  return currentUser;
}

export function signOut() {
  localStorage.removeItem(CURRENT_USER_KEY);
}