import {
    PayloadAction,
    SliceCaseReducers,
    ValidateSliceCaseReducers,
    createSlice,
} from "@reduxjs/toolkit";
import { MetaParams, metaParamsDefault } from "constants/requestConstants";
import { FIRST_PAGE } from "constants/tableConstants";
import { Row } from "model/IRow";

export interface PageState<C> {
    itemsSelected?: Row[];
    conditions?: C;
}

export interface SliceProps<S, Reducers extends SliceCaseReducers<S>> {
    name: string;
    initialState: S;
    reducers: ValidateSliceCaseReducers<S, Reducers>;
}
/**
 * C is Conditions on form search
 * I is Item on table
 * S is State of slice
 * Reducers is SliceCaseReducers
 *
 * Create Generic PageSlide
 * Export common reducer functions
 */
const createListViewSlice = <
    C extends MetaParams,
    I extends Row,
    S extends PageState<C>,
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
                    itemsSelected: undefined,
                };
            },
            setPage: (state, action: PayloadAction<C>) => {
                return {
                    ...state,
                    itemsSelected: [],
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
                    itemsSelected: [],
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
                    itemsSelected: [],
                    conditions: {
                        ...action.payload,
                        ...metaParamsDefault,
                        pageSize,
                    },
                };
            },
            //Todo Start will be deleted
            setOrderBy: (state, action: PayloadAction<string | undefined>) => {
                return {
                    ...state,
                    itemsSelected: [],
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
                    itemsSelected: [],
                    conditions: {
                        ...state.conditions,
                        direction: action?.payload,
                    },
                };
            },
            //Todo End will be deleted
            setItemsSelected: (state, action: PayloadAction<I[]>) => {
                return { ...state, itemsSelected: action.payload };
            },
            reset: () => initialState,
            ...reducers,
        },
    });
};

export default createListViewSlice;
