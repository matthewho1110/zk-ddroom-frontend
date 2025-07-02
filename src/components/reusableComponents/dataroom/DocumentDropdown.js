import { memo } from "react";

import styled from "@emotion/styled";
import { Box, FormControl, MenuItem, TextField } from "@mui/material";

const StyledSelect = styled(TextField)({});

function DocumentDropdown({
    documents,
    onSelect,
    selectedDocument,
    label,
    sx,
}) {
    return (
        <StyledSelect
            id="document-select"
            value={selectedDocument}
            label={label}
            select
            fullWidth
            InputLabelProps={{
                shrink: true,
            }}
            sx={sx}
        >
            {documents.map((document) => (
                <MenuItem
                    key={document}
                    value={document}
                    onClick={() => {
                        onSelect(document);
                    }}
                >
                    {document}
                </MenuItem>
            ))}
        </StyledSelect>
    );
}

export default memo(DocumentDropdown);
