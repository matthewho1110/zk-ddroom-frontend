// import custom components
import { DataGrid } from "@mui/x-data-grid";
import DataroomFilters from "./DataroomFilters";
import ErrorPage from "../../reusableComponents/ErrorPage";
import CreateDataroomForm from "./CreateDataroomForm";

// MUI components
import LinearProgress from "@mui/material/LinearProgress";
import { Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import useUserProfileQuery from "../../../hooks/useUserProfile";
// import external modules
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// import custom hooks
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";

// import custom configs
import { ROLES } from "../../../configs/roleConfig";
import lange from "@i18n";

// import mui modules
import {
    Box,
    Button,
    Modal,
    Skeleton,
    Typography,
    Divider,
    Stack,
    Alert,
} from "@mui/material";
import DataroomsList from "../../reusableComponents/dataroom/DataroomsList";
import { isMobile } from "react-device-detect";

const STATUSES = {
    error: -1,
    loading: 0,
    loaded: 1,
};

function DataroomsPage() {
    // States
    const [filters, setFilters] = useState({});
    const [creationFormOpen, setCreationFormOpen] = useState(false);

    const { data } = useUserProfileQuery();

    return (
        <Stack id="container" direction="row" width="100%" py={0} spacing={3}>
            <Grid container spacing={3}>
                <Grid item xs={12} lg={3}>
                    <Stack
                        direction="column"
                        spacing={3}
                        mt={isMobile ? 0 : 3}
                        divider={<Divider orientation="horizontal" flexItem />}
                    >
                        {
                            // if user is admin, show create dataroom button
                            ["Super Admin", "Contract Manager"].includes(
                                data?.platform_role
                            ) && !isMobile && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setCreationFormOpen(true)}
                                    startIcon={<AddIcon />}
                                >
                                    {lange("Create", "Dataroom")}
                                </Button>
                            )
                        }

                        <DataroomFilters
                            onSubmit={(_filters) => setFilters(_filters)}
                        />
                    </Stack>
                </Grid>

                <Grid
                    item={!isMobile}
                    xs={12}
                    lg={9}
                    sx={{ height: "80vh", overflow: "hidden", paddingTop: isMobile && "15px", paddingLeft: isMobile && "24px" }}
                >
                    <DataroomsList filters={filters} />
                </Grid>
            </Grid>

            <Modal open={creationFormOpen}>
                <CreateDataroomForm
                    onClose={() => setCreationFormOpen(false)}
                />
            </Modal>
        </Stack>
    );
}

export default DataroomsPage;
