import { DataTypes } from 'sequelize';
import { DATABASE_TABLES } from '../../utility/common/constants/database.constants';
import { sequelize } from '../../utility/sequelize';
import { userModel } from '../user/user.schema';
import { IUrl } from './url.types';

export const urlModel = sequelize.define<IUrl>(
  DATABASE_TABLES.URL,
  {
    longUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customAlias: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['shortUrl'],
      },
      {
        fields: ['longUrl'],
      },
    ],
  },
);

urlModel.belongsTo(userModel, {
  foreignKey: 'userId',
  as: 'user',
});
userModel.hasMany(urlModel, {
  foreignKey: 'userId',
  as: 'urls',
});
