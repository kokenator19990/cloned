import {
  Controller, Get, Post, Delete, Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';

class CreateProfileDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  async list(@Request() req: any) {
    return this.profileService.listProfiles(req.user.userId);
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateProfileDto) {
    return this.profileService.createProfile(req.user.userId, dto.name, dto.relationship, dto.description);
  }

  @Get(':id')
  async get(@Request() req: any, @Param('id') id: string) {
    return this.profileService.getProfile(id, req.user.userId);
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.profileService.deleteProfile(id, req.user.userId);
  }

  @Post(':id/activate')
  async activate(@Request() req: any, @Param('id') id: string) {
    return this.profileService.activateProfile(id, req.user.userId);
  }

  @Post(':id/export')
  async exportData(@Request() req: any, @Param('id') id: string) {
    return this.profileService.exportProfile(id, req.user.userId);
  }
}
