import { PrismaClient, CEFRLevel, SlotStatus, SlotType } from "@prisma/client";

const prisma = new PrismaClient();

const LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const MOSCOW_TZ = "Europe/Moscow";
const SLOT_MINUTES = 30;
const DAYS_AHEAD = 14;
const BATCH_SIZE = 1000;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
}

function getMoscowWeekday(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: MOSCOW_TZ,
    weekday: "short",
  }).format(date);
}

function isMoscowWeekday(date: Date) {
  return ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(getMoscowWeekday(date));
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.waitlistEntry.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.zoomRoom.deleteMany();

  await prisma.zoomRoom.createMany({
    data: LEVELS.map((level) => ({
      id: `zoom-${level.toLowerCase()}`,
      title: `${level} Shared Classroom`,
      joinUrl: `https://zoom.us/j/${level.toLowerCase()}-shared-room`,
      isShared: true,
      isActive: true,
      level,
      slotType: SlotType.WEEKDAY_CLASS,
    })),
  });

  const startDay = startOfUtcDay(new Date());
  const slotRows: any[] = [];

  for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
    const dayStart = addDays(startDay, dayOffset);

    if (!isMoscowWeekday(dayStart)) continue;

    for (let minuteOfDay = 0; minuteOfDay < 24 * 60; minuteOfDay += SLOT_MINUTES) {
      const startsAt = addMinutes(dayStart, minuteOfDay);
      const endsAt = addMinutes(startsAt, SLOT_MINUTES);

      for (const level of LEVELS) {
        slotRows.push({
          title: `${level} English Class`,
          description: `Standard 30-minute live class for ${level}`,
          level,
          slotType: SlotType.WEEKDAY_CLASS,
          status: SlotStatus.SCHEDULED,
          startsAt,
          endsAt,
          timezone: MOSCOW_TZ,
          seatCap: 10,
          bookedCount: 0,
          waitlistCount: 0,
          recurrenceRule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;INTERVAL=1",
          zoomRoomId: `zoom-${level.toLowerCase()}`,
        });
      }
    }
  }

  for (let i = 0; i < slotRows.length; i += BATCH_SIZE) {
    await prisma.slot.createMany({
      data: slotRows.slice(i, i + BATCH_SIZE),
    });
  }

  const zoomRooms = await prisma.zoomRoom.count();
  const slots = await prisma.slot.count();

  console.log(`Seed complete: ${zoomRooms} zoom rooms, ${slots} slots`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });