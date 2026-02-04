/**
 * Get or create a language-specific user
 * 
 * @param prisma - EnglishPrismaClient | JapanesePrismaClient
 *   Note: Using any due to TypeScript limitations with Prisma union types.
 *   See TYPE_SAFETY_NOTES.md for details.
 * @param webUserId - Web user ID from auth system
 * @param username - Username
 * @returns User object with bigint telegramId
 */
export async function getOrCreateLanguageUser(
  prisma: any, // EnglishPrismaClient | JapanesePrismaClient
  webUserId: number,
  username: string
) {
  const telegramId = BigInt(8000000000 + webUserId);

  let user = await prisma.user.findUnique({
    where: { telegramId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        chatId: BigInt(0),
        username,
        firstName: username,
        updatedAt: new Date(),
      },
    });
  }

  return user;
}
