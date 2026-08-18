import { Module } from '@nestjs/common';
import { BoardPackService } from './board-pack.service';
import { BoardPackController } from './board-pack.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [BoardPackController],
  providers: [BoardPackService],
})
export class BoardPackModule {}
