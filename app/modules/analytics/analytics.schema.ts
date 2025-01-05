import { DataTypes } from 'sequelize';
import { DATABASE_TABLES } from '../../utility/common/constants/database.constants';
import { sequelize } from '../../utility/sequelize';
import { IAnalytics } from './analytics.types';
import { urlModel } from '../url/url.schema';

export const analyticsModel = sequelize.define<IAnalytics>(
  DATABASE_TABLES.ANALYTICS,
  {
    userAgent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    osName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deviceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    geoLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['urlId'],
      },
      {
        fields: ['ipAddress'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  },
);

urlModel.hasMany(analyticsModel, {
  foreignKey: 'urlId',
  as: 'analytics',
});

analyticsModel.belongsTo(urlModel, {
  foreignKey: 'urlId',
  as: 'url',
});
