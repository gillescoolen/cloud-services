import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthDto } from '../auth/auth.dto';
import { Unit } from '../common/enums/unit.enum';
import { closeInMongoConnection, rootMongooseTestModule } from '../common/test-utils/mongoose-util';
import { UserModule } from '../user/user.module';
import { UserDocument, userSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { CreateTargetDto } from './target.dto';
import { targetSchema } from './target.schema';
import { TargetService } from './target.service';

describe('TargetService', () => {
  let targetService: TargetService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'Target', schema: targetSchema }]),
        MongooseModule.forFeature([{ name: 'User', schema: userSchema }])
      ],
      providers: [TargetService, UserService]
    }).compile();

    targetService = module.get<TargetService>(TargetService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(targetService).toBeDefined();
  });

  describe('creating a target', () => {
    let user: UserDocument;

    const targetCreateData: CreateTargetDto = {
      title: 'Mount Fuji',
      location: 'Japan',
      radius: 500,
      unit: Unit.Kilometer,
      hint: 'The hints!'
    };

    it('can create a user ', async () => {
      const auth: AuthDto = {
        name: 'Tom',
        password: 'password'
      };

      user = await userService.create(auth);
    });

    it('can create a target ', async () => {
      const created = await targetService.create(targetCreateData, 'test.jpg', user);

      expect(created).toBeDefined();
      expect(created).toMatchObject(targetCreateData);
    });

    it('can find a target ', async () => {
      const created = await targetService.create(targetCreateData, 'test.jpg', user);
      const found = await targetService.findBySlug(created.slug);

      expect(created).toBeDefined();
      expect(created.title).toBe(found.title);
      expect(created.location).toBe(found.location);
      expect(created.radius).toBe(found.radius);
      expect(created.unit).toBe(found.unit);
      expect(created.hint).toBe(found.hint);
    });

    it('fails when validation fails ', async () => {
      const target: CreateTargetDto = {
        title: '',
        location: '',
        radius: 90000,
        unit: Unit.Kilometer,
        hint: ''
      };

      try {
        await targetService.create(target, 'test.jpg', user);
      } catch (error) {
        expect(error);
      }
    });
  });

  afterAll(async () => {
    await closeInMongoConnection();
  });
});
