import fs from 'fs';
import path from 'path';    
import {DiffService} from '../diff.service';

describe('DiffService', () => {
  const diffService = new DiffService();

    describe('.diff()', () => {
        it('should generate given template to the destination dir', async () => {
            const asyncapi = {
                asyncapi: '2.2.0',
                info: {
                    title: 'Test Service',
                    version: '1.0.0',
                },
                channels: {},
            };
            const other = {
                asyncapi: '2.2.0',
                info: {
                    title: 'Test Service',
                    version: '1.0.0',
                },
                channels: {},
            };

            const output = await diffService.diff(asyncapi, other);
            console.log("Output from test: ",output);
            expect(output).toEqual(undefined);
        });
    });
});
