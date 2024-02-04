import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnimeService } from './modules/anime/anime.service';
import { AnimeController } from './modules/anime/anime.controller';
import { HttpModule } from '@nestjs/axios';
import { AnimeModule } from './modules/anime/anime.module';

@Module({
  imports: [HttpModule, AnimeModule],
  controllers: [AppController, AnimeController],
  providers: [AppService, AnimeService],
})
export class AppModule {}
