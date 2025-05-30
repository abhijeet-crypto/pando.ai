import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhotoModule } from './photo/photo.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';


@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://admin:password%40123@photo.8l4p8fz.mongodb.net/?retryWrites=true&w=majority&appName=Photo'),
    PhotoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}