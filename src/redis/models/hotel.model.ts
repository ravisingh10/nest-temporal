import { Entity, Schema } from 'redis-om';

export interface Hotel {
  id?: string;
  name: string;
  city: string;
  rating: number;
  price: string;
  commissionPct: number;
}

export const hotelSchema = new Schema('hotel', {
  name: { type: 'text', sortable: true },
  city: { type: 'text', sortable: true },
  rating: { type: 'number', sortable: true },
  price: { type: 'string' },
  commissionPct: { type: 'number', sortable: true }
}, {
  dataStructure: 'JSON',
});