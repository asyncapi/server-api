import { diff } from '@asyncapi/diff';

export class DiffService{
    public async diff(asyncapi: any, other: any){
        const output = await diff(asyncapi, other);
        return output;
    }
}


