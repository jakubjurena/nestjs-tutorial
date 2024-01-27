import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity/event.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,
  ) {}

  private findOneInternal(id: string) {
    return this.coffeeRepository.findOne({
      where: { id: +id },
      relations: ['flavors'],
    });
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    });
    if (existingFlavor) {
      return existingFlavor;
    }
    return this.flavorRepository.create({ name });
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    return this.coffeeRepository.find({
      order: { id: 'ASC' },
      skip: paginationQuery.offset,
      take: paginationQuery.limit,
      relations: {
        flavors: true,
      },
    });
  }

  async findOne(id: string) {
    const coffee = await this.findOneInternal(id);
    if (!coffee) {
      throw new NotFoundException(`Coffee with id '${id}' not found`);
    }
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => {
        return this.preloadFlavorByName(name);
      }),
    );
    const newCoffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    });
    return this.coffeeRepository.save(newCoffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => {
          return this.preloadFlavorByName(name);
        }),
      ));
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
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

  async recommend(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const coffee = await queryRunner.manager.findOne(Coffee, {
        where: { id: +id },
      });
      if (!coffee) {
        throw new NotFoundException(`Coffee with id '${id}' not found`);
      }
      coffee.recommendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
