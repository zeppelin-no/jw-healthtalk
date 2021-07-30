import { Store } from 'pullstate';
import jwtDecode from 'jwt-decode';

import * as accountService from '../services/account.service';
import type { AuthData, Capture, Customer, JwtDetails, CustomerConsent } from '../../types/account';
import * as persist from '../utils/persist';

import { ConfigStore } from './ConfigStore';

const PERSIST_KEY_ACCOUNT = 'auth';

type AccountStore = {
  loading: boolean;
  auth: AuthData | null;
  user: Customer | null;
};

export const AccountStore = new Store<AccountStore>({
  loading: true,
  auth: null,
  user: null,
});

const setLoading = (loading: boolean) => {
  return AccountStore.update((s) => {
    s.loading = loading;
  });
};

export const initializeAccount = async () => {
  const { config } = ConfigStore.getRawState();

  if (!config.cleengId) setLoading(false);

  const storedSession: AuthData | null = persist.getItem(PERSIST_KEY_ACCOUNT) as AuthData | null;
  let refreshTimeout: number;

  AccountStore.subscribe(
    (state) => state.auth,
    (authData) => {
      window.clearTimeout(refreshTimeout);

      if (authData) {
        refreshTimeout = window.setTimeout(() => refreshJwtToken(config.cleengSandbox, authData), 60 * 1000);
      }

      persist.setItem(PERSIST_KEY_ACCOUNT, authData);
    },
  );

  // restore session from localStorage
  try {
    if (storedSession) {
      const refreshedAuthData = await getFreshJwtToken(config.cleengSandbox, storedSession);

      if (refreshedAuthData) {
        await afterLogin(config.cleengSandbox, refreshedAuthData);
      }
    }
  } catch (error: unknown) {
    await logout();
  }

  setLoading(false);
};

const getFreshJwtToken = async (sandbox: boolean, auth: AuthData) => {
  const result = await accountService.refreshToken({ refreshToken: auth.refreshToken }, sandbox);

  if (result.errors.length) throw new Error(result.errors[0]);

  return result?.responseData;
};

const refreshJwtToken = async (sandbox: boolean, auth: AuthData) => {
  try {
    const authData = await getFreshJwtToken(sandbox, auth);

    if (authData) {
      AccountStore.update((s) => {
        s.auth = { ...s.auth, ...authData };
      });
    }
  } catch (error: unknown) {
    // failed to refresh, logout user
    await logout();
  }
};

export const afterLogin = async (sandbox: boolean, auth: AuthData) => {
  const decodedToken: JwtDetails = jwtDecode(auth.jwt);
  const customerId = decodedToken.customerId.toString();
  const response = await accountService.getCustomer({ customerId }, sandbox, auth.jwt);

  if (response.errors.length) throw new Error(response.errors[0]);

  AccountStore.update((s) => {
    s.loading = false;
    s.auth = auth;
    s.user = response.responseData;
  });
};

export const login = async (email: string, password: string) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');

  setLoading(true);

  const response = await accountService.login({ email, password, publisherId: cleengId }, cleengSandbox);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return afterLogin(cleengSandbox, response.responseData);
};

export const logout = async () => {
  persist.removeItem(PERSIST_KEY_ACCOUNT);

  AccountStore.update((s) => {
    s.auth = null;
    s.user = null;
  });
};

export const register = async (email: string, password: string) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');

  const localesResponse = await accountService.getLocales(cleengSandbox);

  if (localesResponse.errors.length > 0) throw new Error(localesResponse.errors[0]);

  const responseRegister = await accountService.register(
    {
      email: email,
      password: password,
      locale: localesResponse.responseData.locale,
      country: localesResponse.responseData.country,
      currency: localesResponse.responseData.currency,
      publisherId: cleengId,
    },
    cleengSandbox,
  );

  if (responseRegister.errors.length) throw new Error(responseRegister.errors[0]);

  return afterLogin(cleengSandbox, responseRegister.responseData);
};

export const updateConsents = async (customerConsents: CustomerConsent[]) => {
  const { auth, user } = AccountStore.getRawState();
  const {
    config: { cleengSandbox },
  } = ConfigStore.getRawState();

  if (!auth || !user) throw new Error('no auth');

  const updateConsentsResponse = await accountService.updateCustomerConsents(
    { id: user.id.toString(), consents: customerConsents },
    cleengSandbox,
    auth.jwt,
  );

  if (updateConsentsResponse.errors.length) throw new Error(updateConsentsResponse.errors[0]);

  return updateConsentsResponse.responseData;
};

export const getCaptureStatus = async () => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { auth, user } = AccountStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user not logged in');

  const response = await accountService.getCaptureStatus({ customerId: user.id.toString() }, cleengSandbox, auth.jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return response.responseData;
};

export const updateCaptureAnswers = async (capture: Capture) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { auth, user } = AccountStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user not logged in');

  const response = await accountService.updateCaptureAnswers({ customerId: user.id.toString(), ...capture }, cleengSandbox, auth.jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return response.responseData;
};

export const resetPassword = async (email: string, resetUrl: string) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');

  const response = await accountService.resetPassword(
    {
      customerEmail: email,
      publisherId: cleengId,
      resetUrl,
    },
    cleengSandbox,
  );

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return response.responseData;
};

export const changePassword = async (customerEmail: string, newPassword: string, resetPasswordToken: string) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');

  const response = await accountService.changePassword(
    {
      publisherId: cleengId,
      customerEmail,
      newPassword,
      resetPasswordToken,
    },
    cleengSandbox,
  );

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return response.responseData;
};
