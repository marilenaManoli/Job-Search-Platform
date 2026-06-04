import { get, post, patch, del } from './client'
export const appsApi = {
  list:   ()           => get('/applications'),
  create: (body)       => post('/applications', body),
  update: (id, body)   => patch(`/applications/${id}`, body),
  delete: (id)         => del(`/applications/${id}`),
}
