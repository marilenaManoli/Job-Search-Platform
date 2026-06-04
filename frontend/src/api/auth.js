import { get, post } from './client'
export const authApi = {
  register: (email, password) => post('/auth/register', { email, password }),
  login:    (email, password) => post('/auth/login',    { email, password }),
  me:       ()                => get('/auth/me'),
}
