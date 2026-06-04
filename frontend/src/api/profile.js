import { get, patch } from './client'
export const profileApi = {
  get:    ()     => get('/profile'),
  update: (body) => patch('/profile', body),
}
