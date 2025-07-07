import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PageMessageAreaState {
  message?: string;
}

const initialState: PageMessageAreaState = {
  message: undefined,
};

const pageMessageAreaSlice = createSlice({
  name: 'pageMessageArea',
  initialState,
  reducers: {
    setPageErrorMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    resetPageErrorMessage: state => {
      state.message = undefined;
    },
  },
});

export const { setPageErrorMessage, resetPageErrorMessage } = pageMessageAreaSlice.actions;
export default pageMessageAreaSlice.reducer;
