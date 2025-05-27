import { Box, Button } from "@mui/material";

import { getAncestorPaths } from "../../../utils/fileHelper";
import lange from "@i18n";

const Ancestry = ({ path, onAncestorClick, highlightLast = false }) => {
    const ancestors = getAncestorPaths(path);
    return (
        <Box display="flex" flexDirection="row" flexWrap="nowrap">
            {ancestors.map((ancestor, index) => {
                return (
                    <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        flexWrap="nowrap"
                        whiteSpace={"nowrap"}
                        key={ancestor}
                        sx={{ typography: "body1" }}
                    >
                        <Button
                            onClick={() => {
                                onAncestorClick(ancestor);
                            }}
                            sx={{
                                color:
                                    highlightLast &&
                                    index == ancestors.length - 1
                                        ? "primary.main"
                                        : "black",
                                minWidth: 0,
                                fontSize:
                                    highlightLast &&
                                    index == ancestors.length - 1
                                        ? "1.4em"
                                        : "1.2em",
                                textTransform: "none",
                            }}
                        >
                            {index === 0 && ancestor === "/root"
                                ? lange("All_Folder")
                                : ancestors[index].split("/").pop()}
                        </Button>
                        {
                            // Do not show "/" after the last ancestor
                            index !== ancestors.length - 1 && (
                                <Box py="6px" fontSize="0.8125rem">
                                    {"/"}
                                </Box>
                            )
                        }
                    </Box>
                );
            })}
        </Box>
    );
};

export default Ancestry;
