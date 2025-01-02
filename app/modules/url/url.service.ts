import { nanoid } from 'nanoid';
import userService from '../user/user.service';
import { URL_CONSTANTS } from './url.constants';
import urlRepo from './url.repo';
import { IUrl, GetOneUrlDto } from './url.types';
import { COMMON_CONSTANTS } from '../../utility/common/constants/common.constants';
import { USER_CONSTANTS } from '../user/user.constants';

const { NOT_FOUND } = USER_CONSTANTS;
const { SHORT_BASE_URL } = COMMON_CONSTANTS;
const { ALREADY_EXIST, INVALID_URL_FORMAT, MISSING_LONG_URL } = URL_CONSTANTS;

const createUrl = async (urlDto: {
  longUrl: string;
  sub: string;
  customAlias?: string;
  topic?: string;
}): Promise<{ shortUrl: string; createdAt: Date }> => {
  try {
    if (!urlDto.longUrl) {
      throw MISSING_LONG_URL;
    }
    new URL(urlDto.longUrl);
    // if (!urlPattern.test(urlDto.longUrl)) {
    //   throw INVALID_URL_FORMAT;
    // }
    const user = await userService.getOneUser({ sub: urlDto.sub });
    if (!user) {
      throw NOT_FOUND;
    }

    const existingUrl = await getOneUrl({
      longUrl: urlDto.longUrl,
      userId: user?.id,
    });

    if (existingUrl) {
      throw ALREADY_EXIST;
    }

    const shortCode = urlDto.customAlias || nanoid(8);
    const shortenedUrl = SHORT_BASE_URL + shortCode;

    const { sub, ...restOfUrlDto } = urlDto;
    const data = {
      ...restOfUrlDto,
      userId: user?.id as number,
      shortUrl: shortenedUrl,
    };

    const url = await urlRepo.create(data);

    return { shortUrl: shortenedUrl, createdAt: url.createdAt as Date };
  } catch (error) {
    if (error instanceof TypeError) {
      throw INVALID_URL_FORMAT;
    }
    throw error;
  }
};

const getAllUrls = async () => {
  try {
    const urls = await urlRepo.getAll();
    return urls;
  } catch (error) {
    throw error;
  }
};

const getOneUrl = async (getOneDto: GetOneUrlDto) => {
  try {
    const url = await urlRepo.getOne(getOneDto);
    return url;
  } catch (error) {
    throw error;
  }
};

const updateOneUrl = async (id: number, updateDto: Partial<IUrl>) => {
  try {
    const result = await urlRepo.updateOne(id, updateDto);
    return result;
  } catch (error) {
    throw error;
  }
};

const deleteOneUrl = async (id: number) => {
  try {
    const result = await urlRepo.deleteOne(id);
    return result;
  } catch (error) {
    throw error;
  }
};

export default {
  createUrl,
  getAllUrls,
  getOneUrl,
  updateOneUrl,
  deleteOneUrl,
};
