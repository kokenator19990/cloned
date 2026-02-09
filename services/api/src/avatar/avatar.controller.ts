import {
  Controller, Post, Get, Put, Param, Body, UseGuards,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AvatarService } from './avatar.service';
import { IsOptional, IsString, IsArray } from 'class-validator';

class UpdateAvatarDto {
  @IsOptional()
  @IsString()
  skin?: string;

  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsArray()
  accessories?: string[];
}

@ApiTags('avatar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('avatar')
export class AvatarController {
  constructor(private avatarService: AvatarService) {}

  @Get(':profileId/config')
  async getConfig(@Param('profileId') profileId: string) {
    return this.avatarService.getConfig(profileId);
  }

  @Put(':profileId/config')
  async updateConfig(
    @Param('profileId') profileId: string,
    @Body() dto: UpdateAvatarDto,
  ) {
    return this.avatarService.updateConfig(profileId, dto);
  }

  @Post(':profileId/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('profileId') profileId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.avatarService.uploadPhoto(profileId, file);
  }
}
