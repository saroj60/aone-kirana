import { Product, ALL_PRODUCTS } from '../data/mockData';
import { getApiBaseUrl } from '../config/api';

/**
 * Fetch all products from MongoDB backend API
 */
export const fetchProductsFromDb = async (): Promise<Product[]> => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/products`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        localStorage.setItem('aone_kirana_products', JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend products API offline or unreachable, falling back to cached catalog:', err);
  }

  // Fallback to locally stored products or mock data
  try {
    const saved = localStorage.getItem('aone_kirana_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cached products:', e);
  }

  return ALL_PRODUCTS;
};

/**
 * Create a new product in MongoDB backend
 */
export const createProductInDb = async (product: Product): Promise<boolean> => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });

    if (res.ok) {
      const json = await res.json();
      return Boolean(json.success);
    }
    console.warn('Failed to create product in MongoDB, status:', res.status);
    return false;
  } catch (err) {
    console.error('Error creating product in MongoDB API:', err);
    return false;
  }
};

/**
 * Update an existing product in MongoDB backend
 */
export const updateProductInDb = async (product: Product): Promise<boolean> => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });

    if (res.ok) {
      const json = await res.json();
      return Boolean(json.success);
    }
    console.warn('Failed to update product in MongoDB, status:', res.status);
    return false;
  } catch (err) {
    console.error('Error updating product in MongoDB API:', err);
    return false;
  }
};

/**
 * Delete a product from MongoDB backend
 */
export const deleteProductFromDb = async (productId: string): Promise<boolean> => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/products/${productId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      const json = await res.json();
      return Boolean(json.success);
    }
    console.warn('Failed to delete product from MongoDB, status:', res.status);
    return false;
  } catch (err) {
    console.error('Error deleting product from MongoDB API:', err);
    return false;
  }
};

/**
 * Polling / subscriber stub to keep products fresh across devices
 */
export const subscribeToProductChanges = (onUpdate: (updatedProduct: Product) => void) => {
  return () => {};
};
