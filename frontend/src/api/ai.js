import { post } from './client'
export const aiApi = {
  scan:        (body) => post('/ai/scan', body),
  coverLetter: (body) => post('/ai/cover-letter', body),
  outreach:    (body) => post('/ai/outreach', body),
  suggestions: ()     => post('/ai/suggestions'),
}
