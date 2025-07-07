import React, { createContext, useState, useContext, useCallback } from "react";
import { BreadcrumbComponentProps } from "use-react-router-breadcrumbs";

type BreadcrumbKey = "resourceName" | "subResourceName";

type GlobalState = {
    breadcrumbs: { [name in BreadcrumbKey]?: string };
};

type GlobalActions = {
    changeBreadcrumbs: (breadcrumbs: GlobalState["breadcrumbs"]) => void;
    resetBreadcrumbs: () => void;
};

const GlobalContext = createContext<GlobalState & GlobalActions>({
    breadcrumbs: {},
    changeBreadcrumbs: () => {},
    resetBreadcrumbs: () => {},
});

type Props = React.PropsWithChildren<{}>;

export const GlobalProvider = ({ children }: Props) => {
    const [breadcrumbs, setBreadcrumbs] = useState<GlobalState["breadcrumbs"]>(
        {}
    );

    const changeBreadcrumbs = useCallback(
        (newBreadcrumbs: GlobalState["breadcrumbs"]) =>
            setBreadcrumbs((prevBreadcrumbs) => ({
                ...prevBreadcrumbs,
                ...newBreadcrumbs,
            })),
        []
    );

    const resetBreadcrumbs = useCallback(() => setBreadcrumbs({}), []);

    return (
        <GlobalContext.Provider
            value={{
                breadcrumbs,
                changeBreadcrumbs,
                resetBreadcrumbs,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => useContext(GlobalContext);

export type GlobalBreadcrumbProps = {
    breadcrumbKey?: BreadcrumbKey;
};

export const GlobalBreadcrumb = ({
    breadcrumbKey = "resourceName",
}: GlobalBreadcrumbProps & BreadcrumbComponentProps) => {
    const { breadcrumbs } = useGlobal();
    return <span>{breadcrumbs[breadcrumbKey]}</span>;
};

export default GlobalContext;
