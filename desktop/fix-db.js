const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Replace imports and add state
pageContent = pageContent.replace(
  'import React, { useState } from "react";',
  'import React, { useState, useEffect } from "react";\nimport { getDashboardData } from "@/actions/dashboard";\nimport { getMemberData } from "@/actions/members";'
);

// Replace state initialization
pageContent = pageContent.replace(
  '  const [points] = useState<number>(1350);\n  const [streak] = useState<number>(14);',
  `  const [points, setPoints] = useState<number>(1350);
  const [streak, setStreak] = useState<number>(14);
  const [memberName, setMemberName] = useState("Agung");

  useEffect(() => {
    async function loadData() {
      const dbData = await getDashboardData(1);
      if (dbData?.progress) {
        setPoints(dbData.progress.totalPoints || 0);
        setStreak(dbData.progress.currentStreak || 0);
      }
      const member = await getMemberData(1);
      if (member?.fullName) {
        setMemberName(member.fullName.split(' ')[0]);
      }
    }
    loadData();
  }, []);`
);

pageContent = pageContent.replace(/Selamat Datang kembali, Agung!/g, 'Selamat Datang kembali, {memberName}!');

fs.writeFileSync(pagePath, pageContent);
console.log("Wired up DB data to page.tsx!");
