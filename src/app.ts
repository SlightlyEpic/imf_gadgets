import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import { type AppDependencies } from './types/app-DI';
import { apiRouter } from './api/api-router';

export function createApp(di: AppDependencies): ReturnType<typeof express> {
    const app = express();

    const oasOptions: swaggerJsdoc.Options = {
        failOnErrors: true,
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'IMF Gadget API',
                version: '1.0.0',
            },
        },
        servers: [{
            url: 'http://localhost:3000'
        }],
        apis: [
            // './dist/api/api-router.js',
            './dist/api/auth/*.js',
        ],
    };

    const openapiSpec = swaggerJsdoc(oasOptions);
    
    app.use(express.json());
    app.use(cookieParser());

    app.get('/openapi.json', (req, res) => {
        res.send(openapiSpec);
    });
    app.get('/swagger', (req, res) => {
        res.sendFile(__dirname + '/public/swagger.html');
    })

    app.use('/api', apiRouter(di));

    return app;
}
