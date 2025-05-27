// Internal hooks
import { useCallback, useEffect, useState, useRef } from "react";
import useSWR from "swr";
// MUI components
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  List,
  ListItem,
  Divider,
} from "@mui/material";
import styled from "@emotion/styled";
import * as XLSX from "xlsx";
import KeyIcon from "@mui/icons-material/Key";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DownloadIcon from "@mui/icons-material/Download";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Axios } from "axios";
// Custom hooks
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";
import useConfirmationDialog from "../../../hooks/useConfirmationDialog";

// Custom configs
import { ROLES } from "../../../configs/roleConfig";

// Custom components
import GroupsDropdown from "../../reusableComponents/dataroom/GroupsDropdown";
import EditGroupForm from "./EditGroupForm";
import InviteMemberForm from "./InviteMemberForm";
import MemberRow from "./MemberRow";
import ErrorPage from "../../reusableComponents/ErrorPage";
import lange from "@i18n";
// import AccessReportModal from "./AccessReportModal";
import { isMobile } from "react-device-detect";
import FileAccessReportModal from "@reusableComponents/dataroom/stats/FileAccessReport/FileAccessReportModal";
import { set } from "lodash";

const MemberFilter = styled(TextField)({
  "& .MuiInputBase-root.MuiOutlinedInput-root": {
    padding: "6px 16px",
    height: isMobile ? "34px" : "auto",
    width: isMobile ? "100%" : "auto",
  },
  "& .MuiInputBase-input.MuiOutlinedInput-input": {
    lineHeight: 1.75,
    padding: 0,
  },
  "& .MuiInput-input.MuiInputBase-input.Mui-disabled": {
    "-webkit-text-fill-color": "rgb(0, 0, 0)", // (default alpha is 0.38)
  },
});

const STATUSES = {
  unauthorizedError: -2,
  systemError: -1,
  loading: 0,
  loaded: 1,
};

const EDIT_FORM_MODES = {
  closed: 0,
  add: 1,
  edit: 2,
};

