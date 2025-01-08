import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

export interface IAnalytics
  extends Model<
    InferAttributes<IAnalytics>,
    InferCreationAttributes<IAnalytics>
  > {
  id?: CreationOptional<number>;
  urlId?: ForeignKey<number>;
  userAgent: string;
  ipAddress: string;
  osName: string;
  deviceType: string;
  geoLocation: string;
  createdAt?: CreationOptional<Date>;
  updatedAt?: CreationOptional<Date>;
  deletedAt?: CreationOptional<Date | null>;
}

export interface CreateAnalyticsDto {
  userAgent: string;
  ipAddress: string;
  osName: string;
  deviceType: string;
  geoLocation: string;
  urlId: number;
}
