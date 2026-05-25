import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/api.client';
import { mal, hasMalClientId } from '../services/malClient';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import SearchBar from '../../../components/ui/SearchBar';
import '../styles/schedule-page.css';

const dayOrder = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const dayLabels = {
  Sat: 'Saturday',
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday'
};

const seasonByMonth = (month) => {
  if (month >= 1 && month <= 3) return 'winter';
  if (month >= 4 && month <= 6) return 'spring';
  if (month >= 7 && month <= 9) return 'summer';
  return 'fall';
};

const getSeasonFields = () => (
  'id,title,broadcast,episodes,status,source,main_picture,mean,start_season,genres,studios'
);

function formatBroadcastTime(time) {
  if (!time || time === 'TBA') return 'TBA';
  const [hours, minutes] = time.split(':');
  if (!hours || !minutes) return time;
  const numericHour = parseInt(hours, 10);
  const ampm = numericHour >= 12 ? 'PM' : 'AM';
  const displayHour = numericHour % 12 || 12;
  return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

export default function SchedulePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['anime', 'schedule'],
    queryFn: async () => {
      if (hasMalClientId) {
        const now = new Date();
        const year = now.getFullYear();
        const season = seasonByMonth(now.getMonth() + 1);
        const response = await mal.get(`/anime/season/${year}/${season}`, {
          limit: 100,
          fields: getSeasonFields(),
        });

        const malList = response?.data ?? [];
        const normalizedMalList = malList.map((item) => item.node ?? item);
        const hasBroadcastDay = normalizedMalList.some((anime) => Boolean(anime.broadcast?.day));
        if (!hasBroadcastDay) {
          const fallback = await apiClient.get('/catalog/schedules');
          return fallback?.data ?? [];
        }

        return normalizedMalList;
      }

      const response = await apiClient.get('/catalog/schedules');
      return response?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const scheduleList = data || [];
  const normalizedQuery = searchTerm.trim().toLowerCase();

  const normalizedSchedule = useMemo(() => {
    return scheduleList.map((anime) => ({
      id: anime.id || anime.mal_id,
      title: anime.title_english || anime.title || anime.name || 'Untitled Anime',
      broadcast: anime.broadcast || {},
      episodes: anime.episodes || 'TBA',
      status: anime.status || 'Unknown',
      source: anime.source || 'Unknown',
    }));
  }, [scheduleList]);

  const filteredSchedule = useMemo(() => {
    if (!normalizedQuery) return normalizedSchedule;
    return normalizedSchedule.filter((anime) => {
      const title = (anime.title || '').toLowerCase();
      const rawDay = (anime.broadcast?.day || '').toLowerCase();
      return title.includes(normalizedQuery) || rawDay.includes(normalizedQuery);
    });
  }, [normalizedQuery, normalizedSchedule]);

  const groupedSchedule = useMemo(() => {
    const initial = {
      Sat: [],
      Sun: [],
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: []
    };

    filteredSchedule.forEach((anime) => {
      const rawDay = anime.broadcast?.day || '';
      const normalizedDay = rawDay.trim().replace(/s$/i, '').substring(0, 3);
      if (!initial[normalizedDay]) return;

      const rawTime = anime.broadcast?.time || '99:99';
      initial[normalizedDay].push({
        id: anime.id,
        title: anime.title || 'Untitled Anime',
        time: formatBroadcastTime(anime.broadcast?.time || 'TBA'),
        sortKey: rawTime,
        episodes: anime.episodes || 'TBA',
        status: anime.status || 'Unknown',
        source: anime.source || 'Unknown'
      });
    });

    Object.values(initial).forEach((list) => {
      list.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    });

    return initial;
  }, [filteredSchedule]);

  if (isLoading) {
    return (
      <div className="schedule-page-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="schedule-page-error">
        <h1>Unable to load the schedule.</h1>
        <p>{error?.message || 'Please check your internet connection and try again.'}</p>
      </div>
    );
  }

  const totalCount = filteredSchedule.length;

  return (
    <div className="schedule-page-container">
      <div className="schedule-page-hero">
        <div>
          <p className="schedule-page-badge">LIVE BROADCAST SCHEDULE</p>
          <h1 className="schedule-page-title">Anime Airing Schedule</h1>
          <p className="schedule-page-description">
            All upcoming anime broadcasts are loaded directly from MyAnimeList v2 when the client key is available.
            Browse by day, filter by title, and click any show to view its detail page.
          </p>
        </div>
        <div className="schedule-page-meta">
          <span>{dayOrder.length} days</span>
          <span>{totalCount} titles</span>
        </div>
      </div>

      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      <div className="schedule-summary-bar">
        {normalizedQuery ? (
          <span>Showing {totalCount} match{totalCount === 1 ? '' : 'es'} for "{searchTerm}"</span>
        ) : (
          <span>Showing {totalCount} scheduled titles for the week</span>
        )}
      </div>

      <div className="schedule-week-grid">
        {dayOrder.map((dayKey) => (
          <section key={dayKey} className="schedule-day-panel">
            <div className="schedule-day-header">
              <div>
                <h2>{dayLabels[dayKey]}</h2>
                <p>{groupedSchedule[dayKey].length} broadcasts</p>
              </div>
              <span className="schedule-day-pill">{dayKey}</span>
            </div>

            {groupedSchedule[dayKey].length === 0 ? (
              <div className="schedule-day-empty">
                No scheduled titles for this day.
              </div>
            ) : (
              groupedSchedule[dayKey].map((item) => (
                <button
                  key={`${dayKey}-${item.id}`}
                  type="button"
                  className="schedule-item-card"
                  onClick={() => navigate(`/anime/${item.id}`)}
                >
                  <div className="schedule-item-time">{item.time}</div>
                  <div className="schedule-item-meta">
                    <h3>{item.title}</h3>
                    <div>
                      <span>{item.episodes === 'TBA' ? 'Episodes TBA' : `Episode ${item.episodes}`}</span>
                      <span>{item.status}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
