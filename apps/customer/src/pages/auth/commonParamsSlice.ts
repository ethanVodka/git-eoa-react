import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommonParamsState {
  commonParams: Record<string, unknown>;
}

const initialState: CommonParamsState = {
  commonParams: {},
};

const commonParamsSlice = createSlice({
  name: 'commonParams',
  initialState,
  reducers: {
    setCommonParams: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.commonParams = action.payload;
    },
    resetCommonParams: () => initialState,
  },
});

export const { setCommonParams, resetCommonParams } = commonParamsSlice.actions;
export default commonParamsSlice.reducer;
