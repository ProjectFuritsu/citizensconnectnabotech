import barangayData from "../../Data/EverydayInfo/barangays.json";
import garbageData from "../../Data/EverydayInfo/garbage-schedule.json";
import interruptionData from "../../Data/EverydayInfo/service-interruptions.json";

const hasText = (value) => typeof value === "string" && value.trim() !== "";

const barangays = barangayData.barangays.filter((b) => !b.hidden);
const barangayNames = new Set(barangays.map((b) => b.name));

// Catch typos: a schedule for a barangay that isn't in the directory
garbageData.schedules.forEach((s) => {
  if (!barangayNames.has(s.barangay)) {
    console.warn(
      `garbage-schedule.json: "${s.barangay}" doesn't match any barangay in barangays.json.`,
    );
  }
});

/**
 * Service for the Everyday Info page: barangay directory, garbage
 * collection schedule and planned service interruptions
 */
export const EverydayInfoService = {
  // --- Barangay directory ---
  getBarangays: () => barangays,

  getDirectoryUpdated: () => barangayData.lastUpdated,

  // True once any detail besides the name has been filled in
  hasDetails: (b) =>
    [b.captain, b.hallAddress, b.hotline, b.officeHours].some(hasText) ||
    (b.officials?.length ?? 0) > 0,

  searchBarangays: (query) => {
    const term = query.trim().toLowerCase();
    if (!term) return barangays;
    return barangays.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        (b.captain ?? "").toLowerCase().includes(term),
    );
  },

  // --- Garbage collection ---
  getGarbageSchedule: (barangayName) =>
    garbageData.schedules.find(
      (s) => s.barangay === barangayName && s.days.length > 0,
    ) ?? null,

  getGarbageInfo: () => ({
    lastUpdated: garbageData.lastUpdated,
    source: garbageData.source,
    postedCount: garbageData.schedules.filter((s) => s.days.length > 0).length,
  }),

  // --- Service interruptions ---
  getOfficialSources: () => interruptionData.officialSources,

  // Interruptions that haven't ended yet, soonest first, with a status
  getCurrentInterruptions: (now = new Date()) =>
    interruptionData.interruptions
      .filter((i) => new Date(i.end) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .map((i) => ({
        ...i,
        status: new Date(i.start) <= now ? "ongoing" : "upcoming",
      })),
};

export { hasText };
