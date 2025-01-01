import userRepo from './user.repo';
import { createUserDto, getOneUserDto, IUser } from './user.types';

const createUser = async (userDto: createUserDto) => {
  try {
    const newUser = await userRepo.create(userDto);
    return newUser;
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const users = await userRepo.getAll();
    return users;
  } catch (error) {
    throw error;
  }
};

const getOneUser = async (getOneUserDto: getOneUserDto) => {
  try {
    const user = await userRepo.getOne(getOneUserDto);
    return user;
  } catch (error) {
    throw error;
  }
};

export default {
  createUser,
  getAllUsers,
  getOneUser,
};
