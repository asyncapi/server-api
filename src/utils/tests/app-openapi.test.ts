import { getAppOpenAPI } from "../app-openapi";

describe('getAppOpenAPI()', () => {
  test('should return OpenAPI document as JSON', async () => {
    const openapi = await getAppOpenAPI();
    expect(openapi.openapi).toEqual('3.1.0');
    expect(openapi.info.title).toEqual('AsyncAPI Server API');
  });

  test('should return always this same instance of JSON', async () => {
    const openapi1 = await getAppOpenAPI();
    const openapi2 = await getAppOpenAPI();
    // assert references
    expect(openapi1 === openapi2).toEqual(true);
  });
});