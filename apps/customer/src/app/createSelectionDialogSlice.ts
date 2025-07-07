import {
    PayloadAction,
    SliceCaseReducers,
    createSlice,
} from "@reduxjs/toolkit";
import { MetaParams, metaParamsDefault } from "constants/requestConstants";
import { Row } from "model/IRow";
import { SliceProps } from "./createListViewSlice";
import { FIRST_PAGE } from "constants/tableConstants";

export interface SelectDialogState<I, C> {
    items?: I[];
    open?: boolean;
    conditions?: C;
    defaultValues?: C;
}

/**
 * C is Conditions on form search
 * I is Item on table
 * S is State of slice
 * Reducers is SliceCaseReducers
 *
 * Create Generic SelectionDialogSlice
 * Export common reducer functions
 */
const createSelectionDialogSlice = <
    C extends MetaParams,
    I extends Row,
    S extends SelectDialogState<I, C>,
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
            onClose: (state) => {
                return {
                    ...state,
                    items: undefined,
                    open: false,
                };
            },
            /**
             * 初期表示
             * @param state
             * @param action
             * @returns
             */
            init: (state, action: PayloadAction<I[] | undefined>) => {
                return { ...state, open: true, items: action.payload };
            },
            setItems: (state, action: PayloadAction<I[]>) => {
                return { ...state, items: action.payload };
            },
            setConditions: (state, action: PayloadAction<C>) => {
                const pageSize =
                    state.conditions?.pageSize || metaParamsDefault.pageSize;
                return {
                    ...state,
                    conditions: {
                        ...action.payload,
                        ...metaParamsDefault,
                        pageSize,
                    },
                };
            },
            setOrderBy: (state, action: PayloadAction<string | undefined>) => {
                return {
                    ...state,
                    conditions: {
                        ...state.conditions,
                        orderBy: action?.payload,
                    },
                };
            },
            setDirection: (
                state,
                action: PayloadAction<string | undefined>
            ) => {
                return {
                    ...state,
                    conditions: {
                        ...state.conditions,
                        direction: action?.payload,
                    },
                };
            },
            setPage: (state, action: PayloadAction<C>) => {
                return {
                    ...state,
                    conditions: {
                        ...action.payload,
                        pageSize: state.conditions?.pageSize,
                        orderBy: state.conditions?.orderBy,
                        direction: state.conditions?.direction,
                    },
                };
            },
            setPageSize: (state, action: PayloadAction<C>) => {
                const orderBy = state.conditions?.orderBy;
                const direction = state.conditions?.direction;
                return {
                    ...state,
                    conditions: {
                        ...action.payload,
                        page: FIRST_PAGE,
                        orderBy,
                        direction,
                    },
                };
            },
            setSort: (state, action: PayloadAction<C>) => {
                const pageSize =
                    state.conditions?.pageSize || metaParamsDefault.pageSize;
                return {
                    ...state,
                    conditions: {
                        ...action.payload,
                        ...metaParamsDefault,
                        pageSize,
                    },
                };
            },
            setDefaultValues: (state, action: PayloadAction<C>) => {
                return { ...state, defaultValues: action.payload };
            },
            resetDefaultValues: (state) => {
                state.defaultValues = undefined;
            },
            reset: () => initialState,
            ...reducers,
        },
    });
};

export default createSelectionDialogSlice;
