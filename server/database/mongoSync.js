import mongoose from 'mongoose';
import * as Models from './models.js';

// Schemas MongoDB
const ProductSchema = new mongoose.Schema({
  id: String,
  name: String,
  barcode: String,
  category: String,
  price: Number,
  cost: Number,
  stock: Number,
  minStock: Number,
  brand: String,
  createdAt: Date,
  updatedAt: Date
});

const ServiceSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  duration: Number,
  commission: Number,
  category: String,
  description: String,
  createdAt: Date
});

// Models
const Product = mongoose.model('Product', ProductSchema);
const Service = mongoose.model('Service', ServiceSchema);

// Conexão com MongoDB
export async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB Atlas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    return false;
  }
}

// Função para migrar dados do SQLite para MongoDB
export async function migrateDataToMongo(db) {
  try {
    // Migrar usuários
    const users = await db.allAsync('SELECT * FROM users');
    for (const user of users) {
      await Models.User.findOneAndUpdate(
        { email: user.email },
        user,
        { upsert: true, new: true }
      );
    }

    // Migrar produtos
    const products = await db.allAsync('SELECT * FROM products');
    for (const product of products) {
      await Models.Product.findOneAndUpdate(
        { barcode: product.barcode },
        product,
        { upsert: true, new: true }
      );
    }

    // Migrar serviços
    const services = await db.allAsync('SELECT * FROM services');
    for (const service of services) {
      await Models.Service.findOneAndUpdate(
        { name: service.name },
        service,
        { upsert: true, new: true }
      );
    }

    // Migrar barbeiros
    const barbers = await db.allAsync('SELECT * FROM barbers');
    for (const barber of barbers) {
      await Models.Barber.findOneAndUpdate(
        { email: barber.email },
        barber,
        { upsert: true, new: true }
      );
    }

    // Migrar clientes
    const customers = await db.allAsync('SELECT * FROM customers');
    for (const customer of customers) {
      await Models.Customer.findOneAndUpdate(
        { cpf: customer.cpf },
        customer,
        { upsert: true, new: true }
      );
    }

    console.log('Migração de dados concluída com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro durante a migração:', error);
    return false;
  }
}

// Função para restaurar dados do MongoDB para SQLite
export async function restoreFromMongoDB(db) {
  try {
    // Produtos
    const products = await Product.find();
    for (const product of products) {
      db.run(`
        INSERT OR REPLACE INTO products 
        (id, name, barcode, category, price, cost, stock, minStock, brand, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.id,
        product.name,
        product.barcode,
        product.category,
        product.price,
        product.cost,
        product.stock,
        product.minStock,
        product.brand,
        product.createdAt,
        product.updatedAt
      ]);
    }

    // Serviços
    const services = await Service.find();
    for (const service of services) {
      db.run(`
        INSERT OR REPLACE INTO services
        (id, name, price, duration, commission, category, description, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        service.id,
        service.name,
        service.price,
        service.duration,
        service.commission,
        service.category,
        service.description,
        service.createdAt
      ]);
    }

    console.log('Restauração do MongoDB concluída!');
  } catch (error) {
    console.error('Erro na restauração:', error);
  }
}

// Configurar sincronização automática
export function setupAutoSync(db) {
  // Sincronizar a cada 5 minutos
  setInterval(async () => {
    await migrateDataToMongo(db);
  }, 5 * 60 * 1000);
} 