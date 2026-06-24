const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/page.tsx');
let pageLines = fs.readFileSync(pagePath, 'utf8').split('\n');

const homeContentLines = pageLines.slice(368, 553);
let homeContent = homeContentLines.join('\n');

homeContent = homeContent.replace(/setCurrentTab\("misi"\)/g, "window.location.href='/quests'");
homeContent = homeContent.replace(/setCurrentTab\("koperasi"\)/g, "window.location.href='/governance'");

const newPageContent = `"use client";
import React, { useState } from "react";

export default function DesktopDashboard() {
  const [points] = useState<number>(1350);
  const [streak] = useState<number>(14);
  const [missions, setMissions] = useState([
    { id: "d1", title: "Belanja hari ini", points: 20, completed: true, category: "daily" },
    { id: "d2", title: "Hadir RAT", points: 50, completed: false, category: "daily" },
    { id: "d3", title: "Baca berita koperasi", points: 15, completed: false, category: "daily" },
  ]);

  const handleToggleMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id) return { ...m, completed: !m.completed };
        return m;
      })
    );
  };

  return (
    <div className="bg-[#0b0f19] text-[#f8fafc] w-full p-8 max-w-7xl mx-auto rounded-2xl mt-8 mb-8 border border-slate-800">
      ${homeContent}
    </div>
  );
}
`;

fs.writeFileSync(pagePath, newPageContent);
console.log("Rewrote page.tsx cleanly.");
