import { Category, Product } from '../types';
import { ensureDatabaseFile, saveDatabase } from './database';

const database = ensureDatabaseFile();

export let categories: Category[] = database.categories;
export let products: Product[] = database.products;

export const syncCatalogData = (): void => {
  const currentDatabase = ensureDatabaseFile();
  categories = currentDatabase.categories;
  products = currentDatabase.products;
};

export const persistCatalogData = (): void => {
  const currentDatabase = ensureDatabaseFile();
  saveDatabase({
    categories,
    products,
    orders: currentDatabase.orders
  });
  syncCatalogData();
};
