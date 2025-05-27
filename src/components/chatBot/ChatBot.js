// create a simple button that will open the chatbot

// React Hooks
import { memo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import ChatBotModal from "./chatBotModal";
import { Box, Alert, Stack, Grid, Modal } from "@mui/material";
// MUI Components
import Button from "@mui/material/Button";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

const ChatBot = ({ dataroomId }) => {
  const [chatBotModalOpen, setChatBotModalOpen] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const handleChatBotModalOpen = useCallback(
    () => setChatBotModalOpen(true),
    []
  );
  const handleChatBotModalClose = useCallback(
    () => setChatBotModalOpen(false),
    []
  );

  const handleDock = useCallback(() => {
    setIsDocked((prev) => !prev);
  }, []);

  return (
    <Box
      sx={
        isDocked
          ? {
              height: "100vh",
            }
          : {
              position: "fixed",
              right: 100,
              bottom: 20,
              zIndex: 2000,
            }
      }
    >
      {!chatBotModalOpen && (
        <Button
          onClick={handleChatBotModalOpen}
          sx={{
            borderRadius: 50,
            // paper like shadow
            boxShadow: 3,
            backgroundColor: "White",
          }}
        >
          <SmartToyOutlinedIcon
            sx={{
              width: 40,
              height: 40,
            }}
          />
          {/* <p>ZK Wiki</p> */}
        </Button>
      )}

      {chatBotModalOpen && (
        <ChatBotModal
          open={chatBotModalOpen}
          onClose={handleChatBotModalClose}
          dataroomId={dataroomId}
          isDocked={isDocked}
          onDock={handleDock}
        />
      )}
    </Box>
  );
};

export default memo(ChatBot);
