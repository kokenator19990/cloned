import {
  Controller, Get, Post, Delete, Param, Body, UseGuards, Request, Query,
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
@Controller('profiles')
export class ProfileController {
  constructor(private profileService: ProfileService) { }

  // ─── Public routes (no auth) ────────────────────────────────────────────────

  /** Browse all public profiles */
  @Get('explore')
  async explore(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.profileService.listPublicProfiles(
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  /** Get a public profile by share code — no auth required */
  @Get('public/:shareCode')
  async getPublic(@Param('shareCode') shareCode: string) {
    return this.profileService.getPublicProfile(shareCode);
  }

  // ─── Authenticated routes ────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Request() req: any) {
    return this.profileService.listProfiles(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: CreateProfileDto) {
    return this.profileService.createProfile(req.user.userId, dto.name, dto.relationship, dto.description);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Request() req: any, @Param('id') id: string) {
    return this.profileService.getProfile(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.profileService.deleteProfile(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/activate')
  async activate(@Request() req: any, @Param('id') id: string) {
    return this.profileService.activateProfile(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/export')
  async exportData(@Request() req: any, @Param('id') id: string) {
    return this.profileService.exportProfile(id, req.user.userId);
  }

  /** Make a profile public and get a share code */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  async share(@Request() req: any, @Param('id') id: string) {
    return this.profileService.makePublic(id, req.user.userId);
  }

  /** Revoke public access */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/share')
  async unshare(@Request() req: any, @Param('id') id: string) {
    return this.profileService.makePrivate(id, req.user.userId);
  }
}
