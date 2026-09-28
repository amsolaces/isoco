import { create } from "zustand";

export interface AdminNotification {
  id: string;
  type: "sale" | "waitlist" | "order" | "inventory" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  admin_email: string;
}

interface AdminState {
  user: any | null;
  role: "super_admin" | "admin" | null;
  notifications: AdminNotification[];
  activities: ActivityLog[];
  setUser: (user: any) => void;
  setRole: (role: "super_admin" | "admin" | null) => void;
  addNotification: (notification: Omit<AdminNotification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  logActivity: (action: string, details: string, email: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  role: null,
  notifications: [
    {
      id: "init-1",
      type: "system",
      title: "System Online",
      message: "DRIPEGO Administrative control panel initialised.",
      timestamp: new Date(),
      read: false,
    },
    {
      id: "init-2",
      type: "inventory",
      title: "Low Stock Alert",
      message: "Oversized Tee (Black, M) stock is below 5 units.",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: false,
    }
  ],
  activities: [],

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          read: false,
        },
        ...state.notifications,
      ],
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  clearNotifications: () => set({ notifications: [] }),

  logActivity: (action, details, email) =>
    set((state) => ({
      activities: [
        {
          id: Math.random().toString(36).substring(2, 9),
          action,
          details,
          timestamp: new Date(),
          admin_email: email,
        },
        ...state.activities,
      ],
    })),
}));
