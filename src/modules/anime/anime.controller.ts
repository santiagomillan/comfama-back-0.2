import { Controller, Get, Param } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { HttpService } from '@nestjs/axios';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('anime')
@Controller('api/anime')
export class AnimeController {
  constructor(
    private readonly appService: AnimeService,
    private httpService: HttpService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(':id')
  async getAnimeInfo(@Param('id') id: any) {
    try {
      const apiUrl = `https://api.jikan.moe/v4/anime/${id}/full`;
      const response = await this.httpService.get(apiUrl).toPromise();
      const data = response.data;

      // Llamar al segundo servicio para obtener información adicional
      const additionalInfo = await this.getAdditionalInfo(data);

      // Llamar al tercer servicio para obtener detalles específicos para cada anime relacionado
      const detallesRelacionados =
        await this.obtenerDetallesRelacionados(additionalInfo);

      return { data: data, additionalInfo: detallesRelacionados };
    } catch (error) {
      throw new Error(`Error al obtener datos: ${error.message}`);
    }
  }

  private async getAdditionalInfo({ data }: any): Promise<any> {
    const relations = data.relations;
    const prueba = relations.map((relation, index) => {
      let mal_ids = [];
      if (relation.entry) {
        mal_ids = relation.entry.map((entry) => entry.mal_id);
      }
      return {
        relation: relation.relation,
        mal_id: mal_ids,
      };
    });

    return { relations: prueba };
  }

  private async obtenerDetallesRelacionados(additionalInfo: any): Promise<any> {
    const detallesPromises = [];

    for (const relacion of additionalInfo.relations) {
      for (const mal_id of relacion.mal_id) {
        const apiUrl = `https://api.jikan.moe/v4/anime/${mal_id}/full`;

        // Agregar un setTimeout de 1 segundo entre solicitudes
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const response = await this.httpService.get(apiUrl).toPromise();
        const detalles = response.data;

        detallesPromises.push({ relacion, detalles });
      }
    }

    return Promise.all(detallesPromises);
  }

  @Get('ranking/:id')
  async getAnimeInfoRanking(@Param('id') id: any) {
    try {
      const apiUrl = `https://api.jikan.moe/v4/anime/${id}/full`;
      const response = await this.httpService.get(apiUrl).toPromise();
      const data = response.data;
      const { mal_id, score } = data.data;

      const additionalInfo = await this.getAdditionalInfoRanking(data);

      // Llamar al tercer servicio para obtener detalles específicos para cada anime relacionado
      const detallesRelacionados =
        await this.obtenerDetallesRelacionadosRanking(additionalInfo);

      return { data: { mal_id, score }, additionalInfo: detallesRelacionados };
    } catch (error) {
      throw new Error(`Error al obtener datos: ${error.message}`);
    }
  }

  private async getAdditionalInfoRanking({ data }: any): Promise<any> {
    const relations = data.relations;
    const prueba = relations.map((relation, index) => {
      let mal_ids = [];
      if (relation.entry) {
        mal_ids = relation.entry.map((entry) => entry.mal_id);
      }
      return {
        relation: relation.relation,
        mal_id: mal_ids,
      };
    });

    return { relations: prueba };
  }

  private async obtenerDetallesRelacionadosRanking(
    additionalInfo: any,
  ): Promise<any> {
    const detallesPromises = [];

    for (const relacion of additionalInfo.relations) {
      for (const mal_id of relacion.mal_id) {
        const apiUrl = `https://api.jikan.moe/v4/anime/${mal_id}/full`;

        // Agrega un setTimeout de 1 segundo entre solicitudes
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const response = await this.httpService.get(apiUrl).toPromise();
        const detalles = response.data;
        const { score } = detalles.data;

        // Agregar al array de promesas un objeto con mal_id, score y relacion
        detallesPromises.push({ mal_id, score: score });
      }
    }

    return Promise.all(detallesPromises);
  }
}
