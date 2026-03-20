import React from 'react';

function getMonthDays(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

const getListColor = (listId) => `#${(listId || '').substring(0, 6)}`;

const Calendar = ({ tasks, lists }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const days = getMonthDays(year, month);

  // Giorni della settimana
  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // Primo giorno del mese (0=Dom, 1=Lun...)
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  return (
    <div className="calendar-view">
      <h2>Calendario {today.toLocaleString('default', { month: 'long' })} {year}</h2>
      <div className="calendar-grid-modern">
        {weekDays.map((d, i) => (
          <div className="calendar-weekday" key={i}>{d}</div>
        ))}
        {Array(offset).fill(null).map((_, i) => (
          <div className="calendar-day empty" key={'empty'+i}></div>
        ))}
        {days.map(day => {
          const dateStr = day.toISOString().slice(0, 10);
          // Filtra i task che hanno una data che corrisponde a questo giorno
          const dayTasks = tasks.filter(t => {
            if (!t.date) return false; // Salta task senza data
            // Normalizza la data per essere sicuro
            const taskDate = t.date.toString().trim();
            return taskDate === dateStr;
          });
          
          return (
            <div className="calendar-day" key={dateStr}>
              <div className="calendar-date">{day.getDate()}</div>
              <div className="calendar-badges">
                {dayTasks.length > 0 ? (
                  dayTasks.map(task => (
                    <span
                      key={task.id}
                      className="calendar-badge"
                      style={{ background: getListColor(task.list) }}
                      title={task.title + (task.description ? ' - ' + task.description : '')}
                    >
                      {task.title}
                    </span>
                  ))
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
