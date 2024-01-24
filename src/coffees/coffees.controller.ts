import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@Controller('coffees')
export class CoffeesController {
  @Get()
  findAll() {
    return 'This action returns all coffees';
  }
  // findAll(@Res() response) {
  //   response.status(HttpStatus.OK).send('This action returns all coffees');
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns #${id} coffee`;
  }

  @Post()
  // @HttpCode(HttpStatus.GONE)
  create(@Body() body) {
    return body;
  }
}
