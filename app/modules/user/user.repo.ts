import { userModel } from './user.schema';
import { CreateUserDto, GetOneUserDto } from './user.types';

const create = (userDto: CreateUserDto) => userModel.create({ ...userDto });

const getAll = () => userModel.findAll();

const getOne = (getOneUserDto: GetOneUserDto) =>
  userModel.findOne({ where: { ...getOneUserDto } });

export default {
  create,
  getAll,
  getOne,
};
