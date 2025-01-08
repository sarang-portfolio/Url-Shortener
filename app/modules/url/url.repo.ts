import { urlModel } from './url.schema';
import { CreateUrlDto, GetOneUrlDto, IUrl } from './url.types';

const create = (urlDto: CreateUrlDto) => urlModel.create({ ...urlDto });

const getAll = () => urlModel.findAll();

const getOne = (getOneDto: GetOneUrlDto) =>
  urlModel.findOne({ where: { ...getOneDto } });

const updateOne = (id: number, updateDto: Partial<IUrl>) =>
  urlModel.update(updateDto, { where: { id } });

const deleteOne = (id: number) => urlModel.destroy({ where: { id } });

export default {
  create,
  updateOne,
  getAll,
  getOne,
  deleteOne,
};
