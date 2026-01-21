import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Einkaufsliste API',
            version: '1.0.0',
            description: 'REST-API für Einkaufslisten - Semesterprojekt',
        },
        servers: [
            {url: 'http://localhost:3000', description: 'Development Server'}
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {type: 'integer', example: 1},
                        username: {type: 'string', example: 'johndoe'},
                        created_at: {type: 'string', format: 'date-time'}
                    }
                },
                UserInput: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: {type: 'string', example: 'johndoe'},
                        password: {type: 'string', example: 'secret123'}
                    }
                },
                List: {
                    type: 'object',
                    properties: {
                        id: {type: 'integer', example: 1},
                        name: {type: 'string', example: 'Wocheneinkauf'},
                        user_id: {type: 'integer', example: 1},
                        created_at: {type: 'string', format: 'date-time'}
                    }
                },
                ListInput: {
                    type: 'object',
                    required: ['name', 'user_id'],
                    properties: {
                        name: {type: 'string', example: 'Wocheneinkauf'},
                        user_id: {type: 'integer', example: 1}
                    }
                },
                Item: {
                    type: 'object',
                    properties: {
                        id: {type: 'integer', example: 1},
                        name: {type: 'string', example: 'Milch'},
                        quantity: {type: 'integer', example: 2},
                        checked: {type: 'boolean', example: false},
                        list_id: {type: 'integer', example: 1},
                        created_at: {type: 'string', format: 'date-time'}
                    }
                },
                ItemInput: {
                    type: 'object',
                    required: ['name', 'list_id'],
                    properties: {
                        name: {type: 'string', example: 'Milch'},
                        quantity: {type: 'integer', example: 2, default: 1},
                        list_id: {type: 'integer', example: 1}
                    }
                },
                ItemUpdate: {
                    type: 'object',
                    properties: {
                        name: {type: 'string', example: 'Vollmilch'},
                        quantity: {type: 'integer', example: 3},
                        checked: {type: 'boolean', example: true}
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {type: 'string', example: 'Error message'}
                    }
                }
            }
        }
    },
    apis: ['./src/controller/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);