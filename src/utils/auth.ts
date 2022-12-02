import { useCookies } from '@vueuse/integrations/useCookies';
const TokenKey = import.meta.env.VITE_TOKEN_KEY as string;
const Cookies = useCookies();
export function getToken() {
  return Cookies.get(TokenKey);
}

export function setToken(token: string) {
  return Cookies.set(TokenKey, token);
}

export function removeToken() {
  return Cookies.remove(TokenKey);
}
