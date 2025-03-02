import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { words } from "@/server/db/schema";
import { sql } from "drizzle-orm";

export const wordRouter = createTRPCRouter({
  getRandomWords: publicProcedure
    .input(z.object({ count: z.number().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const randomWords = await ctx.db.query.words.findMany({
        orderBy: () => sql`RANDOM()`,
        limit: input.count,
      });
      return randomWords.map((word) => word.word);
    }),

  submitTest: publicProcedure
    .input(z.object({
      duration: z.number().min(1),
      wordsTyped: z.number().min(0),
      accuracy: z.number().min(0).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const wpm = Math.round((input.wordsTyped / input.duration) * 60);
      return { wpm, accuracy: input.accuracy };
    }),

  saveWord: publicProcedure
    .input(z.object({ word: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingWord = await ctx.db.query.words.findFirst({
        where: (words, { eq }) => eq(words.word, input.word),
      });

      if (existingWord) {
        await ctx.db
          .update(words)
          .set({
            repeated: existingWord.repeated + 1,
            views: existingWord.views + 1,
          })
          .where(sql`id = ${existingWord.id}`)
          .execute();
      } else {
        await ctx.db.insert(words).values({
          word: input.word,

          views: 1
        }).execute();
      }

      return { success: true };
    }),

  getLatest: publicProcedure
    .query(async ({ ctx }) => {
      const latestWord = await ctx.db.query.words.findFirst({
        orderBy: (words, { desc }) => [desc(words.createdAt)],
      });
      return latestWord;
    }),

  getSavedCount: publicProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.select({ count: sql<number>`count(*)` }).from(words).execute();
      return result[0]?.count ?? 0;
    }),

  getPreviousWords: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional().default(5) }))
    .query(async ({ ctx, input }) => {
      const previousWords = await ctx.db.query.words.findMany({
        orderBy: (words, { desc }) => [desc(words.createdAt)],
        limit: input.limit,
      });
      return previousWords.map((word) => word.word);
    }),
});
