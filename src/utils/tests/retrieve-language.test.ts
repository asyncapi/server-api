import { retrieveLangauge } from '../retrieve-language';

describe('retrieveLangauge()', () => {
  test('should check that content is yaml', () => {
    const result = retrieveLangauge('asyncapi: 2.2.0\nfoobar: barfoo\n');
    expect(result).toEqual('yaml');
  });

  test('should check that content is json', () => {
    const result = retrieveLangauge('{"asyncapi": "2.2.0", "foobar": "barfoo"}');
    expect(result).toEqual('json');
  });

  test('should check that content is yaml - fallback for non json content', () => {
    const result = retrieveLangauge('');
    expect(result).toEqual('yaml');
  });
});