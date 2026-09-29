import fs from 'fs';
import path from 'path';
import { Category, Product } from '../types';
import { Order } from './orderData';

export interface PersistedDatabase {
  categories: Category[];
  products: Product[];
  orders: Order[];
}

const dbPath = path.join(process.cwd(), 'data', 'pastifico-db.json');

const defaultDatabase: PersistedDatabase = {
  categories: [
    {
      id: 'massas',
      name: 'Massas',
      description: 'Especialidades artesanais do Pastifico',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'entradas',
      name: 'Entradas',
      description: 'Antipasti para abrir a experiência italiana',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'bebidas',
      name: 'Bebidas',
      description: 'Vinhos, sucos e refrescos para acompanhar',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'sobremesas',
      name: 'Sobremesas',
      description: 'Doçura final com sabores italianos clássicos',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  products: [
    {
      id: 'spaghetti-carbonara',
      name: 'Spaghetti Carbonara',
      description: 'Massa cremosa com ovos, parmesão, bacon e pimenta negra.',
      price: 42.9,
      image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'massas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'lasanha-bolognesa',
      name: 'Lasanha à Bolonhesa',
      description: 'Camadas de massa com molho bolonhesa e queijo gratinado.',
      price: 48.5,
      image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=900&q=85',
      isAvailable: true,
      categoryId: 'massas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'penne-al-pomodoro',
      name: 'Penne al Pomodoro',
      description: 'Penne ao molho de tomate fresco com manjericão.',
      price: 36.5,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'massas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'ravioli-ricota',
      name: 'Ravioli de Ricota',
      description: 'Ravioli artesanal recheado com ricota e molho de manteiga e ervas.',
      price: 46.9,
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'massas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'gnocchi-quatro-queijos',
      name: 'Gnocchi Quatro Queijos',
      description: 'Gnocchi macio coberto com molho cremoso de quatro queijos.',
      price: 44.8,
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'massas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'fettuccine-alfredo',
      name: 'Fettuccine Alfredo',
      description: 'Fettuccine em molho cremoso de parmesão e manteiga.',
      price: 43.5,
      image: 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'massas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'bruschetta-classica',
      name: 'Bruschetta Clássica',
      description: 'Pão tostado com tomate, alho, manjericão e azeite.',
      price: 18.9,
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'entradas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'caprese',
      name: 'Caprese',
      description: 'Tomate, mussarela de búfala, manjericão e balsâmico.',
      price: 22.5,
      image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=900&q=85',
      isAvailable: true,
      categoryId: 'entradas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'arancini',
      name: 'Arancini',
      description: 'Bolinho de risoto crocante com queijo e ervas.',
      price: 20.9,
      image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'entradas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'crostini-prosciutto',
      name: 'Crostini de Prosciutto',
      description: 'Pão tostado com prosciutto crocante e cream cheese.',
      price: 24.5,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'entradas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'caponata',
      name: 'Caponata',
      description: 'Entradinha de berinjela, tomate, azeitona e alho.',
      price: 19.8,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'entradas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'vinho-toscano',
      name: 'Vinho Toscano',
      description: 'Seleção premium de vinho tinto com notas de frutos vermelhos.',
      price: 29.9,
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/DFC_2432_A_single_green_wine_bottle_with_a_tree-themed_label_resting_on_concrete_ledge_beside_bamboo_blinds_and_trailing_plants.jpg',
      isAvailable: true,
      categoryId: 'bebidas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'chianti-classico',
      name: 'Chianti Classico',
      description: 'Tinto italiano elegante, com notas de cereja, ervas e final aveludado.',
      price: 64.9,
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Wine_Bottle_MET_62455.jpg',
      isAvailable: true,
      categoryId: 'bebidas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'pinot-grigio',
      name: 'Pinot Grigio delle Venezie',
      description: 'Branco fresco e delicado, perfeito para entradas e massas leves.',
      price: 59.9,
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Niepoort_1986_Colheita_Single_Vintage_Tawny_Port_Wine_%2815000030612%29.jpg',
      isAvailable: true,
      categoryId: 'bebidas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'prosecco-veneto',
      name: 'Prosecco Veneto',
      description: 'Espumante italiano leve e aromático para brindar à mesa.',
      price: 72.9,
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/DFC_2432_A_single_green_wine_bottle_with_a_tree-themed_label_resting_on_concrete_ledge_beside_bamboo_blinds_and_trailing_plants.jpg',
      isAvailable: true,
      categoryId: 'bebidas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'montepulciano-dabruzzo',
      name: 'Montepulciano d’Abruzzo',
      description: 'Tinto encorpado e gastronômico, com frutas maduras e especiarias.',
      price: 68.9,
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Niepoort_2000_Colheita_Port_%28Single_Vintage_Tawny_Port%29_%2820871220678%29.jpg',
      isAvailable: true,
      categoryId: 'bebidas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'limonada-italiana',
      name: 'Limonada Italiana',
      description: 'Refrescante limonada com hortelã e sabor cítrico intenso.',
      price: 12.5,
      image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'bebidas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'agua-com-gas',
      name: 'Água com Gás',
      description: 'Garrafa gelada para acompanhar a refeição.',
      price: 8.5,
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'bebidas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'coca-cola',
      name: 'Coca-Cola 600ml',
      description: 'Refrigerante de cola geladinho para acompanhar.',
      price: 9.5,
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Coca-cola_50cl_can_-_Italia.jpg',
      isAvailable: true,
      categoryId: 'bebidas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'guarana-antarctica',
      name: 'Guaraná Antarctica 600ml',
      description: 'Bebida energética e refrescante com sabor marcante.',
      price: 9.5,
      image: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Lata_de_Guaran%C3%A1_Antarctica.jpg',
      isAvailable: true,
      categoryId: 'bebidas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'fanta-laranja',
      name: 'Fanta Laranja 600ml',
      description: 'Refrigerante cítrico com sabor refrescante e vibrant.',
      price: 9.5,
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Fanta-Orange-Can-330ml_84177_%28711695088329%29.jpg',
      isAvailable: true,
      categoryId: 'bebidas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'tiramisu',
      name: 'Tiramisu',
      description: 'Clássico italiano com café, mascarpone e cacau.',
      price: 21.9,
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'sobremesas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'panna-cotta',
      name: 'Panna Cotta',
      description: 'Sobremesa cremosa com calda de frutas vermelhas.',
      price: 19.5,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'sobremesas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'cannoli',
      name: 'Cannoli',
      description: 'Casca crocante recheada com ricota e chocolate.',
      price: 18.5,
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'sobremesas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'pave-de-chocolate',
      name: 'Pavê de Chocolate',
      description: 'Camadas cremosa de chocolate com biscoitos e cacau.',
      price: 23.5,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'sobremesas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'torta-de-ricota',
      name: 'Torta de Ricota',
      description: 'Sobremesa clássica com massa fina e recheio de ricota.',
      price: 24.9,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'sobremesas',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'affogato',
      name: 'Affogato',
      description: 'Sorvete de baunilha com café espresso quentinho.',
      price: 18.9,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
      isAvailable: true,
      categoryId: 'sobremesas',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  orders: []
};

const sanitizeCatalogData = (database: PersistedDatabase): PersistedDatabase => {
  const uniqueCategories = new Map<string, Category>();

  for (const category of database.categories ?? []) {
    const name = category?.name?.trim();
    if (!name) continue;

    const key = name.toLowerCase();
    if (!uniqueCategories.has(key)) {
      uniqueCategories.set(key, {
        ...category,
        id: category.id || name.toLowerCase().replace(/\s+/g, '-'),
        name
      });
    }
  }

  const uniqueProducts = new Map<string, Product>();

  for (const product of database.products ?? []) {
    const name = product?.name?.trim();
    if (!name) continue;

    const defaultProduct = defaultDatabase.products.find((item) => item.id === product.id);
    const sourceImage = defaultProduct?.image ?? product.image;
    const normalizedImage = typeof sourceImage === 'string' && (sourceImage.startsWith('http') || sourceImage.startsWith('/')) ? sourceImage : 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80';
    const key = name.toLowerCase();
    if (!uniqueProducts.has(key)) {
      uniqueProducts.set(key, {
        ...product,
        id: product.id || name.toLowerCase().replace(/\s+/g, '-'),
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
    fs.writeFileSync(dbPath, JSON.stringify(defaultDatabase, null, 2), 'utf8');
    return defaultDatabase;
  }

  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    if (!raw.trim()) {
      fs.writeFileSync(dbPath, JSON.stringify(defaultDatabase, null, 2), 'utf8');
      return defaultDatabase;
    }

    const parsed = JSON.parse(raw) as PersistedDatabase;
    const normalized = sanitizeCatalogData(parsed);

    if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
      fs.writeFileSync(dbPath, JSON.stringify(normalized, null, 2), 'utf8');
    }

    return normalized;
  } catch {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDatabase, null, 2), 'utf8');
    return defaultDatabase;
  }
};

export const saveDatabase = (database: PersistedDatabase): void => {
  fs.writeFileSync(dbPath, JSON.stringify(sanitizeCatalogData(database), null, 2), 'utf8');
};
