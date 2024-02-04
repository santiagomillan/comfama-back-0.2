import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AnimeService {
  constructor(private httpService: HttpService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getAnimeInfo(id: number) {

    this.httpService
    .get(`https://api.jikan.moe/v4/anime/${id}/full`)
    .toPromise()
    .then((response) => {
      const data = response.data;
      // Aquí puedes usar los datos
      if (data && data.relations && data.relations.length > 0) {
        const relations = data.relations.map(relation => {
          let mal_ids = [];
          if (relation.entry) {
            mal_ids = relation.entry.map(entry => entry.mal_id);
          }
          return {
            name: relation.relation,
            mal_id: mal_ids
          };
        });
        console.log(relations); // Imprime las relaciones
        return { data, relations };
      } else {
        return { data, message: 'No relations found' };
      }
    })
    .catch((error) => {
      console.error(error);
      return { message: 'Error fetching data' };
    });
  }
}

