import { userModel } from './user.schema';
import { createUserDto, getOneUserDto, IUser } from './user.types';

const create = (userDto: createUserDto) => userModel.create({ ...userDto });

const getAll = () => userModel.findAll();

const getOne = (getOneUserDto: getOneUserDto) =>
  userModel.findOne({ where: { ...getOneUserDto } });

export default {
  create,
  getAll,
  getOne,
};
