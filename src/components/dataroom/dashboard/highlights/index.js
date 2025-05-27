import { useState, memo } from "react";
import { Box, Grid, Tabs, Tab, Button } from "@mui/material";
import TopViewersBarChart from "./TopViewersBarChart";
import TopCollectorsBarChart from "./TopCollectorsBarChart";
import GroupDisbributionPieChart from "./GroupDisbributionPieChart";
import lange from "@i18n";
import { isMobile } from "react-device-detect";

const PERIODS = {
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
};

const Highlights = ({ dataroomId, includeAdmin, startTime, endTime }) => {
    const [period, setPeriod] = useState(PERIODS.WEEK);
    const handlePeriodChange = (event, newPeriod) => {
        setPeriod(newPeriod);
    };
    return (
        <Box marginTop={isMobile ? "15px" : 5}>
            <Box
                display="none"
                justifyContent="center"
                width="100%"
                marginBottom={5}
            >
                <Tabs
                    value={period}
                    onChange={handlePeriodChange}
                    aria-label="change period"
                    TabIndicatorProps={{
                        style: { display: "none" },
                    }}
                >
                    <Tab value={PERIODS.DAY} label={"day"} disableRipple />
                    <Tab value={PERIODS.WEEK} label={"week"} disableRipple />
                    <Tab value={PERIODS.MONTH} label={"month"} disableRipple />
                </Tabs>
            </Box>
            <Box display="none" width="100%">
                <Button variant="contained" sx={{ ml: "auto" }} disabled>
                    {" "}
                    {lange("Export_To_Csv")}
                </Button>
            </Box>

            <Grid container rowSpacing={isMobile ? 0 : 12} columnSpacing={isMobile ? 0 : 6} justify="center">
                <Grid item xs={12} md={12} lg={6}>
                    <TopViewersBarChart
                        dataroomId={dataroomId}
                        includeAdmin={includeAdmin}
                        startTime={startTime}
                        endTime={endTime}
                    />
                </Grid>
                <Grid item xs={12} md={12} lg={6}>
                    <TopCollectorsBarChart
                        dataroomId={dataroomId}
                        includeAdmin={includeAdmin}
                        startTime={startTime}
                        endTime={endTime}
                    />
                </Grid>
                <Grid item xs={12} md={12} lg={6}>
                    <GroupDisbributionPieChart
                        dataroomId={dataroomId}
                        includeAdmin={includeAdmin}
                        title={
                            lange("View_Time_Distribution") +
                            " - " +
                            lange("Group")
                        }
                        field="viewTime"
                        label="View Time (min)"
                        startTime={startTime}
                        endTime={endTime}
                    />
                </Grid>
                <Grid item xs={12} md={12} lg={6}>
                    <GroupDisbributionPieChart
                        dataroomId={dataroomId}
                        includeAdmin={includeAdmin}
                        title={
                            lange("Downloads_Distribution") +
                            " - " +
                            lange("Group")
                        }
                        field="downloads"
                        label="Download"
                        startTime={startTime}
                        endTime={endTime}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};
export default memo(Highlights);
export { TopCollectorsBarChart, TopViewersBarChart, GroupDisbributionPieChart };
