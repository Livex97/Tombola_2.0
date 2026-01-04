import React, { useEffect, useState } from 'react';

const Snowflakes = () => {
  const [flakes, setFlakes] = useState([]);

  useEffect(() => {
    const newFlakes = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      animationDuration: 5 + Math.random() * 10 + 's',
      animationDelay: Math.random() * 5 + 's',
      opacity: 0.3 + Math.random() * 0.7,
      fontSize: 10 + Math.random() * 20 + 'px'
    }));
    setFlakes(newFlakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {flakes.map(flake => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            animation: `snow ${flake.animationDuration} linear infinite`,
            animationDelay: flake.animationDelay,
            opacity: flake.opacity,
            fontSize: flake.fontSize
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

export default Snowflakes;
