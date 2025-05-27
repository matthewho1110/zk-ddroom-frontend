import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import { formatFileSize } from "../../utils/fileHelper";

function calculateValue(value) {
    return 2 ** value * 1024;
}

const StorageSlider = ({ value, onChange, ...inputProps }) => {
    return (
        <Box>
            <Typography id="non-linear-slider" gutterBottom>
                Storage: {formatFileSize(calculateValue(value), 0)}
            </Typography>
            <Slider
                value={value}
                min={5}
                step={1}
                max={32}
                fullWidth
                scale={calculateValue}
                getAriaValueText={formatFileSize}
                valueLabelFormat={formatFileSize}
                onChange={onChange}
                valueLabelDisplay="auto"
                aria-labelledby="non-linear-slider"
                {...inputProps}
            />
        </Box>
    );
};

export default StorageSlider;
