import { randomUUID } from 'node:crypto';
import { Product } from '../models/Product';
import { isSupabaseConfigured, requireSupabaseClient } from '../config/supabaseClient';
import { ensureDatabaseFile, saveDatabase } from '../config/localDatabase';

const mapProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  image: row.image,
  isAvailable: row.is_available,
  categoryId: row.category_id,
  createdAt: row.created_at
});

const findAllLocal = (): Product[] => ensureDatabaseFile().products;

const persistLocal = (products: Product[]): void => {
  const db = ensureDatabaseFile();
  saveDatabase({ ...db, products });
};

export const productRepository = {
  async findAll(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await requireSupabaseClient().from('products').select('*').order('name');
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    }
    return findAllLocal();
  },

  async findById(id: string): Promise<Product | undefined> {
    if (isSupabaseConfigured()) {
      const { data, error } = await requireSupabaseClient().from('products').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? mapProduct(data) : undefined;
    }
    return findAllLocal().find((product) => product.id === id);
  },

  async create(input: {
    name: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
    categoryId: string;
  }): Promise<Product> {
    const name = input.name.trim();

    if (isSupabaseConfigured()) {
      const supabase = requireSupabaseClient();
      const { data: existing, error: existingError } = await supabase.from('products').select('*').ilike('name', name).maybeSingle();
      if (existingError) throw existingError;
      if (existing) return mapProduct(existing);

      const { data, error } = await supabase.from('products').insert({
        id: randomUUID(),
        name,
        description: input.description,
        price: input.price,
        image: input.image,
        is_available: input.isAvailable,
        category_id: input.categoryId
      }).select().single();
      if (error) throw error;
      return mapProduct(data);
    }

    const products = findAllLocal();
    const existingProduct = products.find((product) => product.name.toLowerCase() === name.toLowerCase());
    if (existingProduct) return existingProduct;

    const product: Product = {
      id: randomUUID(),
      name,
      description: input.description,
      price: input.price,
      image: input.image,
      isAvailable: input.isAvailable,
      categoryId: input.categoryId,
      createdAt: new Date().toISOString()
    };

    products.push(product);
    persistLocal(products);
    return product;
  },

  async update(id: string, changes: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product | undefined> {
    if (isSupabaseConfigured()) {
      const payload: Record<string, unknown> = { ...changes };
      if ('isAvailable' in changes) {
        payload.is_available = changes.isAvailable;
        delete payload.isAvailable;
      }
      if ('categoryId' in changes) {
        payload.category_id = changes.categoryId;
        delete payload.categoryId;
      }
      const { data, error } = await requireSupabaseClient().from('products').update(payload).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return data ? mapProduct(data) : undefined;
    }

    const products = findAllLocal();
    const product = products.find((current) => current.id === id);
    if (!product) return undefined;

    Object.assign(product, changes);
    persistLocal(products);
    return product;
  },

  async remove(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error, count } = await requireSupabaseClient().from('products').delete({ count: 'exact' }).eq('id', id);
      if (error) throw error;
      return Boolean(count);
    }

    const products = findAllLocal();
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) return false;

    products.splice(index, 1);
    persistLocal(products);
    return true;
  }
};
