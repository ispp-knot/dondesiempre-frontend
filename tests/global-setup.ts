import { getDirectoryBackend } from '@/lib/config';
import { execSync } from 'child_process';

async function globalSetup() {
  console.log('Limpiando base de datos de test');
  try {
    // Ejecutamos el comando de Docker directamente desde Node
    // Esto borra los datos pero mantiene las tablas
    execSync(`cd ${getDirectoryBackend()} 
        && docker compose down postgres-devmigrations 
        && docker volume rm dondesiempre-backend_pgdata-devmigr 
        && docker compose up -d postgres-devmigrations 
        && ./mvnw spring-boot:run "-Dspring-boot.run.profiles=dev-migration,seed"
        && ./mvnw spring-boot:run "-Dspring-boot.run.profiles=dev-migration"`);
     
    // Si usas Prisma, TypeORM o similar, aquí deberías correr las migraciones
    // para volver a crear las tablas en el esquema limpio:
    // execSync('npx prisma db push --force-reset'); 
    
    console.log('Base de datos lista.');
  } catch (error) {
    console.error('Error limpiando la base de datos:', error);
    throw error;
  }
}

export default globalSetup;