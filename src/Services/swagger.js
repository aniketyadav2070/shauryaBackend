import swaggerJsDoc from 'swagger-jsdoc';
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);      

const root = path.normalize(`${__dirname}/../..`);
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shuarya Career',
      version: '3.0.0',
      description: 'Shuarya Career',
    },
  },
  apis: [
    path.resolve(`${root}/src/controllers/**/*.js`),
    path.resolve(`${root}/api.yaml`),
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
export default swaggerDocs;
