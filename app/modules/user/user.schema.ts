import { DataTypes } from 'sequelize';
import { sequelize } from '../../utility/sequelize';
import { IUser } from './user.types';
import { USER_TABLES } from './user.constants';

export const userModel = sequelize.define<IUser>(
  USER_TABLES.USERS,
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: true, paranoid: true },
);
