import getItems from "$lib/functions/getItems.js";
import prisma from "$lib/server/database.js";
import { inPlaceSort } from "fast-sort";

export async function load({ parent, setHeaders }) {
  const parentData = await parent();

  if (!parentData.user.authenticated) return;

  setHeaders({
    "cache-control": "max-age=600",
  });

  return {
    base: 69,
    items: await getItems(),
    streamed: {
      commandStats: prisma.commandUse.findMany({
        where: { userId: parentData.user.id },
        select: { command: true, uses: true },
        orderBy: { uses: "desc" },
      }),
      itemStats: prisma.stats.findMany({
        where: { userId: parentData.user.id },
        select: { itemId: true, amount: true },
        orderBy: { amount: "desc" },
      }),
      leaderboards: prisma.leaderboards.findMany({
        where: { userId: parentData.user.id },
        select: { leaderboard: true, position: true },
        orderBy: [{ position: "asc" }, { leaderboard: "desc" }],
      }),
      scratchStats: prisma.game
        .groupBy({
          where: {
            AND: [{ userId: parentData.user.id }, { game: { contains: "scratch" } }],
          },
          by: ["game"],
          _count: {
            _all: true,
          },
          _sum: {
            win: true,
          },
        })
        .then((r) => inPlaceSort(r).desc((r) => r._count._all)),
      gambleStats: prisma.game
        .groupBy({
          where: {
            AND: [{ userId: parentData.user.id }, { game: { not: { contains: "scratch" } } }],
          },
          by: ["game"],
          _count: {
            _all: true,
          },
          _avg: {
            bet: true,
          },
          _sum: {
            bet: true,
            earned: true,
            xpEarned: true,
          },
        })
        .then(async (res) => {
          inPlaceSort(res).desc((i) => i._count._all);

          const wins = new Map<string, number>();

          for (const game of res) {
            wins.set(
              game.game,
              await prisma.game.count({
                where: {
                  AND: [
                    { userId: parentData.user.authenticated ? parentData.user.id : "0" },
                    { game: game.game },
                    { win: 1 },
                  ],
                },
              }),
            );
          }

          return res.map((game) => {
            return { ...game, wins: wins.get(game.game) };
          });
        }),
    },
  };
}
