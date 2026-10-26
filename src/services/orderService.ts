import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order } from '../data/mockData';
import { getApiBaseUrl } from '../config/api';
import { realtimeService } from './realtimeService';

export interface CreateOrderPayload {
  items: Order['items'];
  subtotal: number;
  discount?: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryNotes?: string;
  customerPhone: string;
  customerName: string;
  customerEmail?: string;
  paymentMethod: Order['paymentMethod'];
  deliverySlot?: 'express' | 'evening';
  userId?: string | null;
}

export const createOrderInDb = async (payload: CreateOrderPayload): Promise<Order | null> => {
  // 1. Persist directly to Express / MongoDB backend
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail || '',
        deliveryAddress: payload.deliveryAddress,
        deliveryNotes: payload.deliveryNotes || '',
        deliverySlot: payload.deliverySlot || 'express',
        paymentMethod: payload.paymentMethod,
        items: payload.items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          unit: item.product.unit,
          image: item.product.image,
          quantity: item.quantity
        })),
        subtotal: payload.subtotal,
        discount: payload.discount || 0,
        deliveryFee: payload.deliveryFee,
        total: payload.total
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend order API not responding, falling back:', err);
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const orderId = `ord-${Date.now()}`;
  const orderNumber = `AK-${randomNum}`;

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    items: payload.items,
    subtotal: payload.subtotal,
    discount: payload.discount || 0,
    deliveryFee: payload.deliveryFee,
    total: payload.total,
    deliveryAddress: payload.deliveryAddress,
    customerPhone: payload.customerPhone,
    customerName: payload.customerName,
    paymentMethod: payload.paymentMethod,
    status: 'New',
    createdAt: new Date().toISOString()
  };

  if (!isSupabaseConfigured()) {
    return newOrder;
  }

  try {
    // 1. Insert order
    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      order_number: orderNumber,
      user_id: payload.userId || null,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      delivery_address: payload.deliveryAddress,
      delivery_slot: payload.deliverySlot || 'express',
      payment_method: payload.paymentMethod,
      payment_status: payload.paymentMethod === 'COD' ? 'Pending' : 'Paid',
      status: 'Placed',
      subtotal: payload.subtotal,
      delivery_fee: payload.deliveryFee,
      total: payload.total
    });

    if (orderError) {
      console.error('Supabase order insert error:', orderError.message);
      return newOrder;
    }

    // 2. Insert order items
    if (payload.items && payload.items.length > 0) {
      const itemsPayload = payload.items.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        unit: item.product.unit,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
      if (itemsError) {
        console.warn('Supabase order_items insert error:', itemsError.message);
      }
    }

    return newOrder;
  } catch (err) {
    console.error('Error placing order in Supabase:', err);
    return newOrder;
  }
};

export const fetchOrdersFromDb = async (userId?: string): Promise<Order[]> => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/orders`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch orders from backend, checking Supabase:', err);
  }

  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase fetch orders error:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row: any): Order => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      deliveryAddress: row.delivery_address,
      paymentMethod: row.payment_method,
      status: row.status,
      subtotal: Number(row.subtotal),
      deliveryFee: Number(row.delivery_fee),
      total: Number(row.total),
      createdAt: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riderName: row.rider_name || 'Bikash Shrestha',
      riderPhone: row.rider_phone || '9801987654',
      items: (row.order_items || []).map((i: any) => ({
        quantity: i.quantity,
        product: {
          id: i.product_id,
          name: i.product_name,
          unit: i.unit,
          price: Number(i.price),
          category: 'Essentials' as any,
          image: i.image || '',
          rating: 4.8,
          reviewsCount: 10,
          inStock: true,
          description: ''
        }
      }))
    }));
  } catch (err) {
    console.error('Error fetching orders from Supabase:', err);
    return [];
  }
};

export const updateOrderStatusInDb = async (orderId: string, status: Order['status']): Promise<boolean> => {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_jwt_signature`
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Backend update order status error:', err);
  }

  if (!isSupabaseConfigured()) return true;

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Supabase update order status error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error updating order status in Supabase:', err);
    return false;
  }
};

export const subscribeToLiveOrders = (
  onOrderChange: (order: Partial<Order> & { id: string }) => void,
  onNewOrder?: (order: any) => void
) => {
  // 1. Subscribe to Native Express Backend SSE Stream (Single Store & Live Dispatch)
  const unsubscribeRealtime = realtimeService.subscribe((msg) => {
    if (msg.type === 'ORDER_STATUS_CHANGED' && msg.payload) {
      onOrderChange({
        id: msg.payload.orderId || (msg.payload.order && msg.payload.order.id),
        status: msg.payload.status,
        riderName: msg.payload.order?.riderName,
        riderPhone: msg.payload.order?.riderPhone
      });
    } else if (msg.type === 'RIDER_ASSIGNED' && msg.payload) {
      onOrderChange({
        id: msg.payload.orderId,
        riderName: msg.payload.rider?.name,
        riderPhone: msg.payload.rider?.phone
      });
    } else if (msg.type === 'DELIVERY_STATUS_CHANGED' && msg.payload) {
      onOrderChange({
        id: msg.payload.orderNumber || msg.payload.deliveryId,
        status: msg.payload.status as any
      });
    } else if (msg.type === 'ORDER_CREATED' && msg.payload && onNewOrder) {
      onNewOrder(msg.payload);
    }
  });

  // 2. Fallback to Supabase if configured
  if (!isSupabaseConfigured()) {
    return unsubscribeRealtime;
  }

  const channel = supabase
    .channel('public:orders')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      payload => {
        if (payload.new) {
          onOrderChange({
            id: payload.new.id,
            status: payload.new.status,
            riderName: payload.new.rider_name,
            riderPhone: payload.new.rider_phone
          });
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      payload => {
        if (payload.new && onNewOrder) {
          onNewOrder(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    unsubscribeRealtime();
    supabase.removeChannel(channel);
  };
};
