import { Controller, Get, Param } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { HttpService } from '@nestjs/axios';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('anime')
@Controller('api/anime/')
export class AnimeController {
  constructor(
    private animeService: AnimeService,
    private httpService: HttpService,
  ) {}

  @Get()
  getHello(): string {
    console.log('aca ando');
    return this.animeService.getHello();
  }

  @Get(':id')
  async getAnimeInfo(@Param('id') id: string) {
    // console.log(id);
    try {
      const apiUrl = `https://api.jikan.moe/v4/anime/${id}/full`;
      console.log(apiUrl);
      const response = await this.httpService.get(apiUrl).toPromise();
      const data = response.data;
      //   console.log("data principal",data);

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
    console.log('relations', relations);
    const prueba = relations?.map((relation, index) => {
      let mal_ids = [];
      if (relation?.entry) {
        mal_ids = relation?.entry?.map((entry) => entry?.mal_id);
      }
      return {
        relation: relation?.relation,
        mal_id: mal_ids,
      };
    });

    return { relations: prueba };
  }

  private async obtenerDetallesRelacionados(additionalInfo: any): Promise<any> {
    const detallesPromises = [];
    console.log('additionalInfo', additionalInfo);

    for (const relacion of additionalInfo?.relations) {
      console.log('xxx2', relacion);
      if (relacion?.relation !== 'Adaptation') {
        for (const mal_id of relacion.mal_id) {
          const apiUrl = `https://api.jikan.moe/v4/anime/${mal_id}`;
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const response = await this.httpService.get(apiUrl).toPromise();
          const detalles = response.data;
          console.log('Detalles', detalles);

          detallesPromises.push({ relacion, detalles });
        }
      }
    }

    return Promise.all(detallesPromises);
  }
  @Get('ranking/:id')
  async getAnimeInfoRanking(@Param('id') id: string) {
    try {
      const apiUrl = `https://api.jikan.moe/v4/anime/${id}/full`;
      const response = await this.httpService.get(apiUrl).toPromise();
      const data = response?.data;
      const { mal_id, score } = data?.data;

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
    const relations = data?.relations;
    const prueba = relations?.map((relation, index) => {
      let mal_ids = [];
      if (relation?.entry) {
        mal_ids = relation?.entry.map((entry) => entry?.mal_id);
      }
      return {
        relation: relation?.relation,
        mal_id: mal_ids,
      };
    });

    return { relations: prueba };
  }

  private async obtenerDetallesRelacionadosRanking(
    additionalInfo: any,
  ): Promise<any> {
    const detallesPromises = [];
    // console.log('additionalInfo', additionalInfo);

    for (const relacion of additionalInfo.relations) {
      console.log('gono', relacion);
      // Verificar si el campo 'relation' es igual a 'anime'
      if (relacion?.relation !== 'Adaptation') {
        for (const mal_id of relacion?.mal_id) {
          console.log('id', mal_id);
          const apiUrl = `https://api.jikan.moe/v4/anime/${mal_id}`;
          console.log(apiUrl);
          const adicional = await this.httpService.get(apiUrl).toPromise();
          const data = adicional;
          console.log(adicional);

          // Agrega un setTimeout de 1 segundo entre solicitudes
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const response = await this.httpService.get(apiUrl).toPromise();
          const detalles = response?.data;
          //   console.log('DETALLES', detalles);
          const { score } = detalles?.data;

          // Agregar al array de promesas un objeto con mal_id, score y relacion
          detallesPromises.push({ mal_id, score: score });
        }
      }
    }

    return Promise.all(detallesPromises);
  }
}
