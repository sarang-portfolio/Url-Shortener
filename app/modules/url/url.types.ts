import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';

export interface IUrl
  extends Model<InferAttributes<IUrl>, InferCreationAttributes<IUrl>> {
  id?: CreationOptional<number>;
  userId?: ForeignKey<number>;
  longUrl: string;
  shortUrl: string;
  customAlias?: string;
  topic?: string;
  createdAt?: CreationOptional<Date>;
  updatedAt?: CreationOptional<Date>;
  deletedAt?: CreationOptional<Date | null>;
}

export interface CreateUrlDto {
  longUrl: string;
  shortUrl: string;
  customAlias?: string;
  topic?: string;
  userId: number;
}

export interface GetOneUrlDto {
  id?: number;
  shortUrl?: string;
  customAlias?: string;
  longUrl?: string;
  userId?: number;
}
