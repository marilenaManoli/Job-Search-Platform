const BASE = '/api'

async function request(method, path, body) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const get    = (path)        => request('GET',    path)
export const post   = (path, body)  => request('POST',   path, body)
export const patch  = (path, body)  => request('PATCH',  path, body)
export const del    = (path)        => request('DELETE', path)
