import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  HttpStatus,
  HttpException,
  Logger
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Hotel } from '../redis/models/hotel.model';

@Controller('hotels')
export class HotelsController {
  private readonly logger = new Logger(HotelsController.name);

  constructor(private readonly redisService: RedisService) {}

  @Post()
  async createHotel(@Body() hotelData: Omit<Hotel, 'id'>): Promise<Hotel> {
    try {
      this.logger.log('Creating hotel with data:', JSON.stringify(hotelData));
      
      // Validate required fields
      if (!hotelData.name || !hotelData.city || hotelData.rating === undefined || !hotelData.price || hotelData.commissionPct === undefined) {
        throw new HttpException('Missing required fields: name, city, rating, price, commissionPct', HttpStatus.BAD_REQUEST);
      }

      // Validate data types
      if (typeof hotelData.rating !== 'number' || hotelData.rating < 0 || hotelData.rating > 5) {
        throw new HttpException('Rating must be a number between 0 and 5', HttpStatus.BAD_REQUEST);
      }

      if (typeof hotelData.commissionPct !== 'number' || hotelData.commissionPct < 0 || hotelData.commissionPct > 100) {
        throw new HttpException('Commission percentage must be a number between 0 and 100', HttpStatus.BAD_REQUEST);
      }

      const result = await this.redisService.createHotel(hotelData);
      this.logger.log('Hotel created successfully:', result.id);
      return result;
    } catch (error) {
      this.logger.error('Failed to create hotel:', error.message, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Log the specific Redis error for debugging
      if (error.message?.includes('Redis')) {
        throw new HttpException(`Database error: ${error.message}`, HttpStatus.SERVICE_UNAVAILABLE);
      }
      
      throw new HttpException('Failed to create hotel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getHotelById(@Param('id') id: string): Promise<Hotel> {
    const hotel = await this.redisService.getHotelById(id);
    if (!hotel) {
      throw new HttpException('Hotel not found', HttpStatus.NOT_FOUND);
    }
    return hotel;
  }

  @Get()
  async searchHotels(
    @Query('city') city?: string,
    @Query('minRating') minRating?: number,
    @Query('name') name?: string
  ): Promise<Hotel[]> {
    if (!city && !minRating && !name) {
      return await this.redisService.getAllHotels();
    }

    return await this.redisService.searchHotels({
      city,
      minRating: minRating ? Number(minRating) : undefined,
      name
    });
  }

  @Put(':id')
  async updateHotel(
    @Param('id') id: string,
    @Body() updateData: Partial<Omit<Hotel, 'id'>>
  ): Promise<Hotel> {
    const hotel = await this.redisService.updateHotel(id, updateData);
    if (!hotel) {
      throw new HttpException('Hotel not found', HttpStatus.NOT_FOUND);
    }
    return hotel;
  }

  @Delete(':id')
  async deleteHotel(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.redisService.deleteHotel(id);
    if (!success) {
      throw new HttpException('Hotel not found', HttpStatus.NOT_FOUND);
    }
    return { success };
  }
}