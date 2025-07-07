import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store";

interface IFocusSlice {
    isFocus?: boolean;
}

const initialState: IFocusSlice = {
    isFocus: false,
};

const focusSlice = createSlice({
    name: "focus",
    initialState,
    reducers: {
        setIsFocus: (state, action: PayloadAction<boolean>) => {
            state.isFocus = action.payload;
        },
    },
});
export const { setIsFocus } = focusSlice.actions;

export const selectIsFocus = (state: RootState) => state.focus.isFocus;

export default focusSlice.reducer;
