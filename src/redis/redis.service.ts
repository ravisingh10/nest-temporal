import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, Repository } from 'redis-om';
import { Hotel, hotelSchema } from './models/hotel.model';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: Client;
  private hotelRepository: Repository;

  async onModuleInit() {
    try {
      // Initialize Redis client
      this.client = new Client();
      await this.client.open(process.env.REDIS_URL || 'redis://localhost:6379');
      
      // Create repository for hotels
      this.hotelRepository = this.client.fetchRepository(hotelSchema);
      
      // Create index for search capabilities with proper error handling
      await this.createIndexIfNotExists();
      
      this.logger.log('Redis connection established and hotel repository initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Redis connection', error);
      throw error;
    }
  }

  private async createIndexIfNotExists(): Promise<void> {
    try {
      // Try to create the index
      await this.hotelRepository.createIndex();
      this.logger.log('Hotel search index created successfully');
    } catch (error) {
      // Check if the error is about index already existing
      if (error.message && error.message.includes('Index already exists')) {
        this.logger.log('Hotel search index already exists, skipping creation');
      } else {
        // Log the error but don't fail the initialization
        this.logger.warn('Could not create hotel search index:', error.message);
        this.logger.warn('Continuing without search index - search functionality may be limited');
      }
    }
  }

  async createHotel(hotelData: Omit<Hotel, 'id'>): Promise<Hotel> {
    try {
      // Check if client and repository are initialized
      if (!this.client || !this.hotelRepository) {
        throw new Error('Redis client or hotel repository not initialized');
      }

      // Ensure connection is still active
      if (!this.client.isOpen()) {
        this.logger.warn('Redis client connection is closed, attempting to reconnect...');
        await this.client.open(process.env.REDIS_URL || 'redis://localhost:6379');
      }

      // Create a new entity with the data
      const entityData = {
        name: hotelData.name,
        city: hotelData.city,
        rating: hotelData.rating,
        price: hotelData.price,
        commissionPct: hotelData.commissionPct
      };

      this.logger.log('Saving hotel entity to Redis:', JSON.stringify(entityData));
      
      const savedEntity = await this.hotelRepository.save(entityData);
      
      // Extract entity ID - with HASH data structure, it's available as entityId
      const entityId = savedEntity.entityId;
      
      if (!entityId) {
        this.logger.error('Failed to get entity ID from saved hotel');
        this.logger.log('Saved entity:', savedEntity);
        this.logger.log('Saved entity keys:', Object.keys(savedEntity));
        throw new Error('Failed to get entity ID from saved hotel');
      }
      
      this.logger.log(`Hotel created successfully with ID: ${entityId}`);
      
      return {
        id: entityId,
        ...entityData
      };
    } catch (error) {
      this.logger.error('Failed to create hotel:', error.message);
      this.logger.error('Error details:', error);
      
      // Provide more specific error information
      if (error.message?.includes('ECONNREFUSED')) {
        throw new Error('Redis connection refused - is Redis server running?');
      }
      
      if (error.message?.includes('timeout')) {
        throw new Error('Redis operation timed out - check Redis server status');
      }
      
      throw error;
    }
  }

  async getHotelById(id: string): Promise<Hotel | null> {
    try {
      const hotel = await this.hotelRepository.fetch(id);
      if (!hotel) {
        return null;
      }
      
      return {
        id: (hotel as any).entityId,
        name: hotel.name,
        city: hotel.city,
        rating: hotel.rating,
        price: hotel.price,
        commissionPct: hotel.commissionPct
      };
    } catch (error) {
      this.logger.error(`Failed to get hotel with ID: ${id}`, error);
      throw error;
    }
  }

  async searchHotelsByCity(city: string): Promise<Hotel[]> {
    try {
      const hotels = await this.hotelRepository
        .search()
        .where('city').equals(city)
        .return.all();
      
      return hotels.map(hotel => ({
        id: (hotel as any).entityId,
        name: hotel.name,
        city: hotel.city,
        rating: hotel.rating,
        price: hotel.price,
        commissionPct: hotel.commissionPct
      }));
    } catch (error) {
      this.logger.error(`Failed to search hotels by city: ${city}`, error);
      throw error;
    }
  }

  async searchHotelsByRating(minRating: number): Promise<Hotel[]> {
    try {
      const hotels = await this.hotelRepository
        .search()
        .where('rating').gte(minRating)
        .return.all();
      
      return hotels.map(hotel => ({
        id: (hotel as any).entityId,
        name: hotel.name,
        city: hotel.city,
        rating: hotel.rating,
        price: hotel.price,
        commissionPct: hotel.commissionPct
      }));
    } catch (error) {
      this.logger.error(`Failed to search hotels by rating: ${minRating}`, error);
      throw error;
    }
  }

  async searchHotels(filters: {
    city?: string;
    minRating?: number;
    name?: string;
  }): Promise<Hotel[]> {
    try {
      let query = this.hotelRepository.search();
      
      if (filters.city) {
        query = query.where('city').equals(filters.city);
      }
      
      if (filters.minRating) {
        query = query.where('rating').gte(filters.minRating);
      }
      
      if (filters.name) {
        query = query.where('name').matches(filters.name);
      }
      
      const hotels = await query.return.all();
      
      return hotels.map(hotel => ({
        id: (hotel as any).entityId,
        name: hotel.name,
        city: hotel.city,
        rating: hotel.rating,
        price: hotel.price,
        commissionPct: hotel.commissionPct
      }));
    } catch (error) {
      this.logger.error('Failed to search hotels with filters', error);
      throw error;
    }
  }

  async updateHotel(id: string, updateData: Partial<Omit<Hotel, 'id'>>): Promise<Hotel | null> {
    try {
      const hotel = await this.hotelRepository.fetch(id);
      if (!hotel) {
        return null;
      }
      
      // Update fields
      Object.assign(hotel, updateData);
      
      await this.hotelRepository.save(hotel);
      
      return {
        id: (hotel as any).entityId,
        name: hotel.name,
        city: hotel.city,
        rating: hotel.rating,
        price: hotel.price,
        commissionPct: hotel.commissionPct
      };
    } catch (error) {
      this.logger.error(`Failed to update hotel with ID: ${id}`, error);
      throw error;
    }
  }

  async deleteHotel(id: string): Promise<boolean> {
    try {
      await this.hotelRepository.remove(id);
      this.logger.log(`Hotel deleted with ID: ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete hotel with ID: ${id}`, error);
      return false;
    }
  }

  async getAllHotels(): Promise<Hotel[]> {
    try {
      const hotels = await this.hotelRepository.search().return.all();
      
      return hotels.map(hotel => ({
        id: (hotel as any).entityId,
        name: hotel.name,
        city: hotel.city,
        rating: hotel.rating,
        price: hotel.price,
        commissionPct: hotel.commissionPct
      }));
    } catch (error) {
      this.logger.error('Failed to get all hotels', error);
      throw error;
    }
  }

  getClient(): Client {
    return this.client;
  }
}
