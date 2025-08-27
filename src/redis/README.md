# Redis Module

This module provides Redis integration for the NestJS application using Redis OM (Object Mapping) for data persistence and search capabilities.

## Configuration

### Environment Variables

Set the following environment variable in your `.env` file:

```bash
REDIS_URL=redis://localhost:6379
```

If not provided, the service defaults to `redis://localhost:6379`.

### Dependencies

The module uses the following packages:
- `redis-om` - Object mapping and search capabilities for Redis
- `@nestjs/common` - NestJS core decorators and utilities

## Models

### Hotel Model

The Hotel model is defined in `models/hotel.model.ts` with the following schema:

- `id` - Unique identifier (auto-generated)
- `name` - Hotel name
- `city` - Hotel city location
- `rating` - Hotel rating (numeric)
- `price` - Hotel price
- `commissionPct` - Commission percentage

## Service Methods

### RedisService

The `RedisService` provides the following methods for hotel management:

#### Hotel CRUD Operations

- `createHotel(hotelData)` - Create a new hotel
- `getHotelById(id)` - Retrieve a hotel by ID
- `updateHotel(id, updateData)` - Update hotel information
- `deleteHotel(id)` - Delete a hotel
- `getAllHotels()` - Retrieve all hotels

#### Search Operations

- `searchHotelsByCity(city)` - Find hotels in a specific city
- `searchHotelsByRating(minRating)` - Find hotels with minimum rating
- `searchHotels(filters)` - Advanced search with multiple filters:
  - `city` - Filter by city
  - `minRating` - Filter by minimum rating
  - `name` - Filter by hotel name (pattern matching)

#### Utility Methods

- `getClient()` - Get the Redis client instance

## Usage Example

```typescript
import { RedisService } from './redis/redis.service';

@Injectable()
export class HotelsService {
  constructor(private redisService: RedisService) {}

  async createHotel(hotelData: Omit<Hotel, 'id'>) {
    return await this.redisService.createHotel(hotelData);
  }

  async searchHotels(city: string, minRating?: number) {
    return await this.redisService.searchHotels({
      city,
      minRating
    });
  }
}
```

## Error Handling

All methods include comprehensive error handling with logging:
- Connection errors during initialization
- CRUD operation failures
- Search query errors

Errors are logged using NestJS Logger and re-thrown for upstream handling.

## Index Creation

The service automatically creates search indexes during module initialization to enable efficient querying capabilities.

## Module Integration

Import the `RedisModule` in your application module:

```typescript
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [RedisModule],
  // ...
})
export class AppModule {}
```

## Development Setup

1. Start Redis server locally:
   ```bash
   redis-server
   ```

2. Verify connection:
   ```bash
   redis-cli ping
   ```

3. Set environment variables and start the application.

The service will automatically connect to Redis and create necessary indexes on application startup.