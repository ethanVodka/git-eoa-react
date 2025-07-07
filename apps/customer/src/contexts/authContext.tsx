import React, {
    createContext,
    useEffect,
    useState,
    useContext,
    useCallback,
} from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { loginSuccess, AuthState } from "services/authService";
import { Roles, TMenu } from "constants/roleConstants";
import apiClient from "../apis/apiClient";

type AuthContextState = {
    loggedIn: boolean;
    roleName: string;
    role: string;
};

type AuthActions = {
    handleLogin: Function;
    handleLogout: Function;
    handleChangeRole: (role: TMenu) => void;
};

const AuthContext = createContext<Partial<AuthContextState & AuthActions>>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const { pathname, search } = useLocation();
    const [role, setRole] = useState<Roles>(Roles.TantouSha);
    // will be change
    const [roleName, setRoleName] = useState<string>("担当者");

    // const [loggedIn, setLoggedIn] = useState(() => checkLogin());
    const [loggedIn, setLoggedIn] = useState(true);

    useEffect(() => {
        if (!loggedIn) {
            navigate({
                pathname: "/login",
                search:
                    pathname !== "/"
                        ? createSearchParams({
                              from: `${pathname}${search}`,
                          }).toString()
                        : undefined,
            });
        }
    }, [loggedIn, navigate, pathname, search]);

    const handleLogin = (loginParams: AuthState) => {
        loginSuccess(loginParams);
        setLoggedIn(true);
    };

    const handleLogout = () => {
        apiClient.post("/api/logout", {}).then(() => {
            location.href = "/login";
        });
    };

    const handleChangeRole = useCallback((roleProps: TMenu) => {
        setRole(roleProps.role);
        setRoleName(roleProps.label);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                loggedIn,
                handleLogin,
                handleLogout,
                role,
                roleName,
                handleChangeRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
