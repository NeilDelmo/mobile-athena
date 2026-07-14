import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'athena_session_token';

function getWebStorage() {
  if (process.env.EXPO_OS !== 'web' || typeof globalThis.localStorage === 'undefined') {
    return null;
  }

  return globalThis.localStorage;
}

export async function getStoredSessionToken() {
  const webStorage = getWebStorage();
  return webStorage ? webStorage.getItem(SESSION_KEY) : SecureStore.getItemAsync(SESSION_KEY);
}

export async function storeSessionToken(token: string) {
  const webStorage = getWebStorage();

  if (webStorage) {
    webStorage.setItem(SESSION_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, token);
}

export async function clearStoredSessionToken() {
  const webStorage = getWebStorage();

  if (webStorage) {
    webStorage.removeItem(SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}