function MemberManager({ dataroomId, onSetTitle }) {
  // States
  const [status, setStatus] = useState(STATUSES.loading);
  const [members, setMembers] = useState([]);

  const [groupId, setGroupId] = useState("ALL");
  const [inviteFormOpen, setInviteFormOpen] = useState(false);
  const [memberFilter, setMemberFilter] = useState("");
  const [accessReportUser, setAccessReportUser] = useState(null);
  const [batchFile, setBatchFile] = useState("");

  const { axiosInstance } = useUser();
  const { setAlert, alertHandler } = useAlert();
  const { setConfirmationDialog } = useConfirmationDialog();

  // Get the groups and dataroom data
  const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
  const { data: groups, mutate: mutateGroups } = useSWR(
    dataroomId ? `/datarooms/${dataroomId}/groups` : null,
    fetcher
  );

  const { data: dataroomData } = useSWR(
    dataroomId ? `/datarooms/${dataroomId}` : null,
    fetcher
  );

  const currentGroup = groups?.find((group) => group._id === groupId);

  const myMemberId = dataroomData?.memberId;
  const myRole = ROLES[dataroomData?.role];
  const canManageUsers = myRole?.canManageUsers === true;
  const canViewGroups = myRole?.canViewGroups === true;
  const canViewRoles = myRole?.canViewRoles === true;

  const myLevel = myRole?.level;
  const [editGroupFormMode, setEditGroupFormMode] = useState(
    EDIT_FORM_MODES.closed
  );

  const handleRemoveMember = async (memberId) => {
    try {
      await axiosInstance.delete(`datarooms/${dataroomId}/members/${memberId}`);
      setAlert("Dataroom User removed", "success");
      setMembers((prevState) =>
        prevState.filter((member) => member._id !== memberId)
      );
    } catch (error) {
      setAlert("Error removing user", "error");
    }
  };

  const handleMemberAction = (memberId, type) => {
    if (type === "Remove_User") {
      const memberToRemove = members.find((member) => member._id === memberId);
      setConfirmationDialog({
        title: <div>Remove {memberToRemove.email}</div>,
        description: "Are you sure you want to remove this user?",
        onConfirm: () => handleRemoveMember(memberId),
        onCancel: () => {},
      });
    } else if (type === "Access_Report") {
      const memberToReport = members.find((member) => member._id === memberId);

      setAccessReportUser({
        _id: memberToReport.user._id,
        firstname: memberToReport.user.firstname,
        lastname: memberToReport.user.lastname,
        status: memberToReport.user.status,
        email: memberToReport.user.email,
      });
    } else if (type == "Resend_Invitation") {
      resendInvitation(memberId);
    }
  };

  const resendInvitation = async (memberId) => {
    try {
      await axiosInstance.post(
        `/datarooms/${dataroomId}/members/${memberId}/resendInvitation`
      );
      setAlert("Invitation resent successfully", "success");
    } catch (err) {
      console.log(err);
      setAlert("Encountered an error while resending invitation", "error");
    }
  };

  const handleMemberGroupChange = async (memberId, newGroupId) => {
    try {
      await axiosInstance.put(
        `datarooms/${dataroomId}/members/${memberId}/group`,
        {
          newGroupId,
        }
      );
      setAlert("Member group changed", "success");
      setMembers((prevState) => {
        return prevState.map((member) => {
          return member._id == memberId
            ? {
                ...member,
                group: {
                  _id: newGroupId,
                  name: groups.find((group) => group._id === newGroupId).name,
                },
              }
            : member;
        });
      });
    } catch (error) {
      console.log(error);
      setAlert("Error changing member group", "error");
    }
  };

  const handleMemberRoleChange = async (memberId, role) => {
    try {
      await axiosInstance.put(
        `datarooms/${dataroomId}/members/${memberId}/role`,
        {
          newRole: role,
        }
      );
      setAlert("Member role changed", "success");
      setMembers((prevState) => {
        return prevState.map((member) => {
          return member._id == memberId
            ? {
                ...member,
                role: role,
              }
            : member;
        });
      });
    } catch (error) {
      console.log(error);
      setAlert("Error changing member role", "error");
    }
  };

  const downloadTemplate = () => {
    const data = [
      {
        email: "templateManager@template.com",
        role: "Manager",
        group: "Not Assigned",
      },
      {
        email: "templatePublisher@template.com",
        role: "Publisher",
        group: "Not Assigned",
      },
      {
        email: "templatePreviewer@template.com",
        role: "Previewer",
        group: "Not Assigned",
      },
      {
        email: "templateReviewer@template.com",
        role: "Reviewer",
        group: "Not Assigned",
      },
      {
        email: "templateHidden@template.com",
        role: "Hidden Manager",
        group: "Not Assigned",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    const buffer = new ArrayBuffer(excelBuffer.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < excelBuffer.length; i++) {
      view[i] = excelBuffer.charCodeAt(i) & 0xff;
    }

    const dataBlob = new Blob([buffer], {
      type: "application/octet-stream",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = "ZK Batch invite template.xlsx";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  // Manage group form
  const closeEditGroupForm = () => setEditGroupFormMode(EDIT_FORM_MODES.closed);
  const openAddGroupForm = () => setEditGroupFormMode(EDIT_FORM_MODES.add);
  const openEditGroupForm = () => setEditGroupFormMode(EDIT_FORM_MODES.edit);

  const handleGroupChange = (_groupId) => {
    setGroupId(_groupId);
  };

  const fetchMembersList = async () => {
    try {
      setMembers([]);
      setStatus(STATUSES.loading);
      // We fetch all members at once, so we don't need to filter by group
      // const response = await axiosInstance.get(
      //     `${process.env.BACKEND_URI}/datarooms/${dataroomId}/members` +
      //         (groupId != "ALL" ? `?group=${groupId}` : "")
      // );
      // Fetch all at once
      const response = await axiosInstance.get(
        `${process.env.BACKEND_URI}/datarooms/${dataroomId}/members`
      );
      setStatus(STATUSES.loaded);
      setMembers(response.data);
    } catch (err) {
      console.log(err);
      alertHandler(err);
    }
  };

  const handleDeleteGroupSuccess = (deletedGroupId) => {
    setGroupId("ALL");
    mutateGroups(groups?.filter((group) => group._id !== deletedGroupId));
    closeEditGroupForm();
  };

  const handleEditGroupSuccess = (updatedGroup) => {
    mutateGroups(
      groups?.map((group) =>
        group._id === updatedGroup._id ? updatedGroup : group
      )
    );
    setMembers((prevState) => {
      return prevState.map((member) => {
        return member.group?._id == updatedGroup._id
          ? {
              ...member,
              group: updatedGroup,
            }
          : member;
      });
    });
  };

  const ref = useRef();
  const handleSubmitBatch = async (e) => {
    ref.current.click();
  };

  const handleFileInput = (e) => {
    if (e.target.files.length) {
      const file = e.target.files[0];
      if (
        !(
          file.type ==
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type == "application/vnd.ms-excel"
        )
      ) {
        setAlert("Invalid file type, please provide an Excel file", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const workbook = XLSX.read(event.target.result, {
          type: "binary",
        });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet);
        // Format checker, check if the first row is email, role, group and column count == 3
        var range = XLSX.utils.decode_range(sheet["!ref"]);
        const checkFirst = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });
        if (!sheetData || sheetData.length == 0) {
          setAlert("No invitees found in the file", "error");
          return;
        } else if (
          JSON.stringify(checkFirst[0]) !=
            JSON.stringify(["email", "role", "group"]) ||
          range.e.c != 2
        ) {
          setAlert("Invalid invitees list format", "error");
          return;
        }
        try {
          const { data = {}, status } = await axiosInstance.post(
            `${process.env.BACKEND_URI}/datarooms/${dataroomId}/members`,
            {
              invitees: sheetData,
            }
          );
          const { success = [], failed = [], duplicate = [] } = data;
          sheetData.map((res) => {
            if (
              success.length > 0 &&
              failed.length == 0 &&
              duplicate.length == 0
            ) {
              setAlert("Batch invitation sent successfully", "success");
            } else {
              setAlert(
                "Batch invitation sent with errors, please check the imported excel file",
                "warning"
              );
            }
            if (success.findIndex((item) => item === res.email) != -1) {
              return { ...res, status: "success" };
            }
            if (duplicate.findIndex((item) => item === res.email) != -1) {
              return { ...res, status: "duplicate" };
            }
            if (failed.findIndex((item) => item === res.email) != -1) {
              return { ...res, status: "failed" };
            }
          });
          fetchMembersList();
        } catch (err) {
          console.log(err);
          setAlert("Error sending batch invitation", "error");
        }
      };

      reader.readAsBinaryString(file);
      setBatchFile("");
    }
  };

  const handleAddGroupSuccess = useCallback((newGroup) => {
    setGroupId(newGroup._id);
    mutateGroups([...groups, newGroup]);

    closeEditGroupForm();
  });

  useEffect(() => {
    isMobile && onSetTitle(lange("User_Management"));
  }, []);

  useEffect(() => {
    if (dataroomId) {
      fetchMembersList();
    }
  }, [dataroomId]);

  if (status === STATUSES.unauthorizedError) {
    return <ErrorPage message="You are not permitted to enter this page" />;
  } else if (status === STATUSES.systemError) {
    return (
      <ErrorPage message="Something went wrong. Please try again later." />
    );
  } else {
    return (
      <Box
        display="flex"
        flexDirection="column"
        p={isMobile ? 0 : 6}
        pt={isMobile ? 2 : 6}
        position="relative"
        width="100%"
        height="100vh"
      >
        {!isMobile && (
          <Typography variant="h3" marginBottom={4}>
            {canManageUsers ? lange("User_Management") : lange("User_List")}
          </Typography>
        )}

        <Box display="flex" flexDirection="row" flexWrap="wrap">
          {canViewGroups && (
            <GroupsDropdown
              selectedGroups={groupId}
              onSelect={handleGroupChange}
              groups={groups || []}
              includeAll={true}
              sx={{ width: "200px" }}
            />
          )}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              display: "flex",
              marginLeft: isMobile ? "0" : "auto",
              padding: isMobile ? "15px 0" : "0.2rem 0",
              width: isMobile ? "100%" : "auto",
              justifyContent: "flex-end",
            }}
          >
            {canManageUsers && !isMobile && (
              <Button
                variant="contained"
                onClick={openAddGroupForm}
                startIcon={<AddIcon />}
              >
                {lange("Create_new_group")}
              </Button>
            )}
            {groupId != "ALL" &&
              !isMobile &&
              currentGroup?.name != "Not Assigned" &&
              canManageUsers && (
                <Button
                  variant="contained"
                  startIcon={<KeyIcon />}
                  sx={{ width: "160px" }}
                  onClick={openEditGroupForm}
                >
                  {lange("Settings")}
                </Button>
              )}
            {canManageUsers && !isMobile && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{ width: "160px" }}
                onClick={() => setInviteFormOpen(true)}
              >
                {lange("Invite_Users")}
              </Button>
            )}
            {canManageUsers && !isMobile && (
              <Button
                component="span"
                startIcon={<GroupAddIcon />}
                variant="contained"
                onClick={handleSubmitBatch}
              >
                {"Batch Invite (Excel)"}
              </Button>
            )}
            <input
              ref={ref}
              name="file"
              type="File"
              value={batchFile}
              accept={
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              }
              onInput={handleFileInput}
              hidden
            />

            {canManageUsers && !isMobile && (
              <Button
                component="span"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
              >
                {"Batch Invitation Template"}
              </Button>
            )}
            <MemberFilter
              value={memberFilter}
              InputLabelProps={{
                shrink: true,
                style: { display: "none" },
              }}
              placeholder={lange("Search_Placeholder")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => {
                setMemberFilter(e.target.value);
              }}
              name="filter"
              sx={{
                width: isMobile ? "100%" : "180px",
              }}
            />
          </Stack>
        </Box>
        <Paper
          sx={{
            height: "100%",
            width: "100%",
            position: "relative",
            overflow: "hidden",
            marginTop: isMobile ? 0 : "1.5rem",
            boxShadow: isMobile ? " 0 0 0 0 rgba(255, 255, 255, 1)" : "",
          }}
        >
          {!isMobile && (
            <TableContainer
              sx={{
                height: "100%",
              }}
            >
              {status === STATUSES.loading && (
                <Box
                  display="flex"
                  position="absolute"
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                  height="100%"
                >
                  <Typography variant="h5">
                    <CircularProgress size={50} />
                  </Typography>
                </Box>
              )}
              <Table
                sx={{
                  minWidth: 650,
                }}
                aria-label="simple table"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    <TableCell width="15%">{lange("Name")}</TableCell>
                    <TableCell width="10%">{lange("Organization")}</TableCell>
                    <TableCell width="20%">{lange("Email")}</TableCell>
                    <TableCell width="10%" align="left">
                      {lange("Phone")}
                    </TableCell>
                    {canViewRoles && (
                      <TableCell width="18%" align="left">
                        {lange("Role")}
                      </TableCell>
                    )}

                    {canViewGroups && (
                      <TableCell width="17%" align="left">
                        {lange("Group")}
                      </TableCell>
                    )}

                    <TableCell width="5%" align="left">
                      {lange("Status")}
                    </TableCell>

                    <TableCell width="5%" align="left">
                      {lange("Actions")}
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody
                  sx={{
                    backgroundColor: "white",
                    overflow: "auto",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  {members
                    .filter(
                      (member) =>
                        (groupId == "ALL"
                          ? true
                          : member.group?._id == groupId) &&
                        [
                          member.firstname,
                          member.lastname,
                          member.email,
                          member.organization,
                          member.phone,
                          ROLES[member.role].name,
                          member.group?.name,
                          member.status,
                        ]
                          .join(" ")
                          .toLowerCase()
                          .includes(memberFilter.toLowerCase())
                    )
                    .map((member, i) => (
                      <MemberRow
                        dataroomId={dataroomId}
                        member={member}
                        isMe={member._id == myMemberId}
                        myRole={myRole}
                        onActionClick={handleMemberAction}
                        onGroupChange={handleMemberGroupChange}
                        onRoleChange={handleMemberRoleChange}
                        key={i}
                        groups={groups}
                      />
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {isMobile && (
            <List>
              {members
                .filter(
                  (member) =>
                    (groupId == "ALL" ? true : member.group?._id == groupId) &&
                    [
                      member.firstname,
                      member.lastname,
                      member.email,
                      member.organization,
                      member.phone,
                      ROLES[member.role].name,
                      member.group?.name,
                    ]
                      .join(" ")
                      .toLowerCase()
                      .includes(memberFilter.toLowerCase())
                )
                .map((member, i) => {
                  return (
                    <ListItem
                      key={i}
                      sx={{
                        flexDirection: "column",
                        padding: "0",
                        alignItems: "flex-start",
                      }}
                    >
                      <Divider
                        variant="inset"
                        component="li"
                        sx={{
                          marginLeft: 0,
                          marginBottom: "15px",
                          marginTop: "15px",
                          width: "100%",
                        }}
                      />
                      <Typography variant="h3" px={0} mb="10px">
                        {member?.user?.firstname} {member?.user?.lastname}
                      </Typography>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <Box flex={1}>
                          <Typography variant="caption" px={0}>
                            {lange("Email")}
                          </Typography>
                          <Typography variant="h5" px={0} mb="5px">
                            {member?.email}
                          </Typography>
                          <Typography variant="caption" px={0}>
                            {lange("Phone")}
                          </Typography>
                          <Typography variant="h5" px={0}>
                            {member?.phone}
                          </Typography>
                        </Box>
                        <Box ml={1} flex="0 0 129px">
                          <Typography variant="caption" px={0}>
                            {lange("Organization")}
                          </Typography>
                          <Typography variant="h5" px={0} mb="5px">
                            {member?.user?.organization}
                          </Typography>
                          <Typography variant="caption" px={0}>
                            {lange("Role")}
                          </Typography>
                          <Typography variant="h5" px={0} mb="5px">
                            {member?.role}
                          </Typography>
                          <Typography variant="caption" px={0}>
                            {lange("Group")}
                          </Typography>
                          <Typography variant="h5" px={0}>
                            {member?.group?.name}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })}
            </List>
          )}
        </Paper>
        <Modal
          open={editGroupFormMode != EDIT_FORM_MODES.closed}
          onClose={() => setEditGroupFormMode(EDIT_FORM_MODES.closed)}
        >
          <EditGroupForm
            group={editGroupFormMode == EDIT_FORM_MODES.edit && currentGroup}
            dataroomId={dataroomId}
            availableGroups={groups}
            onDeleteSuccess={handleDeleteGroupSuccess}
            onEditSuccess={handleEditGroupSuccess}
            onAddSuccess={handleAddGroupSuccess}
          />
        </Modal>
        <Modal open={inviteFormOpen}>
          <InviteMemberForm
            existingEmails={members.map((member) => member.email)}
            assignableRoles={Object.keys(ROLES).filter(
              (role) =>
                ROLES[role]?.level <= myLevel &&
                ROLES[role]?.virtualRole == false
            )}
            groups={groups}
            dataroomId={dataroomId}
            onInvitationSuccess={fetchMembersList}
            onClose={() => setInviteFormOpen(false)}
          />
        </Modal>
        <FileAccessReportModal
          user={accessReportUser}
          open={accessReportUser}
          dataroomId={dataroomId}
          onClose={() => setAccessReportUser(null)}
        />
      </Box>
    );
  }
}

export default MemberManager;
