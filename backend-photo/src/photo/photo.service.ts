import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { S3Service } from './s3.service';

@Injectable()
export class PhotoService {
  constructor(
    @InjectModel('Photo') private photoModel: Model<any>,
    @InjectModel('Album') private albumModel: Model<any>,
    private s3Service: S3Service,
  ) {}

  async upload(
    url: string,
    albumId: string,
    title: string,
    description: string,
    tags: string,
  ) {
    const newPhoto = new this.photoModel({
      url,
      albumId,
      title,
      description,
      tags,
    });
    return newPhoto.save();
  }

  async updatePhoto(
    url: string,
    albumId: string,
    title: string,
    description: string,
    tags: string,
    photoId: string,
    isFav,
  ) {
    const updatedPhoto = await this.photoModel.findByIdAndUpdate(
      photoId,
      {
        url,
        albumId,
        title,
        description,
        tags,
        isFav,
      },
      { new: true },
    );

    if (!updatedPhoto) {
      throw new Error('Photo not found');
    }

    return updatedPhoto;
  }

  async uploadPhoto(file: Express.Multer.File) {
    const url = await this.s3Service.uploadPhoto(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
    return { url: url };
  }

  async getPhotos(
    pageNumber: number,
    pageSize: number,
    searchText?: string,
    albumId?: string,
  ) {
    const baseQuery: any = { isDeleted: false };
    if (albumId) baseQuery.albumId = albumId;

    if (searchText?.trim()) {
      const regex = new RegExp(searchText, 'i');
      baseQuery.$or = [
        { title: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    const totalItems = await this.photoModel.countDocuments(baseQuery);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (pageNumber - 1) * pageSize;

    const photos = await this.photoModel
      .find(baseQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec();

    return {
      pageNumber,
      pageSize,
      totalItems,
      totalPages,
      photos,
    };
  }

  async addPhotoToAlbum(photoId: string, albumId: string) {
    const photo = await this.photoModel.findById(photoId);
    if (!photo) {
      throw new Error('Photo not found');
    }
    photo.albumId = albumId;
    return photo.save();
  }

  async createAlbum(name: string) {
    const album = new this.albumModel({
      name,
    });

    return album.save();
  }

  async getAlbums() {
    return this.albumModel.find({ isDeleted: false }).exec();
  }

  async deletePhoto(photoId: string) {
    const photo = await this.photoModel.findById(photoId);
    if (!photo) {
      throw new Error('Photo not found');
    }
    photo.isDeleted = true;
    return photo.save();
  }

  async deleteAlbum(albumId: string) {
    const album = await this.albumModel.findById(albumId);
    if (!album) {
      throw new Error('Album not found');
    }
    album.isDeleted = true;
    await album.save();
    const photos = await this.photoModel.find({ album: albumId });
    for (const photo of photos) {
      photo.isDeleted = true;
      await photo.save();
    }
    return album;
  }

  async markUnmarkPhotoAsFavorite(photoId: string, isFav: boolean) {
    const photo = await this.photoModel.findById(photoId);
    if (!photo) {
      throw new Error('Photo not found');
    }
    photo.isFav = isFav;
    return photo.save();
  }

  async getCollectionMonth() {
    // const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { isDeleted: false } },

      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          photos: { $push: '$$ROOT' },
          count: { $sum: 1 },
        },
      },

      { $match: { count: { $gte: 4 } } }, // Only months with >=4 photos

      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1,
        },
      },

      // { $skip: skip },
      // { $limit: limit },
    ];

    // const result = await this.photoModel.aggregate(pipeline).exec();

    // const formatted = result.map((group) => ({
    //   month: `${group._id.month}-${group._id.year}`,
    //   photos: group.photos,
    // }));

    // return formatted;
  }
}
