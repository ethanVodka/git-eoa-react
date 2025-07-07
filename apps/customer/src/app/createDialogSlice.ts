import {
    PayloadAction,
    SliceCaseReducers,
    createSlice,
} from "@reduxjs/toolkit";
import { SliceProps } from "./createListViewSlice";
import CoreConst from "constants/coreConst";

export interface DialogState<I> {
    item?: Partial<I>;
    open: boolean;
    isDirty?: boolean;
    changeFlag?: string; // 変更フラグ
}

/**
 * I is Item on table
 * S is State of slice
 * Reducers is SliceCaseReducers
 *
 * Create Generic DialogSlide
 * Export common reducer functions
 */
export const createDialogSlice = <
    I,
    S extends DialogState<I>,
    Reducers extends SliceCaseReducers<S>
>({
    name = "",
    initialState,
    reducers,
}: SliceProps<S, Reducers>) => {
    return createSlice({
        name,
        initialState,
        reducers: {
            toggleDialog: (state) => {
                return { ...state, open: !state.open };
            },
            /**
             * 初期表示/初期表示（更新）
             * @param state
             * @param action
             * @returns
             */
            init: (state, action: PayloadAction<I | undefined>) => {
                return { ...state, open: true, item: action.payload };
            },
            onClose: (state) => {
                return {
                    ...state,
                    item: undefined,
                    open: false,
                };
            },
            setIsDirty: (state, action: PayloadAction<boolean>) => {
                state.isDirty = action.payload;
            },
            setChangeFlag: (state) => ({
                ...state,
                changeFlag: CoreConst.FLG_Y,
            }),
            unSetChangeFlag: (state) => ({ ...state, changeFlag: undefined }),
            reset: () => initialState,
            ...reducers,
        },
    });
};
