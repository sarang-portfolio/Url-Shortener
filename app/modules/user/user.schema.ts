import { DataTypes } from 'sequelize';
import { DATABASE_TABLES } from '../../utility/common/constants/database.constants';
import { sequelize } from '../../utility/sequelize';
import { IUser } from './user.types';

export const userModel = sequelize.define<IUser>(
  DATABASE_TABLES.USERS,
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    sub: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['sub'],
        unique: true,
      },
    ],
  },
);
