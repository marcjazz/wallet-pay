import axios, { AxiosResponse, HttpStatusCode } from 'axios';
import { isJWT } from 'class-validator';

describe('/auth', () => {
  it('POST /sign-up', async () => {
    let res: AxiosResponse;
    try {
      res = await axios.post(`/auth/sign-up`, {
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
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }

    expect(res.status).toBe(HttpStatusCode.Created);
    expect(res.data).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });

    const { access_token, refresh_token } = res.data;
    expect(isJWT(access_token)).toBeTruthy();
    expect(isJWT(refresh_token)).toBeTruthy();
  });
});
