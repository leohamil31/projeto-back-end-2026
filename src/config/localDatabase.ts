import fs from 'fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

export interface PersistedDatabase {
  categories: Category[];
  products: Product[];
  orders: Order[];
}

const dbPath = path.join(process.cwd(), 'data', 'pastifico-db.json');

/**
 * Conteúdo de exemplo (seed) usado apenas quando o arquivo local ainda não existe.
 * Os `key` abaixo servem só para ligar produto -> categoria durante a montagem do
 * seed; o `id` real de cada registro é sempre um UUID gerado em tempo de execução.
 */
const categorySeeds = [
  { key: 'massas', name: 'Massas', description: 'Especialidades artesanais do Pastifico' },
  { key: 'entradas', name: 'Entradas', description: 'Antipasti para abrir a experiência italiana' },
  { key: 'bebidas', name: 'Bebidas', description: 'Vinhos, sucos e refrescos para acompanhar' },
  { key: 'sobremesas', name: 'Sobremesas', description: 'Doçura final com sabores italianos clássicos' }
];

const productSeeds = [
  { name: 'Spaghetti Carbonara', description: 'Massa cremosa com ovos, parmesão, bacon e pimenta negra.', price: 42.9, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80', categoryKey: 'massas' },
  { name: 'Lasanha à Bolonhesa', description: 'Camadas de massa com molho bolonhesa e queijo gratinado.', price: 48.5, image: '/images/lasanha-bolognesa-real.jpg', categoryKey: 'massas' },
  { name: 'Penne al Pomodoro', description: 'Penne ao molho de tomate fresco com manjericão.', price: 36.5, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80', categoryKey: 'massas' },
  { name: 'Ravioli de Ricota', description: 'Ravioli artesanal recheado com ricota e molho de manteiga e ervas.', price: 46.9, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80', categoryKey: 'massas' },
  { name: 'Gnocchi Quatro Queijos', description: 'Gnocchi macio coberto com molho cremoso de quatro queijos.', price: 44.8, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80', categoryKey: 'massas' },
  { name: 'Fettuccine Alfredo', description: 'Fettuccine em molho cremoso de parmesão e manteiga.', price: 43.5, image: 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=900&q=80', categoryKey: 'massas' },
  { name: 'Bruschetta Clássica', description: 'Pão tostado com tomate, alho, manjericão e azeite.', price: 18.9, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80', categoryKey: 'entradas' },
  { name: 'Caprese', description: 'Tomate, mussarela de búfala, manjericão e balsâmico.', price: 22.5, image: '/images/caprese-real.jpg', categoryKey: 'entradas' },
  { name: 'Arancini', description: 'Bolinho de risoto crocante com queijo e ervas.', price: 20.9, image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80', categoryKey: 'entradas' },
  { name: 'Crostini de Prosciutto', description: 'Pão tostado com prosciutto crocante e cream cheese.', price: 24.5, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80', categoryKey: 'entradas' },
  { name: 'Caponata', description: 'Entradinha de berinjela, tomate, azeitona e alho.', price: 19.8, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80', categoryKey: 'entradas' },
  { name: 'Vinho Toscano', description: 'Seleção premium de vinho tinto com notas de frutos vermelhos.', price: 29.9, image: '/images/vinho-toscano-real.jpg', categoryKey: 'bebidas' },
  { name: 'Chianti Classico', description: 'Tinto italiano elegante, com notas de cereja, ervas e final aveludado.', price: 64.9, image: '/images/chianti-classico-real.jpg', categoryKey: 'bebidas' },
  { name: 'Pinot Grigio delle Venezie', description: 'Branco fresco e delicado, perfeito para entradas e massas leves.', price: 59.9, image: '/images/pinot-grigio-real.jpg', categoryKey: 'bebidas' },
  { name: 'Prosecco Veneto', description: 'Espumante italiano leve e aromático para brindar à mesa.', price: 72.9, image: '/images/prosecco-veneto-real.jpg', categoryKey: 'bebidas' },
  { name: 'Montepulciano d’Abruzzo', description: 'Tinto encorpado e gastronômico, com frutas maduras e especiarias.', price: 68.9, image: '/images/montepulciano-dabruzzo-real.jpg', categoryKey: 'bebidas' },
  { name: 'Limonada Italiana', description: 'Refrescante limonada com hortelã e sabor cítrico intenso.', price: 12.5, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80', categoryKey: 'bebidas' },
  { name: 'Água com Gás', description: 'Garrafa gelada para acompanhar a refeição.', price: 8.5, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80', categoryKey: 'bebidas' },
  { name: 'Coca-Cola 600ml', description: 'Refrigerante de cola geladinho para acompanhar.', price: 9.5, image: '/images/coca-cola-real.jpg', categoryKey: 'bebidas' },
  { name: 'Guaraná Antarctica 600ml', description: 'Bebida energética e refrescante com sabor marcante.', price: 9.5, image: '/images/guarana-antarctica-real.jpg', categoryKey: 'bebidas' },
  { name: 'Fanta Laranja 600ml', description: 'Refrigerante cítrico com sabor refrescante e vibrant.', price: 9.5, image: '/images/fanta-laranja-real.jpg', categoryKey: 'bebidas' },
  { name: 'Tiramisu', description: 'Clássico italiano com café, mascarpone e cacau.', price: 21.9, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80', categoryKey: 'sobremesas' },
  { name: 'Panna Cotta', description: 'Sobremesa cremosa com calda de frutas vermelhas.', price: 19.5, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80', categoryKey: 'sobremesas' },
  { name: 'Cannoli', description: 'Casca crocante recheada com ricota e chocolate.', price: 18.5, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=900&q=80', categoryKey: 'sobremesas' },
  { name: 'Pavê de Chocolate', description: 'Camadas cremosa de chocolate com biscoitos e cacau.', price: 23.5, image: '/images/pave-chocolate-real.png', categoryKey: 'sobremesas' },
  { name: 'Torta de Ricota', description: 'Sobremesa clássica com massa fina e recheio de ricota.', price: 24.9, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80', categoryKey: 'sobremesas' },
  { name: 'Affogato', description: 'Sorvete de baunilha com café espresso quentinho.', price: 18.9, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80', categoryKey: 'sobremesas' }
];

const buildDefaultDatabase = (): PersistedDatabase => {
  const createdAt = '2026-01-01T00:00:00.000Z';
  const categoryIdByKey = new Map(categorySeeds.map((seed) => [seed.key, randomUUID()]));

  const categories: Category[] = categorySeeds.map((seed) => ({
    id: categoryIdByKey.get(seed.key)!,
    name: seed.name,
    description: seed.description,
    createdAt
  }));

  const products: Product[] = productSeeds.map((seed) => ({
    id: randomUUID(),
    name: seed.name,
    description: seed.description,
    price: seed.price,
    image: seed.image,
    isAvailable: true,
    categoryId: categoryIdByKey.get(seed.categoryKey)!,
    createdAt
  }));

  return { categories, products, orders: [] };
};

const sanitizeCatalogData = (database: PersistedDatabase, defaultDatabase: PersistedDatabase): PersistedDatabase => {
  const uniqueCategories = new Map<string, Category>();

  for (const category of database.categories ?? []) {
    const name = category?.name?.trim();
    if (!name) continue;

    const key = name.toLowerCase();
    if (!uniqueCategories.has(key)) {
      uniqueCategories.set(key, {
        ...category,
        id: category.id || randomUUID(),
        name
      });
    }
  }

  const uniqueProducts = new Map<string, Product>();

  for (const product of database.products ?? []) {
    const name = product?.name?.trim();
    if (!name) continue;

    const defaultProduct = defaultDatabase.products.find((item) => item.name.toLowerCase() === name.toLowerCase());
    const sourceImage = defaultProduct?.image ?? product.image;
    const normalizedImage = typeof sourceImage === 'string' && (sourceImage.startsWith('http') || sourceImage.startsWith('/')) ? sourceImage : 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80';
    const key = name.toLowerCase();
    if (!uniqueProducts.has(key)) {
      uniqueProducts.set(key, {
        ...product,
        id: product.id || randomUUID(),
        name,
        description: product.description?.trim().length > 20 ? product.description : (defaultProduct?.description ?? product.description),
        image: normalizedImage,
        isAvailable: product.isAvailable ?? true
      });
    }
  }

  for (const category of defaultDatabase.categories) {
    if (!uniqueCategories.has(category.name.toLowerCase())) {
      uniqueCategories.set(category.name.toLowerCase(), category);
    }
  }

  for (const product of defaultDatabase.products) {
    if (!uniqueProducts.has(product.name.toLowerCase())) {
      uniqueProducts.set(product.name.toLowerCase(), product);
    }
  }

  return {
    categories: Array.from(uniqueCategories.values()),
    products: Array.from(uniqueProducts.values()),
    orders: database.orders ?? []
  };
};

export const ensureDatabaseFile = (): PersistedDatabase => {
  const directory = path.dirname(dbPath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    const defaultDatabase = buildDefaultDatabase();
    fs.writeFileSync(dbPath, JSON.stringify(defaultDatabase, null, 2), 'utf8');
    return defaultDatabase;
  }

  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    const defaultDatabase = buildDefaultDatabase();

    if (!raw.trim()) {
      fs.writeFileSync(dbPath, JSON.stringify(defaultDatabase, null, 2), 'utf8');
      return defaultDatabase;
    }

    const parsed = JSON.parse(raw) as PersistedDatabase;
    const normalized = sanitizeCatalogData(parsed, defaultDatabase);

    if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
      fs.writeFileSync(dbPath, JSON.stringify(normalized, null, 2), 'utf8');
    }

    return normalized;
  } catch {
    const defaultDatabase = buildDefaultDatabase();
    fs.writeFileSync(dbPath, JSON.stringify(defaultDatabase, null, 2), 'utf8');
    return defaultDatabase;
  }
};

export const saveDatabase = (database: PersistedDatabase): void => {
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
};
