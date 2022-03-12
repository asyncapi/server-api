import { diff } from '@asyncapi/diff';

export class DiffService {
  public async diff(asyncapi: any, other: any) {
    return await diff(asyncapi, other);
  }
}

