import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <header>
        <h1>Planner</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
