import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './services/audit.service';
import { AuditLog } from './entities/audit-log.entity';
import { HashService } from './services/hash.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService, HashService],
  exports: [AuditService, HashService],
})
export class CommonModule {}
