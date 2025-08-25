import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TemporalClientService } from '../temporal/services/temporal-client.service';

@Controller('users')
export class UsersController {
    constructor(private readonly temporalClientService: TemporalClientService) {}

    @Get()
    async getUsers(): Promise<string[]> {
        return this.temporalClientService.executeGetUsersWorkflow();
    }

    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number): Promise<string> {
        return this.temporalClientService.executeGetUserByIdWorkflow(id);
    }
}
