import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';

@Controller('photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post('upload/photos')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File is required');
    }
    return this.photoService.uploadPhoto(file);
  }

  @Post('save/photo')
  upload(
    @Body('albumId') albumId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('tags') tags: string,
    @Body('url') url: string,
  ) {
    return this.photoService.upload(url, albumId, title, description, tags);
  }

  @Post('update')
  updatePhot(
    @Body('photoId') photoId: string,
    @Body('albumId') albumId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('tags') tags: string,
    @Body('url') url: string,
    @Body('fav') fav: boolean,
  ) {
    return this.photoService.updatePhoto(
      url,
      albumId,
      title,
      description,
      tags,
      photoId,
      fav
    );
  }

  @Get('get/photos')
  getPhotos(
    @Query('pageNumber') pageNumber: number,
    @Query('pageSize') pageSize: number,
    @Query('searchText') searchText?: string,
    @Query('albumId') albumId?: string,
  ) {
    return this.photoService.getPhotos(
      pageNumber,
      pageSize,
      searchText,
      albumId,
    );
  }

  @Post('add/photo/album')
  addPhotoToAlbum(
    @Body('photoId') photoId: string,
    @Body('albumId') albumId: string,
  ) {
    return this.photoService.addPhotoToAlbum(photoId, albumId);
  }

  @Post('create/album')
  createAlbum(@Body('name') name: string) {
    return this.photoService.createAlbum(name);
  }

  @Get('get/albums')
  getAlbums() {
    return this.photoService.getAlbums();
  }

  @Post('delete/photo')
  deletePhoto(@Body('photoId') photoId: string) {
    return this.photoService.deletePhoto(photoId);
  }

  @Post('mark/photo/as/favorite')
  markPhotoAsFavorite(
    @Body('photoId') photoId: string,
    @Body('isFav') isFav: boolean,
  ) {
    return this.photoService.markUnmarkPhotoAsFavorite(photoId, isFav);
  }

  @Get('get/collection/month') getCollectionMonth() {
    return this.photoService.getCollectionMonth();
  }
}
