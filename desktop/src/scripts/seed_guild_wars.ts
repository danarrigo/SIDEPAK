import { generateWeeklyGuildWars } from "../actions/league";

async function run() {
  console.log("Generating Weekly Guild Wars...");
  const result = await generateWeeklyGuildWars();
  if (result && result.success) {
    console.log("Guild Wars Generated Successfully!");
  } else {
    console.error("Failed to generate Guild Wars:", result);
  }
  process.exit(0);
}

run();
