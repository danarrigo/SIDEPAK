"use client";
import React, { useEffect, useState } from 'react';

export default function AnimatedMascot() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position relative to the center of the screen
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Eyes will move based on cursor
  // Reduced movement to prevent moving off the white area
  const eyeX = mousePos.x * 4;
  const eyeY = mousePos.y * 4;

  return (
    <div className="relative w-96 h-96 group">
      {/* Tooltip */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-slate-800 text-xs font-bold py-1 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50 pointer-events-none">
        Halo! Mari bergabung dengan Kopdes 🐜
      </div>
      
      {/* Floor Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-6 bg-black/30 rounded-full blur-md animate-[pulse_3s_ease-in-out_infinite]"></div>
      
      {/* Mascot Image container */}
      <div className="relative w-full h-full drop-shadow-[0_15px_20px_rgba(0,0,0,0.4)]">
        <img 
          src="/mascot.png" 
          alt="Semut Mascot" 
          className="w-full h-full object-contain pointer-events-none"
          onError={(e) => {
            // Fallback if image not found yet
            e.currentTarget.src = 'https://placehold.co/400x400/0f172a/facc15/png?text=Taruh+mascot.png+di+folder+public';
          }}
        />
        
        {/* Artificial Pupils tracking the mouse */}
        <div 
          className="absolute inset-0 pointer-events-none transition-transform duration-75 ease-out" 
          style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}
        >
          {/* Left Pupil Overlay (Viewer's left) */}
          <div 
            className="absolute bg-[#291102] rounded-[50%]" 
            style={{ top: '34%', left: '37%', width: '7%', height: '11%', transform: 'rotate(-5deg)' }}
          >
             <div className="absolute top-[18%] left-[22%] w-[32%] h-[32%] bg-white rounded-full"></div>
             <div className="absolute bottom-[20%] right-[25%] w-[15%] h-[15%] bg-white rounded-full opacity-80"></div>
          </div>
          
          {/* Right Pupil Overlay (Viewer's right) */}
          <div 
            className="absolute bg-[#291102] rounded-[50%]" 
            style={{ top: '30%', left: '53%', width: '7.5%', height: '11.5%', transform: 'rotate(5deg)' }}
          >
             <div className="absolute top-[18%] left-[22%] w-[32%] h-[32%] bg-white rounded-full"></div>
             <div className="absolute bottom-[20%] right-[25%] w-[15%] h-[15%] bg-white rounded-full opacity-80"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
