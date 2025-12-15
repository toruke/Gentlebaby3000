import { useEffect, useState } from 'react';
import { TimelineItem, TimelineService } from '../services/timelineService';
import { useFamilyTasks } from './useFamilyTasks';

export const useFamilyTimeline = (familyId: string, toleranceMinutes: number = 15) => {
  const { tasks, loading, refreshing, error, refresh } = useFamilyTasks(familyId);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [groupedTimeline, setGroupedTimeline] = useState<Record<string, TimelineItem[]>>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mettre à jour l'heure courante chaque minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  // Mettre à jour la timeline quand les tâches ou l'heure changent
  useEffect(() => {
    if (tasks.length > 0) {
      const timelineItems = TimelineService.organizeTimeline(
        tasks, 
        currentTime, 
        toleranceMinutes,
      );
      setTimeline(timelineItems);
      
      const grouped = TimelineService.groupByPeriod(timelineItems);
      setGroupedTimeline(grouped);
    } else {
      setTimeline([]);
      setGroupedTimeline({});
    }
  }, [tasks, currentTime, toleranceMinutes]);

  return {
    tasks,
    timeline,
    groupedTimeline,
    loading,
    refreshing,
    error,
    refresh,
    currentTime,
  };
};