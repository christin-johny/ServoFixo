import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Notification, NotificationState } from "../domain/types/Notification";
//   Fixed: Changed to relative path for better compatibility
import type { PaginatedNotifications } from "../infrastructure/repositories/technician/notificationRepository";

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      
      const exists = state.notifications.some(n => n.id === action.payload.id);
      if (!exists) {
        state.notifications = [action.payload, ...state.notifications];
        state.unreadCount += 1;
      }
    },
    setNotifications: (state, action: PayloadAction<PaginatedNotifications>) => {
      state.notifications = action.payload.notifications || [];
      state.unreadCount = action.payload.unreadCount || 0;
      state.loading = false;
    },
    markRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif && notif.status === "UNREAD") {
        notif.status = "READ";
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.notifications.forEach((n) => (n.status = "READ"));
      state.unreadCount = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { addNotification, setNotifications, markRead, markAllRead, setLoading, setError } = notificationSlice.actions;
export default notificationSlice.reducer;