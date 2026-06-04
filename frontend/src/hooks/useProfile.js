import { useState, useEffect, useCallback } from 'react'
import { profileApi } from '../api/profile'

let cache = null
const listeners = new Set()

export function useProfile() {
  const [profile, setProfile] = useState(cache)

  useEffect(() => {
    listeners.add(setProfile)
    if (!cache) profileApi.get().then(p => { cache = p; listeners.forEach(fn => fn(p)) }).catch(() => {})
    return () => listeners.delete(setProfile)
  }, [])

  const refresh = useCallback(() =>
    profileApi.get().then(p => { cache = p; listeners.forEach(fn => fn(p)) }), [])

  const update = useCallback(async (body) => {
    const p = await profileApi.update(body)
    cache = p
    listeners.forEach(fn => fn(p))
    return p
  }, [])

  return { profile, refresh, update }
}
