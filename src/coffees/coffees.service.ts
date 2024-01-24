import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  findAll(): Coffee[] {
    return this.coffees;
  }
  findOne(id: string): Coffee | undefined {
    const coffee = this.coffees.find((item) => item.id === +id) || undefined;
    if (!coffee) {
      throw new HttpException(
        `Coffee with id '${id}' not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return coffee;
  }
  create(createCoffeeDto: CreateCoffeeDto): Coffee | undefined {
    if (!this.findOne('3')) {
      const newCoffee = { id: 3, ...createCoffeeDto };
      this.coffees.push(newCoffee);
      return newCoffee;
    }
    return undefined;
  }
  update(id: string, updateCoffeeDto: UpdateCoffeeDto): Coffee | undefined {
    const existingCoffee = this.findOne(id);
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
  remove(id: string): Coffee | undefined {
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
