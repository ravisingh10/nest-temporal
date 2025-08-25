import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    getUsers(): string[] {
        this.somePrivateMethod()
        return ['Ravi', 'Kumar', 'Singh'];
    }

    getUserById(id: number): string {
        const users = this.getUsers();
        return users[id] || 'User not found';
    }

    private somePrivateMethod(): void {
        // This method is private and not exposed outside this service
        console.info('Started private method');
    }
}
