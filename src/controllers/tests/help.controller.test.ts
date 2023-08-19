import request from 'supertest';
import { App } from '../../app';
import { HelpController, fetchCommands } from '../help.controller';

jest.mock('../help.controller', () => ({
    ...(jest.requireActual('../help.controller') as any),
    fetchCommands: jest.fn()
}));

describe('HelpController', () => {
    let app;
    beforeAll(async () => {
        app = new App([new HelpController()]);
        await app.init();
    });

    describe('[GET] /help', () => {
        it('should return all commands', async () => {
            (fetchCommands as jest.Mock).mockResolvedValue({
                paths: {
                    "/validate": {},
                    "/parse": {},
                    "/generate": {},
                    "/convert": {},
                    "/bundle": {},
                    "/diff": {}
                }
            });

            const response = await request(app.getServer())
                .get('/v1/help')
                .expect(200);

            expect(response.body).toEqual([
                {
                    "command": "validate",
                    "url": "/help/validate"
                },
                {
                    "command": "parse",
                    "url": "/help/parse"
                },
                {
                    "command": "generate",
                    "url": "/help/generate"
                },
                {
                    "command": "convert",
                    "url": "/help/convert"
                },
                {
                    "command": "bundle",
                    "url": "/help/bundle"
                },
                {
                    "command": "diff",
                    "url": "/help/diff"
                }
            ]);
        });

        it('should return help details for a specific command - generate', async () => {
            const response = await request(app.getServer())
                .get('/v1/help/generate')
                .expect(200);

            expect(response.body).toEqual({
                "command": "/generate",
                "method": "POST",
                "summary": "Generate the given AsyncAPI template.",
                "requestBody": {
                    "type": "object",
                    "required": [
                        "asyncapi",
                        "template"
                    ],
                    "properties": {
                        "asyncapi": {
                            "$ref": "https://github.com/asyncapi/spec/blob/master/spec/asyncapi.md#asyncapi-object"
                        },
                        "template": {
                            "type": "string",
                            "description": "Template name to be generated.",
                            "enum": [
                                "@asyncapi/dotnet-nats-template",
                                "@asyncapi/go-watermill-template",
                                "@asyncapi/html-template",
                                "@asyncapi/java-spring-cloud-stream-template",
                                "@asyncapi/java-spring-template",
                                "@asyncapi/java-template",
                                "@asyncapi/markdown-template",
                                "@asyncapi/nodejs-template",
                                "@asyncapi/nodejs-ws-template",
                                "@asyncapi/python-paho-template",
                                "@asyncapi/ts-nats-template"
                            ]
                        },
                        "parameters": {
                            "type": "object",
                            "description": "Template parameters to be generated. Each template has different parameters that you should check in the documentation, \nwhich is usually located in the template's repository.\nThis field is optional but may be required for some templates.\n",
                            "additionalProperties": true
                        }
                    }
                }
            });
        });

        it('should return 404 error for an invalid command', async () => {
            const response = await request(app.getServer())
                .get('/v1/help/invalidCommand')
                .expect(404);
        
            expect(response.body).toEqual({
                type: 'https://api.asyncapi.com/problem/invalid-asyncapi-command',
                title: 'Invalid AsyncAPI Command',
                status: 404,
                detail: 'The given AsyncAPI command is not valid.'
            });
        });

        it('should return 404 error for a command without a method', async () => {
            (fetchCommands as jest.Mock).mockResolvedValue({
                paths: {
                    "/someCommand": {}
                }
            });

            const response = await request(app.getServer())
                .get('/v1/help/someCommand')
                .expect(404);
        
            expect(response.body).toEqual({
                type: 'https://api.asyncapi.com/problem/invalid-asyncapi-command',
                title: 'Invalid AsyncAPI Command',
                status: 404,
                detail: 'The given AsyncAPI command is not valid.'
            });
        });       
    });
});