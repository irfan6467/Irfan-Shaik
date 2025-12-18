import { User, SavedDesign, Order, CustomizationState } from '../types';

/**
 * DATA SERVICE LAYER
 * Switches between LocalStorage (Mock) and Real MongoDB API.
 * Set USE_REAL_API to true when your backend/server.js is running.
 */

const USE_REAL_API = false; // TOGGLE THIS TO TRUE TO USE MONGODB
const API_URL = 'http://localhost:5000/api';

const DB_KEYS = {
  USERS: 'custemo_users',
  DESIGNS: 'custemo_designs',
  ORDERS: 'custemo_orders',
  SESSION: 'custemo_session'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- INITIALIZATION (Mock Data) ---
const seedDatabase = () => {
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    const admin: User = {
      id: 'admin_01',
      email: 'admin@custemo.com',
      name: 'Admin User',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    };
    const demoUser: User = {
      id: 'user_01',
      email: 'demo@custemo.com',
      name: 'Demo User',
      role: 'customer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
    };
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify([admin, demoUser]));
  }
  if (!localStorage.getItem(DB_KEYS.DESIGNS)) localStorage.setItem(DB_KEYS.DESIGNS, JSON.stringify([]));
  if (!localStorage.getItem(DB_KEYS.ORDERS)) localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
};

if (!USE_REAL_API) seedDatabase();

// --- AUTHENTICATION ---

export const mockAuth = {
  login: async (email: string): Promise<User | null> => {
    if (USE_REAL_API) {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!res.ok) return null;
            const user = await res.json();
            localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
            return user;
        } catch (e) {
            console.error("API Error", e);
            return null;
        }
    }

    // Mock Implementation
    await delay(800);
    const users: User[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const user = users.find(u => u.email === email);
    if (user) {
        localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
        return user;
    }
    return null;
  },

  register: async (email: string, name: string): Promise<User> => {
    if (USE_REAL_API) {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name })
        });
        const newUser = await res.json();
        localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(newUser));
        return newUser;
    }

    // Mock Implementation
    await delay(800);
    const users: User[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role: 'customer',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(newUser));
    return newUser;
  },

  logout: async () => {
      await delay(200);
      localStorage.removeItem(DB_KEYS.SESSION);
  },

  getCurrentUser: (): User | null => {
      const session = localStorage.getItem(DB_KEYS.SESSION);
      return session ? JSON.parse(session) : null;
  }
};

// --- DATA ACCESS ---

export const mockDB = {
  // DESIGNS
  saveDesign: async (userId: string, state: CustomizationState, name: string, previewImage?: string): Promise<SavedDesign> => {
      if (USE_REAL_API) {
          const res = await fetch(`${API_URL}/designs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, state, name, previewImage })
          });
          return await res.json();
      }

      // Mock
      await delay(600);
      const designs: SavedDesign[] = JSON.parse(localStorage.getItem(DB_KEYS.DESIGNS) || '[]');
      const newDesign: SavedDesign = {
          id: `design_${Date.now()}`,
          userId,
          name,
          state,
          previewImage,
          createdAt: Date.now()
      };
      designs.push(newDesign);
      localStorage.setItem(DB_KEYS.DESIGNS, JSON.stringify(designs));
      return newDesign;
  },

  getUserDesigns: async (userId: string): Promise<SavedDesign[]> => {
      if (USE_REAL_API) {
          const res = await fetch(`${API_URL}/designs/${userId}`);
          return await res.json();
      }

      // Mock
      await delay(400);
      const designs: SavedDesign[] = JSON.parse(localStorage.getItem(DB_KEYS.DESIGNS) || '[]');
      return designs.filter(d => d.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  },

  getAllDesigns: async (): Promise<SavedDesign[]> => {
      if (USE_REAL_API) {
          const res = await fetch(`${API_URL}/admin/designs`);
          return await res.json();
      }

      // Mock
      await delay(400);
      const designs: SavedDesign[] = JSON.parse(localStorage.getItem(DB_KEYS.DESIGNS) || '[]');
      return designs.sort((a, b) => b.createdAt - a.createdAt);
  },

  // ORDERS
  createOrder: async (userId: string, items: SavedDesign[], totalAmount: number, shippingAddress: any): Promise<Order> => {
      if (USE_REAL_API) {
          const res = await fetch(`${API_URL}/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, items, totalAmount, shippingAddress })
          });
          return await res.json();
      }

      // Mock
      await delay(1000);
      const orders: Order[] = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
      const newOrder: Order = {
          id: `ord_${Date.now()}`,
          userId,
          items,
          totalAmount,
          status: 'pending',
          createdAt: Date.now(),
          shippingAddress
      };
      orders.push(newOrder);
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
      return newOrder;
  },

  getOrders: async (isAdmin: boolean, userId?: string): Promise<Order[]> => {
      if (USE_REAL_API) {
          const endpoint = isAdmin ? `${API_URL}/admin/orders` : `${API_URL}/orders/${userId}`;
          const res = await fetch(endpoint);
          return await res.json();
      }

      // Mock
      await delay(500);
      const orders: Order[] = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
      if (isAdmin) {
          return orders.sort((a, b) => b.createdAt - a.createdAt);
      }
      return orders.filter(o => o.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }
};