import axios, { AxiosResponse, HttpStatusCode } from 'axios';
import { isJWT } from 'class-validator';

describe('/auth', () => {
  async function testAuthenticationEndpoints(endpoint: string, data: unknown) {
    let axiosResp: AxiosResponse;
    try {
      axiosResp = await axios.post(endpoint, data, {
        headers: { origin: 'https://app.xafpay.com' },
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }

    expect(axiosResp.status).toBe(HttpStatusCode.Created);
    expect(axiosResp.data).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });

    const { access_token, refresh_token } = axiosResp.data;
    expect(isJWT(access_token)).toBeTruthy();
    expect(isJWT(refresh_token)).toBeTruthy();
  }

  it('POST /sign-up', async () => {
    await testAuthenticationEndpoints(`/auth/sign-up`, {
      country: 'USA',
      username: 'marcjazz',
      first_name: 'Marco',
      last_name: 'Kuidja',
      email: 'marco.kuidja@xafpay.com',
      password: 'passworD273!',
      gender: 'MALE',
      birthdate: new Date().toISOString(),
      phone_number: '+1 202-555-0125',
    });
  });

  it('POST /sign-in', async () => {
    await testAuthenticationEndpoints(`/auth/sign-in`, {
      email: 'alice@prisma.io',
      password: 'password',
    });
  });

  async function handleForgotPassword() {
    let axiosResp: AxiosResponse;
    try {
      axiosResp = await axios.post(
        '/auth/forgot-password',
        { email: 'alice@prisma.io' },
        {
          headers: { origin: 'https://app.xafpay.com' },
        }
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
    return axiosResp;
  }

  it('POST /forgot-password', async () => {
    const axiosResp = await handleForgotPassword();

    expect(axiosResp.status).toBe(HttpStatusCode.Created);
    expect(axiosResp.data).toEqual({
      created_at: expect.any(String),
      expires_at: expect.any(String),
      is_verified: false,
      otp_id: expect.any(String),
      person_has_role_id: expect.any(String),
      updated_at: null,
      usage: 'reset_password',
    });

    const { code, created_at, expires_at } = axiosResp.data;
    expect(() => Number(code)).not.toThrow();
    expect(() => new Date(created_at)).not.toThrow();
    expect(() => new Date(expires_at)).not.toThrow();
  });

  it('POST /reset-password', async () => {
    const {
      data: { otp_id },
    } = await handleForgotPassword();

    let axiosResp: AxiosResponse;
    try {
      axiosResp = await axios.post(
        '/auth/reset-password',
        { otp_id, otp_code: '55555', password: 'passworD237!' },
        { headers: { origin: 'https://app.xafpay.com' } }
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }

    expect(axiosResp.status).toBe(HttpStatusCode.NoContent);
  });
});
