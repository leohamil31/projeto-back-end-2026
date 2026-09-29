import { categories, persistCatalogData, products, syncCatalogData } from '../data/catalogData';
import { Category, Product } from '../types';
import { isSupabaseConfigured, supabaseData } from '../data/supabase';

const normalizeId = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const getCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured()) return supabaseData.listCategories();
  syncCatalogData();
  return categories;
};

export const createCategory = async (name: string, description: string): Promise<Category> => {
  if (isSupabaseConfigured()) return supabaseData.createCategory(name.trim(), description);
  const normalizedName = name.trim();
  const existingCategory = categories.find((category) => category.name.toLowerCase() === normalizedName.toLowerCase());

  if (existingCategory) {
    return existingCategory;
  }

  const category: Category = {
    id: normalizeId(normalizedName),
    name: normalizedName,
    description,
    createdAt: new Date().toISOString()
  };

  categories.push(category);
  persistCatalogData();
  return category;
};

export const getProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured()) return supabaseData.listProducts();
  syncCatalogData();
  return products;
};

export const getProductById = async (productId: string): Promise<Product | undefined> => {
  if (isSupabaseConfigured()) return supabaseData.getProductById(productId);
  return products.find((product) => product.id === productId);
};

export const createProduct = async (
  name: string,
  description: string,
  price: number,
  image: string,
  isAvailable: boolean,
  categoryId: string
): Promise<Product> => {
  if (isSupabaseConfigured()) {
    return supabaseData.createProduct({
      id: normalizeId(name), name: name.trim(), description, price, image, isAvailable, categoryId
    });
  }
  const normalizedName = name.trim();
  const existingProduct = products.find((product) => product.name.toLowerCase() === normalizedName.toLowerCase());

  if (existingProduct) {
    return existingProduct;
  }

  const product: Product = {
    id: normalizeId(normalizedName),
    name: normalizedName,
    description,
    price,
    image,
    isAvailable,
    categoryId,
    createdAt: new Date().toISOString()
  };

  products.push(product);
  persistCatalogData();
  return product;
};

export const updateProduct = async (
  productId: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<Product | undefined> => {
  if (isSupabaseConfigured()) return supabaseData.updateProduct(productId, data);
  const product = products.find((currentProduct) => currentProduct.id === productId);

  if (!product) {
    return undefined;
  }

  Object.assign(product, data);
  persistCatalogData();
  return product;
};
