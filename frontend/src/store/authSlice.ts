import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id?: string;
  email?: string;
  role?: string;
}
interface AuthState {
  accessToken: string | null; 
  user: User | null;
  isInitializing: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isInitializing: true,
  
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
    setInitializing(state, action: PayloadAction<boolean>) {
  state.isInitializing = action.payload;
}
  },
});

export const { setAccessToken, setUser, logout,setInitializing } = authSlice.actions;
export default authSlice.reducer;
