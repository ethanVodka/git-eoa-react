import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error' | undefined;

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: undefined,
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    snackbarHandleOpen: (state, action: PayloadAction<{ message: string; severity?: SnackbarSeverity }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity;
    },
    snackbarHandleClose: state => {
      state.open = false;
    },
  },
});

export const { snackbarHandleOpen, snackbarHandleClose } = snackbarSlice.actions;
export default snackbarSlice.reducer;
