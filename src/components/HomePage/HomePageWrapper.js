import useUserProfileQuery from "../../hooks/useUserProfile";
import lange from "@i18n";
import {
    Box,
    Typography,
    Tabs,
    Tab
} from "@mui/material";
import { useRouter } from "next/router";
import { isMobile } from "react-device-detect";

const HomePageWrapper = ({ children, subPageValue = 0 }) => {
    const router = useRouter();

    const { data: user } = useUserProfileQuery();

    return (
        <Box mt={isMobile ? 0 : 3}>
            {!isMobile
                ? <Tabs value={subPageValue} aria-label="basic tabs example">
                    <Tab
                        label={lange("Dataroom")}
                        sx={{ typography: "body1" }}
                        onClick={() => router.push("/datarooms")}
                    />
                    {["Contract Manager", "Super Admin"].includes(
                        user?.platform_role
                    ) && (
                            <Tab
                                label={lange("Contract")}
                                sx={{ typography: "body1" }}
                                onClick={() => router.push("/contracts")}
                            />
                        )}
                    {"Super Admin" == user?.platform_role && (
                        <Tab
                            label={lange("Users")}
                            sx={{ typography: "body1" }}
                            onClick={() => router.push("/users")}
                        />
                    )}
                </Tabs>
                : <Typography variant="h3" textAlign="center" color="#458DF7">{lange("Dataroom")}</Typography>
        }

            {children}
        </Box>
    );
};

export default HomePageWrapper;
