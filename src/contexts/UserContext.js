import jwt_decode from "jwt-decode";
import { useRouter } from "next/router";
import useAlert from "../hooks/useAlert";
import { createContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosInstance } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";

const INITIAL_STATE = {};

const UserContext = createContext({
    axiosInstance: AxiosInstance,
    login: () => {},
    logout: () => {},
    isLoggedIn: false,
    rememberMe: false,
    changeRememberMe: () => {},
});

export const UserProvider = ({ children }) => {
    const router = useRouter();
    const { setAlert } = useAlert();
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [rememberMe, setRememberMe] = useState(null);

    const queryClient = useQueryClient();

    useEffect(() => {
        if (window && localStorage) {
            setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");

            setRememberMe(localStorage.getItem("rememberMe") === "true");
        }
    }, []);

    const axiosInstance = axios.create({
        // Make sure not to use this to call external APIs because it contains users access token
        // Might create a separate axios instance for external APIs (e.g. S3 upload)
        // *** Do This Later ***
        withCredentials: true,
        baseURL: process.env.BACKEND_URI,
        responseType: "json",
    });

    const refreshAuthLogic = async (failedRequest) => {
        return axios
            .post(
                `${process.env.BACKEND_URI}/auth/refreshToken`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        "content-type": "application/json",
                    },
                    responseType: "json",
                }
            )
            .then((tokenRefreshResponse) => {
                // console.log(tokenRefreshResponse);
            })
            .catch((err) => {
                if (err.response?.status === 401) {
                    // Refresh token is invalid or expired
                    setAlert(
                        "Your session has expired. Please login again",
                        "warning"
                    );
                    logout();
                }
            });
    };

    createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
        statusCodes: [401],
    });

    const logout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem("isLoggedIn");
        router.push("/login");
        axiosInstance.post("auth/logout");
        queryClient.clear();
    };

    const login = () => {
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", true);
    };

    const changeRememberMe = (newValue) => {
        setRememberMe(newValue);
        localStorage.setItem("rememberMe", newValue);
    };

    return (
        <UserContext.Provider
            value={{
                axiosInstance,
                login,
                logout,
                isLoggedIn,
                rememberMe,
                changeRememberMe,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
