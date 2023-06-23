import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { FactoryModule } from '../factory/factory.module';

@Module({
  imports: [FactoryModule],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
