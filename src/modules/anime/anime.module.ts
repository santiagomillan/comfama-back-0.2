/* eslint-disable prettier/prettier */
import {Module} from '@nestjs/common';
import { AnimeController } from './anime.controller';
import { AnimeService } from './anime.service';
import { HttpModule } from '@nestjs/axios';


@Module({
    imports: [HttpModule],
    controllers: [AnimeController],
    providers: [AnimeService],
})
export class AnimeModule {
}
