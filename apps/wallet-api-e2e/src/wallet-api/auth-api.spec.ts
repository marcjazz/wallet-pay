import axios, { AxiosResponse, HttpStatusCode } from 'axios';
import { isJWT } from 'class-validator';

describe('/auth', () => {
  async function testAuthenticationEndpoints(endpoint: string, data: unknown) {
    let axiosResp: AxiosResponse;
    try {
      axiosResp = await axios.post(endpoint, data, {
        headers: { origin: 'app.xafpay.com' },
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
});
