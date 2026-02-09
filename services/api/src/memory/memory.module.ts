import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [EmbeddingModule],
  providers: [MemoryService],
  exports: [MemoryService],
})
export class MemoryModule {}
