import React, { useEffect, useState } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import lange from "@i18n";
import LanguageIcon from "@mui/icons-material/Language";

function LangaugeSelect(props) {
    const [localeLang, setLocaleLang] = useState("");
    const { reloadCB } = props;

    useEffect(() => {
        let locale =
            window && localStorage && localStorage.getItem("local")
                ? localStorage.getItem("local")
                : "en";
        setLocaleLang(locale);
    }, []);

    const handleChange = (e) => {
        let value = e.target.value;
        setLocaleLang(value);
        localStorage.setItem("local", value);
        reloadCB ? reloadCB() : location.reload();
    };

    return (
        <div>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={localeLang}
                label={null}
                size="small"
                IconComponent={LanguageIcon}
                onChange={handleChange}
            >
                <MenuItem value={"en"}>{"English"}</MenuItem>
                <MenuItem value={"cn"}>
                    {"Simplified Chinese 简体中文"}
                </MenuItem>
                <MenuItem value={"tw"}>
                    {"Traditional Chinese 繁體中文"}
                </MenuItem>
                <MenuItem value={"kr"}>{"Korean 한글의 한글"}</MenuItem>
                <MenuItem value={"jp"}>{"Japanese 日本語"}</MenuItem>
                {/* <MenuItem value={'tc'}>{lange('tc')}</MenuItem> */}
            </Select>
        </div>
    );
}

export default LangaugeSelect;
