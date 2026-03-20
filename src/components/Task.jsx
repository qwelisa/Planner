import React, { useState } from 'react';

const Task = ({ task }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="task-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      <h3>{task.title}</h3>
      {hovered && (
        <div className="task-tooltip">
          <strong>Descrizione:</strong> {task.description || 'Nessuna descrizione'}
          <br />
          {task.date && (
            <>
              <strong>Scadenza:</strong> {task.date}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Task;
