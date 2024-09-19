import axios, { AxiosResponse, HttpStatusCode } from 'axios';

describe('/accounts', () => {
  let accessToken: string;

  beforeAll(async () => {
    try {
      const axiosResp = await axios.post(
        '/auth/sign-in',
        { email: 'alice@prisma.io', password: 'password' },
        {
          headers: { origin: 'https://app.xafpay.com' },
        }
      );
      accessToken = axiosResp.data.access_token;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  });

  it('Get /accounts', async () => {
    let axiosResp: AxiosResponse;
    try {
      axiosResp = await axios.get('/accounts', {
        headers: {
          origin: 'https://app.xafpay.com',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
    expect(axiosResp.status).toBe(HttpStatusCode.Ok);
    expect(Array.isArray(axiosResp.data)).toBeTruthy();
  });
});
