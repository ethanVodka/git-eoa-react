import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DialogErrorState {
  open: boolean;
  messages: string[];
}

const initialState: DialogErrorState = {
  open: false,
  messages: [],
};

const dialogErrorSlice = createSlice({
  name: 'dialogError',
  initialState,
  reducers: {
    setOpenDialogDetail: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
    },
    closeDialogDetail: state => {
      state.open = false;
    },
    addError: (state, action: PayloadAction<string>) => {
      state.messages.push(action.payload);
    },
    reset: () => initialState,
  },
});

export const { setOpenDialogDetail, closeDialogDetail, addError, reset } = dialogErrorSlice.actions;
export default dialogErrorSlice.reducer;
