import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  token?: string;
  unauthorized?: boolean;
  userDetail?: unknown;
}

const initialState: AuthState = {};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | undefined>) => {
      state.token = action.payload;
    },
    setUnauthorized: state => {
      state.unauthorized = true;
    },
    setUserDetail: (state, action: PayloadAction<unknown>) => {
      state.userDetail = action.payload;
    },
    logout: () => initialState,
    logoutSuccess: () => initialState,
    setContext: (state, _action: PayloadAction<unknown>) => state,
  },
});

export const {
  setToken,
  setUnauthorized,
  setUserDetail,
  logout,
  logoutSuccess,
  setContext,
} = authSlice.actions;

export default authSlice.reducer;
