import { get, post, patch, del } from './client'
export const goalsApi = {
  list:      ()         => get('/goals'),
  create:    (body)     => post('/goals', body),
  update:    (id, body) => patch(`/goals/${id}`, body),
  delete:    (id)       => del(`/goals/${id}`),
  resetWeek: ()         => post('/goals/reset-week'),
}
