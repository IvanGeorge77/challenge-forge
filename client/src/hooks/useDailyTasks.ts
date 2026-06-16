import { useState, useCallback, useEffect } from 'react'
import api from '../lib/api'
import { useToast } from '../context/ToastContext'
import type { DailyTaskGroup, MissedDay } from '../types'

export function useDailyTasks(challengeId?: string) {
  const [dailyData, setDailyData] = useState<{ tasks: DailyTaskGroup[]; missedDays: MissedDay[] }>({
    tasks: [],
    missedDays: [],
  })
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.getDailyTasks(challengeId)
      // The API might return an array of groups directly if challengeId is provided,
      // or an object { tasks, missedDays } if not. Need to normalize.
      if (Array.isArray(res)) {
        setDailyData({ tasks: res, missedDays: [] })
      } else {
        setDailyData(res)
      }
    } catch (err) {
      addToast('error', 'Failed to load daily tasks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [challengeId, addToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleTask = async (instanceId: string, completed: boolean) => {
    // Optimistic update
    setDailyData((prev) => {
      const newTasks = prev.tasks.map((group) => ({
        ...group,
        tasks: group.tasks.map((task) =>
          task.id === instanceId ? { ...task, completed: !completed } : task
        ),
      }))
      return { ...prev, tasks: newTasks }
    })

    try {
      if (completed) {
        await api.uncompleteTask(instanceId)
      } else {
        await api.completeTask(instanceId)
        addToast('success', 'Task completed!')
      }
      // Re-fetch to get accurate points/completion rates
      loadData()
    } catch (err) {
      addToast('error', 'Failed to update task')
      loadData() // Revert optimistic update on failure
    }
  }

  const applyGraceDay = async (cId: string, date: string) => {
    try {
      await api.applyGraceDay(cId, date)
      addToast('success', 'Grace day applied successfully')
      loadData()
    } catch (err) {
      addToast('error', 'Failed to apply grace day')
    }
  }

  return { dailyData, loading, toggleTask, applyGraceDay, refresh: loadData }
}
