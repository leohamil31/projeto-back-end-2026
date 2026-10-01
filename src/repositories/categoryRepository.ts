import { randomUUID } from 'node:crypto';
import { Category } from '../models/Category';
import { isSupabaseConfigured, requireSupabaseClient } from '../config/supabaseClient';
import { ensureDatabaseFile, saveDatabase } from '../config/localDatabase';

const mapCategory = (row: any): Category => ({
  id: row.id,
  name: row.name,
  description: row.description,
  createdAt: row.created_at
});

const findAllLocal = (): Category[] => ensureDatabaseFile().categories;

const persistLocal = (categories: Category[]): void => {
  const db = ensureDatabaseFile();
  saveDatabase({ ...db, categories });
};

export const categoryRepository = {
  async findAll(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await requireSupabaseClient().from('categories').select('*').order('name');
      if (error) throw error;
      return (data ?? []).map(mapCategory);
    }
    return findAllLocal();
  },

  async findById(id: string): Promise<Category | undefined> {
    if (isSupabaseConfigured()) {
      const { data, error } = await requireSupabaseClient().from('categories').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? mapCategory(data) : undefined;
    }
    return findAllLocal().find((category) => category.id === id);
  },

  async create(name: string, description: string): Promise<Category> {
    const trimmedName = name.trim();

    if (isSupabaseConfigured()) {
      const supabase = requireSupabaseClient();
      const { data: existing, error: existingError } = await supabase.from('categories').select('*').ilike('name', trimmedName).maybeSingle();
      if (existingError) throw existingError;
      if (existing) return mapCategory(existing);

      const { data, error } = await supabase.from('categories').insert({ id: randomUUID(), name: trimmedName, description }).select().single();
      if (error) throw error;
      return mapCategory(data);
    }

    const categories = findAllLocal();
    const existingCategory = categories.find((category) => category.name.toLowerCase() === trimmedName.toLowerCase());
    if (existingCategory) return existingCategory;

    const category: Category = {
      id: randomUUID(),
      name: trimmedName,
      description,
      createdAt: new Date().toISOString()
    };

    categories.push(category);
    persistLocal(categories);
    return category;
  },

  async update(id: string, changes: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category | undefined> {
    if (isSupabaseConfigured()) {
      const { data, error } = await requireSupabaseClient().from('categories').update(changes).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return data ? mapCategory(data) : undefined;
    }

    const categories = findAllLocal();
    const category = categories.find((current) => current.id === id);
    if (!category) return undefined;

    Object.assign(category, changes);
    persistLocal(categories);
    return category;
  },

  async remove(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error, count } = await requireSupabaseClient().from('categories').delete({ count: 'exact' }).eq('id', id);
      if (error) throw error;
      return Boolean(count);
    }

    const categories = findAllLocal();
    const index = categories.findIndex((category) => category.id === id);
    if (index === -1) return false;

    categories.splice(index, 1);
    persistLocal(categories);
    return true;
  }
};
