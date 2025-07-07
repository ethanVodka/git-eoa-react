import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HeaderState {
  isNeedReload: boolean;
}

const initialState: HeaderState = {
  isNeedReload: false,
};

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    setIsNeedReload: (state, action: PayloadAction<boolean>) => {
      state.isNeedReload = action.payload;
    },
  },
});

export const { setIsNeedReload } = headerSlice.actions;
export default headerSlice.reducer;
