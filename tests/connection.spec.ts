import { connectToPostgres } from '../app/connections/postgres.connection';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../app/utility/common/constants/message.constants';
import logger from '../app/utility/logger';
import { sequelize } from '../app/utility/sequelize';

jest.mock('../app/utility/sequelize.ts', () => ({
  sequelize: {
    authenticate: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  },
}));

jest.mock('winston', () => {
  const originalModule = jest.requireActual('winston');

  const mockFileTransport = jest.fn();

  return {
    ...originalModule,
    createLogger: jest.fn().mockReturnValue({
      add: jest.fn(),
      transports: [
        new mockFileTransport({
          filename: 'mock-error.log',
          level: 'error',
        }),
        new mockFileTransport({ filename: 'mock-combined.log' }),
      ],
      info: jest.fn(),
      error: jest.fn(),
    }),
    format: originalModule.format,
    transports: { ...originalModule.transports, File: mockFileTransport },
  };
});

describe('connectToPostgres', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await sequelize.close();
    jest.clearAllMocks();
  });

  it('should successfully connect to the database and log success', async () => {
    (sequelize.authenticate as jest.Mock).mockResolvedValueOnce(undefined);
    (sequelize.sync as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await connectToPostgres();

    expect(sequelize.authenticate).toHaveBeenCalledTimes(1);
    expect(sequelize.sync).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(SUCCESS_MESSAGES.CONNECTED);
    expect(result).toBe(true);
  });

  it('should log an error and throw an exception on failure', async () => {
    (sequelize.authenticate as jest.Mock).mockRejectedValueOnce(
      ERROR_MESSAGES.DATABASE_CONNCECTION_FAILURE,
    );

    try {
      await connectToPostgres();
    } catch (error) {
      expect(error).toBe(ERROR_MESSAGES.DATABASE_CONNCECTION_FAILURE);
      expect(logger.error).toHaveBeenCalledWith(
        ERROR_MESSAGES.DATABASE_CONNCECTION_FAILURE,
      );
    }

    expect(sequelize.authenticate).toHaveBeenCalledTimes(1);
    expect(sequelize.sync).not.toHaveBeenCalled();
  });
});
