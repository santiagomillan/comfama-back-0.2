import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('ComAnime-Back')
    .setDescription('Documentación ComAnime')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
 
  await app.listen(3000).then(() => {  
    app.enableCors(); 
    console.log('Server running on port 3000');
  });
}
bootstrap();
