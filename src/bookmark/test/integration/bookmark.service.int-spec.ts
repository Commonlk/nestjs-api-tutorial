import * as argon from 'argon2';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { CreateBookmarkDto } from 'src/bookmark/dto';

describe('BookmarkService Int', () => {
  let prisma: PrismaService;
  let bookmarkService: BookmarkService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    bookmarkService = moduleRef.get(BookmarkService);
    await prisma.cleanDb();
  });

  describe('create bookmark', () => {
    let userId: number;
    it('should create user', async () => {
      const hash = await argon.hash('test');
      const user = await prisma.user.create({
        data: {
          email: 'test@test.com',
          hash: hash,
        },
      });
      userId = user.id;
    });

    it('should create bookmark', async () => {
      const dto: CreateBookmarkDto = {
        title: 'Google',
        link: 'https://google.com',
      };
      const todo = await bookmarkService.createBookmark(userId, dto);
      expect(todo.title).toBe(dto.title);
      expect(todo.link).toBe(dto.link);
    });
  });

  describe('get bookmarks', () => {});
  describe('get bookmark by id', () => {});
  describe('edit bookmark', () => {});
  describe('delete bookmark', () => {});
});
