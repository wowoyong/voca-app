/** 언어별 DB에서 사용자 조회 또는 신규 생성 */
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
