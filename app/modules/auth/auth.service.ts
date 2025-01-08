import { verifyIdToken } from '../../utility/OAuth2.google';
import userService from '../user/user.service';

const login = async (idToken: string) => {
  try {
    const payload = await verifyIdToken(idToken);
    const user =
      (await userService.getOneUser({ email: payload?.email })) ||
      (await userService.createUser({
        email: payload?.email as string,
        sub: payload?.sub as string,
      }));
    return { token: idToken };
  } catch (error) {
    throw error;
  }
};

export default {
  login,
};
