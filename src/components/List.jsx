import React from 'react';

const List = ({ list, onSelect }) => (
  <div className="list-item" onClick={() => onSelect(list)}>
    <h2>{list.name}</h2>
  </div>
);

export default List;
