import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id?: string;
  email?: string;
  role?: string;
}
interface AuthState {
  accessToken: string | null; // stores AuthResponse.token
  user: User | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    logout(state) {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { setAccessToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
