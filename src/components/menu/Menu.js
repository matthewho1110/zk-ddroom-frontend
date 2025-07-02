import {
  Box,
  Divider,
  IconButton,
  List,
  Toolbar,
  Typography,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Switch,
  Stack,
} from "@mui/material";

import useSWR from "swr";

import { memo, useState, useEffect } from "react";

import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

// import styled
import LogoutIcon from "@mui/icons-material/Logout";
import { styled } from "@mui/material/styles";

import routes from "../../configs/routes/routes";
import CollapseMenuItem from "./CollapseMenuItem";
import MenuItem from "./MenuItem";

import { useRouter } from "next/router";
import useUser from "../../hooks/useUser";
import useAlert from "../../hooks/useAlert";
import lange from "@i18n";

import StorageCard from "../reusableComponents/dataroom/StorageCard";
import { ROLES } from "../../configs/roleConfig";
import { isMobile } from "react-device-detect";
import { set } from "lodash";
import { ConnectableObservable } from "rxjs";

const INITIAL_MENU = {
  dataroom: {
    name: null,
    coverImageUri: null,
    group: null,
  },
  collapsedTabs: [],
};

const Menu = ({
  scrolled,
  dataroomId,
  onCollapse,
  open,
  handleChatBotOpen,
  isChatOpen,
}) => {
  const router = useRouter();
  const { setAlert } = useAlert();
  const [menu, setMenu] = useState(INITIAL_MENU);
  // const [] = useState

  const { axiosInstance } = useUser();

  const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

  const { data: dataroomData } = useSWR(
    dataroomId ? `/datarooms/${dataroomId}` : null,
    fetcher
  );

  const { data: usedStorage } = useSWR(
    dataroomId ? `/datarooms/${dataroomId}/size` : null,
    fetcher
  );

  const me = dataroomData;

  const dataroom = dataroomData?.dataroom;

  const [checkedAI, setCheckedAI] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleChange = async (event) => {
    setChatOpen(event.target.checked);
    handleChatBotOpen(event.target.checked);
  };

  const isSuper = me?.role === "Super Admin";

  const leaveDataroom = () => {
    router.push("/datarooms");
  };

  useEffect(() => {
    setCheckedAI(me?.chatOpen);
    setChatOpen(isChatOpen);
  }, [me, isChatOpen]);

  return (
    <Box
      backgroundColor="primary.main"
      zIndex={99}
      pt={"90px"}
      boxShadow={3}
      height="100%"
      sx={
        {
          // overflowY: "hidden",
          // "&:hover": {
          //     overflowY: "auto",
          // },
        }
      }
    >
      <List
        sx={{
          paddingTop: 0,
          paddingBottom: "5rem",
          backgroundColor: "inherit",
        }}
      >
        <Box
          sx={{
            paddingX: "18px",
            display: "flex",
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            width="100%"
            justifyContent={open ? "space-between" : "end"}
            marginBottom={2}
            height="auto" // Adjust height to fit wrapped text
            alignItems="center"
          >
            {open && (
              <Typography
                variant="h1"
                sx={{
                  color: "white",
                  py: "5px",
                  fontWeight: 600,
                  fontSize: "1.1rem !important",
                  lineHeight: isMobile ? "2" : "1.5",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "80%", //
                }}
                title={dataroom?.name}
              >
                {dataroom?.name}
                {/* {dataroom?.name?.length > 15
                                    ? dataroom?.name?.substring(0, 15) + "..."
                                    : dataroom?.name} */}
              </Typography>
            )}

            <IconButton onClick={onCollapse} aria-label="open drawer">
              <MenuIcon sx={{ color: "white" }} />
            </IconButton>
          </Stack>
        </Box>

        {routes(dataroomId).map((route, index) =>
          route.child ? (
            <CollapseMenuItem
              item={route}
              key={index}
              onCollapse={onCollapse}
              menuOpen={open}
              role={me?.role}
            />
          ) : (
            <MenuItem
              item={route}
              key={index}
              role={me?.role}
              onCollapse={onCollapse}
              menuOpen={open}
            />
          )
        )}
        {open && checkedAI && (
          <ListItemButton
            sx={{
              paddingY: "5px",
              paddingX: "18px",
              color: "white",
              backgroundColor: "primary.main",
            }}
          >
            {open && (
              <ListItemIcon
                sx={{
                  color: "white",
                  minWidth: isMobile ? "36px" : "56px",
                }}
              >
                <SmartToyOutlinedIcon></SmartToyOutlinedIcon>
              </ListItemIcon>
            )}
            <ListItemText>
              <Typography variant="h6">Zk-group Wiki</Typography>
            </ListItemText>
            <Switch
              checked={chatOpen}
              onChange={handleChange}
              color="warning"
            />
          </ListItemButton>
        )}
        {ROLES[me?.role]?.canUploadFiles == true &&
          ROLES[me?.role]?.showDataroomStorage == true &&
          open && (
            <Box
              sx={{
                width: "100%",
              }}
            >
              <StorageCard
                usedStorage={usedStorage?.size}
                maxStorage={dataroom?.maxStorage}
              />
            </Box>
          )}
        {/* <ExitButton
                    title={`Exit ${dataroom?.name}`}
                    onClick={leaveDataroom}
                >
                    <LogoutIcon sx={{ transform: "scaleX(-1)" }} />
                </ExitButton> */}
      </List>
    </Box>
  );
};

export default memo(Menu, ({ languageChange }) => {
  return !languageChange ? true : false;
});
