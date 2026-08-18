import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './auth/auth.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { MeetingsModule } from './meetings/meetings.module';
import { AgendaModule } from './agenda/agenda.module';
import { MinutesModule } from './minutes/minutes.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DecisionsModule } from './decisions/decisions.module';
import { BoardPackModule } from './board-pack/board-pack.module';
import { ActionsModule } from './actions/actions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    OrganisationsModule,
    MeetingsModule,
    AgendaModule,
    MinutesModule,
    DocumentsModule,
    NotificationsModule,
    DecisionsModule,
    BoardPackModule,
    ActionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
