import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'Shipwreck Roast',
      brand: 'Buddy Brew',
      flavors: ['chocolate', 'vanilla'],
    },
    {
      id: 2,
      name: 'Test Roast',
      brand: 'Prague Roast Coffee',
      flavors: ['chocolate', 'vanilla'],
    },
  ];
  private newId: number = 3;

  findAll(): Coffee[] {
    return this.coffees || [];
  }
  private findOneInternal(id: string): Coffee | undefined {
    return this.coffees.find((item) => item.id === +id) || undefined;
  }

  findOne(id: string): Coffee {
    const coffee = this.findOneInternal(id);
    if (!coffee) {
      throw new NotFoundException(`Coffee with id '${id}' not found`);
    }
    return coffee;
  }
  create(createCoffeeDto: CreateCoffeeDto): Coffee {
    if (this.findOneInternal(this.newId.toString())) {
      throw new InternalServerErrorException(
        'Server cannot generate new Coffee',
      );
    }
    const newCoffee = { id: this.newId, ...createCoffeeDto };
    this.coffees.push(newCoffee);
    this.newId++;
    return newCoffee;
  }
  update(id: string, updateCoffeeDto: UpdateCoffeeDto): Coffee {
    const existingCoffee = this.findOneInternal(id);
    if (!existingCoffee) {
      throw new HttpException(
        `Coffee with id '${id}' not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    for (const key in updateCoffeeDto) {
      existingCoffee[key] = updateCoffeeDto[key];
    }
    return existingCoffee;
  }
  remove(id: string): Coffee {
    const coffeeIndex = this.coffees.findIndex((item) => item.id === +id);
    if (coffeeIndex === -1) {
      throw new HttpException(
        `Coffee with id '${id}' not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const removedCoffee = this.coffees[coffeeIndex];
    this.coffees.splice(coffeeIndex, 1);
    return removedCoffee;
  }
}
