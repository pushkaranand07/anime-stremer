import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEstimatedSchedule } from '../hooks/useHomepageCatalog';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import '../styles/estimated-schedule.css';

// Panel slides up when it enters the viewport
const panelVariants = {
  hidden:  { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Day buttons stagger in
const dayContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const dayBtnVariants = {
  hidden:  { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const weekdays = [
  { short: 'SAT', full: 'Saturday', key: 'Sat' },
  { short: 'SUN', full: 'Sunday', key: 'Sun' },
  { short: 'MON', full: 'Monday', key: 'Mon' },
  { short: 'TUE', full: 'Tuesday', key: 'Tue' },
  { short: 'WED', full: 'Wednesday', key: 'Wed' },
  { short: 'THU', full: 'Thursday', key: 'Thu' },
  { short: 'FRI', full: 'Friday', key: 'Fri' }
];

// High-fidelity fallback list if some day is empty in schedules API
const fallbackSchedules = {
  Sat: [
    { id: 301, time: '09:00 AM', title: 'Nezumi-kun no Chokki (TV)', ep: 12 },
    { id: 202, time: '02:00 PM', title: 'Transformers: Wild King W', ep: 12 }
  ],
  Sun: [
    { id: 102, time: '09:00 AM', title: 'Rooster Fighter', ep: 11 },
    { id: 101, time: '12:30 PM', title: 'Wistoria: Wand and Sword Season 2', ep: 7 },
    { id: 112, time: '01:00 PM', title: 'Mission: Yozakura Family Season 2', ep: 7 },
    { id: 105, time: '01:30 PM', title: 'Ace of Diamond Act II Season 2', ep: 8 },
    { id: 111, time: '02:00 PM', title: 'Holo Graffiti', ep: 367 },
    { id: 113, time: '02:30 PM', title: 'Mrs. Sazae', ep: 2833 }
  ],
  Mon: [
    { id: 21, time: '10:00 AM', title: 'One Piece', ep: 1162 },
    { id: 104, time: '03:00 PM', title: 'Digimon Beatbreak', ep: 32 }
  ],
  Tue: [
    { id: 303, time: '11:30 AM', title: 'Stellar Transformation 7th Season', ep: 12 }
  ],
  Wed: [
    { id: 103, time: '08:30 AM', title: 'Star Detective Precure!', ep: 17 }
  ],
  Thu: [
    { id: 106, time: '10:00 PM', title: 'The Other Side of Deep Space', ep: 21 }
  ],
  Fri: [
    { id: 109, time: '04:00 PM', title: 'Mistress Kanan is Devilishly Easy', ep: 8 }
  ]
};

export default function EstimatedSchedule() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState('Sun');
  const { data: rawSchedule, isLoading, isError } = useEstimatedSchedule();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 w-full h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Group Jikan schedules dynamically by day
  const getGroupedSchedules = () => {
    const grouped = {
      Sat: [],
      Sun: [],
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: []
    };

    if (isError || !rawSchedule || rawSchedule.length === 0) {
      return fallbackSchedules;
    }

    rawSchedule.forEach((anime) => {
      const rawDay = anime.broadcast?.day;
      if (!rawDay) return;

      // Normalize "Mondays" -> "Mon", "Sundays" -> "Sun"
      const normalizedDay = rawDay.trim().replace(/s$/, '').substring(0, 3);
      
      if (grouped[normalizedDay]) {
        const rawTime = anime.broadcast?.time || '99:99';
        // Convert "17:00" to "05:00 PM"
        const [hours, minutes] = rawTime.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHours = h % 12 || 12;
        const formattedTime = `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;

        grouped[normalizedDay].push({
          id: anime.mal_id,
          title: anime.title_english || anime.title,
          time: formattedTime,
          sortKey: rawTime,
          ep: anime.episodes || '?'
        });
      }
    });

    // Merge fallback items if a day has zero entries to keep layout rich
    Object.keys(grouped).forEach((dayKey) => {
      if (grouped[dayKey].length === 0) {
        grouped[dayKey] = fallbackSchedules[dayKey];
      } else {
        // Sort items by release time chronologically
        grouped[dayKey].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
      }
    });

    return grouped;
  };

  const grouped = getGroupedSchedules();
  const currentList = grouped[activeDay] || [];

  return (
    <section className="estimated-schedule-section">
      <motion.div
        className="schedule-card-panel"
        variants={panelVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Header */}
        <div className="schedule-header">
          <div className="schedule-title-block">
            <h3 className="schedule-panel-title">Estimated Schedule</h3>
            <span className="schedule-timezone-tag">Broadcasts (JST / Local)</span>
          </div>
          <button className="schedule-full-btn" onClick={() => navigate('/schedule')}>
            View full schedule
          </button>
        </div>

        {/* Days Carousel Selector — stagger in */}
        <motion.div
          className="schedule-days-navbar"
          variants={dayContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {weekdays.map((day) => (
            <motion.button
              key={day.key}
              variants={dayBtnVariants}
              onClick={() => setActiveDay(day.key)}
              className={`schedule-day-btn ${activeDay === day.key ? 'active' : ''}`}
            >
              <span className="day-name-short">{day.short}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Timeline rows */}
        <div className="schedule-timeline-rows">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="timeline-wrapper-container"
            >
              {currentList.length > 0 ? (
                currentList.map((item, idx) => (
                  <div 
                    key={`${item.id}-${idx}`} 
                    onClick={() => navigate(`/anime/${item.id}`)}
                    className="timeline-item-row cursor-pointer"
                  >
                    <div className="timeline-dot-connector">
                      <div className="timeline-pulse-dot" />
                      {idx < currentList.length - 1 && <div className="timeline-vertical-line" />}
                    </div>

                    <div className="timeline-time-label">
                      {item.time}
                    </div>

                    <div className="timeline-info-card">
                      <h4 className="timeline-show-title" title={item.title}>
                        {item.title}
                      </h4>
                      <span className="timeline-ep-badge">
                        Episode {item.ep}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-schedule-state">
                  No releases scheduled for this day
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </motion.div>
    </section>
  );
}
