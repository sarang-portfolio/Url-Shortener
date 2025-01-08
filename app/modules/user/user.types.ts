import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export interface IUser
  extends Model<InferAttributes<IUser>, InferCreationAttributes<IUser>> {
  id?: CreationOptional<number>;
  email: string;
  sub: string;
  createdAt?: CreationOptional<Date>;
  updatedAt?: CreationOptional<Date>;
  deletedAt?: CreationOptional<Date | null>;
}

export interface GetOneUserDto {
  sub?: string;
  email?: string;
}

export interface CreateUserDto {
  email: string;
  sub: string;
}
