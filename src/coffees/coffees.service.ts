import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
  ) {}

  async findAll() {
    return this.coffeeRepository.find({ order: { id: 'ASC' } }) || [];
  }
  private findOneInternal(id: string) {
    return this.coffeeRepository.findOne({ where: { id: +id } });
  }

  async findOne(id: string) {
    const coffee = await this.findOneInternal(id);
    if (!coffee) {
      throw new NotFoundException(`Coffee with id '${id}' not found`);
    }
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const newCoffee = this.coffeeRepository.create(createCoffeeDto);
    return this.coffeeRepository.save(newCoffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee with id '${id}' not found`);
    }
    return this.coffeeRepository.save(coffee);
  }
  async remove(id: string) {
    const coffee = await this.coffeeRepository.findOne({ where: { id: +id } });
    return this.coffeeRepository.remove(coffee);
  }
}
