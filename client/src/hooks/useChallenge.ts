import { useState, useCallback, useEffect } from 'react'
import api from '../lib/api'
import { useToast } from '../context/ToastContext'
import type { Challenge, HeatmapEntry } from '../types'

export function useChallenge(id?: string) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  const loadChallenge = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [challengeData, heatmapData] = await Promise.all([
        api.getChallenge(id),
        api.getHeatmapData(id).catch(() => []), // gracefully handle missing heatmap
      ])
      setChallenge(challengeData)
      setHeatmap(heatmapData)
    } catch (err) {
      addToast('error', 'Failed to load challenge details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id, addToast])

  useEffect(() => {
    loadChallenge()
  }, [loadChallenge])

  const addTask = async (data: any) => {
    if (!id) return
    try {
      await api.createTask(id, data)
      addToast('success', 'Task blueprint added')
      loadChallenge()
    } catch (err) {
      addToast('error', 'Failed to add task')
    }
  }

  const removeTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId)
      addToast('success', 'Task removed')
      loadChallenge()
    } catch (err) {
      addToast('error', 'Failed to remove task')
    }
  }

  return {
    challenge,
    heatmap,
    loading,
    refresh: loadChallenge,
    addTask,
    removeTask,
  }
}
