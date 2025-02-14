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
                description: 'An API for managing IMF\'s gadget inventory, including retrieval, updates, and self-destruction.'
                + '<br>Made by Abhigyan Niranjan as Upraised\'s Backend Intern Assignment.',
                
            },
            tags: [
                {
                    name: 'Gadgets',
                    description: 'Endpoints for managing IMF gadgets, including inventory and self-destruction.'
                },
                {
                    name: 'Auth',
                    description: 'Authentication and authorization endpoints for securing API access.'
                }
            ]
        },
        apis: [
            './dist/api/components.js',
            './dist/api/gadgets/*.js',
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
