import {
  Controller, Post, Get, Delete, Param, UseGuards, Request,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from './document.service';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post(':profileId/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('profileId') profileId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentService.uploadDocument(profileId, file);
  }

  @Get(':profileId')
  async listDocuments(@Param('profileId') profileId: string) {
    return this.documentService.listDocuments(profileId);
  }

  @Get('detail/:documentId')
  async getDocument(@Param('documentId') documentId: string) {
    return this.documentService.getDocument(documentId);
  }

  @Delete(':documentId')
  async deleteDocument(@Param('documentId') documentId: string) {
    return this.documentService.deleteDocument(documentId);
  }
}
