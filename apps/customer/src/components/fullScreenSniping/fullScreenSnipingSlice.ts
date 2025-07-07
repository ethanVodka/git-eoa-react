import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FullScreenSnipingState {
  loading: boolean;
}

const initialState: FullScreenSnipingState = {
  loading: false,
};

const fullScreenSnipingSlice = createSlice({
  name: 'fullScreenSniping',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setLoading } = fullScreenSnipingSlice.actions;
export default fullScreenSnipingSlice.reducer;
