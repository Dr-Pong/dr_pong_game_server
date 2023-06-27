import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { FactoryModule } from '../factory/factory.module';
import { GameController } from './game.controller';

@Module({
  imports: [FactoryModule],
  providers: [GameService],
  exports: [GameService],
  controllers: [GameController],
})
export class GameModule {}
