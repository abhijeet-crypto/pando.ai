import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { S3Service } from './s3.service';
import { PhotoSchema } from './photo.schema';
import { AlbumSchema } from './album.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Photo', schema: PhotoSchema },
      { name: 'Album', schema: AlbumSchema },
    ]),
  ],
  controllers: [PhotoController],
  providers: [PhotoService, S3Service],
})
export class PhotoModule {}
