import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class UsersActivity {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService
    ) {}

    async getUsers(): Promise<string[]> {
        return this.usersService.getUsers();
    }

    async getUserById(id: number): Promise<string> {
        return this.usersService.getUserById(id);
    }
}