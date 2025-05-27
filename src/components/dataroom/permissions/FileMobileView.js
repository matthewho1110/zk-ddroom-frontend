
import { memo, useEffect, useState } from "react";
import { PERMISSION_LEVELS } from "../../../configs/permissionConfig";
import { Breadcrumbs, Link, Box, Card, Typography } from '@mui/material';
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import useUser from "../../../hooks/useUser";
import useAlert from "../../../hooks/useAlert";
import lange from "@i18n";

let PERMISSION_LEVELS_MAP = Object.keys(PERMISSION_LEVELS).sort((p1, p2) => PERMISSION_LEVELS[p2].level - PERMISSION_LEVELS[p1].level)


function FileMobileView({ dataroomId, groupId }) {
  const [breadcrumbs, setBreadCrumbs] = useState([])
  const [file, setFile] = useState(null);
  const [fileId, setFiledId] = useState('')
  const [children, setChildren] = useState([])
  const [parentPermissionLevel, setParentPermissionLevel] = useState('')
  const { axiosInstance } = useUser();
  const { setAlert, alertHandler } = useAlert();

  const fetchFilePermissions = async (fileId) => {
    try {
      const queryParams = {};

      if (!fileId) {
        queryParams["path"] = "/root";
      } else {
        queryParams["fileId"] = fileId;
      }
      const file = (
        await axiosInstance.get(
          `${process.env.BACKEND_URI}/datarooms/${dataroomId}/filePermissions`,
          {
            params: queryParams,
          }
        )
      ).data;
      if (fileId) {
        return file
      }
      file?.permissions?.[groupId] && setParentPermissionLevel(file?.permissions?.[groupId])
      setBreadCrumbs([file])
      setFile(file);
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setAlert("Unauthorized", "error");
            break;
          case 403:
            setAlert("Forbidden", "error");
            break;
          case 404:
            setAlert("File not found", "error");
            break;
          default:
            setAlert(
              "Unknown Error, Please try again later.",
              "error"
            );
        }
      } else {
        setAlert("Unknown Error, Please try again later.", "error");
      }
    }
  };

  useEffect(async () => {
    await fetchFilePermissions();
  }, [fileId]);

  const isInherited = file?.permissions?.[groupId] == null;
  const currentPermissionLevel = isInherited
    ? parentPermissionLevel
    : file?.permissions?.[groupId];

  const changePermission = async (newPermission, file, isChildren) => {
    let newPermissionLevel = PERMISSION_LEVELS[newPermission].level;
    if (newPermissionLevel == file.permissions?.[groupId]) {
      newPermissionLevel = null;
    }
    try {
      await axiosInstance.patch(
        `${process.env.BACKEND_URI}/datarooms/${dataroomId}/files/${file._id}`,
        {
          [`permissions.${groupId}`]: newPermissionLevel,
        }
      );
      if (isChildren) {
        let _children = [...children]
        _children.splice(children.findIndex(res => res._id === file._id), 1, {
          ...file,
          permissions: {
            ...file.permissions,
            [groupId]: newPermissionLevel,
          },
        })
        setChildren(_children)
        return
      }
      setFile({
        ...file,
        permissions: {
          ...file.permissions,
          [groupId]: newPermissionLevel,
        },
      });
      if (file.name === 'root' && newPermission === null) {
        setParentPermissionLevel('')
      }
      setAlert("Permission updated", "success");
    } catch (err) {
      alertHandler(err);
    }
  };

  const folderOpen = async (file) => {
    if (file.type != "folder" || !file?.children?.length) return;
    let _children = await Promise.all(file.children.map(async res => {
      const itemFile = await fetchFilePermissions(res._id)
      return itemFile
    }))
    file?.permissions?.[groupId] && setParentPermissionLevel(file?.permissions?.[groupId])
    setChildren(_children)
    setBreadCrumbs([...breadcrumbs, { ...file, children: _children }])
  }

  const breadcrumbClick = (item, index) => {
    const { children } = item
    if (children?.length && index) {
      let _breadcrumbs = [...breadcrumbs]
      console.log(_breadcrumbs)
      _breadcrumbs.splice(index + 1)
      setChildren(children)
      setBreadCrumbs(_breadcrumbs)
    } else {
      setChildren([])
      setBreadCrumbs([file])
    }
  }

  return (
    <Box>
      <Breadcrumbs sx={{
        fontSize: "14px",
        fontWeight: 500,
        marginBottom: "15px"
      }} separator=">" aria-label="breadcrumb"
      >
        {breadcrumbs.map((res, index) => {
          return <Link underline="hover" key={index} color={index === breadcrumbs.length - 1 ? "#458DF7" : "inherit"} onClick={() => breadcrumbClick(res, index)}>{(res?.name === 'root' && !index) ? lange("All_Folder") : res?.name}</Link>
        })}
      </Breadcrumbs>
      {file && (
        <Box>
          {(file.name === 'root' && !children?.length)
            ? (
              <Card
                variant="outlined"
                sx={{
                  padding: "5px 10px",
                  backgroundColor: "#F4F4F4"
                }}>
                <Typography
                  display="flex"
                  mb="15px"
                  alignItems="center"
                  onClick={() => folderOpen(file)}
                  variant="h1">
                  <FolderIcon sx={{ marginRight: "5px" }} />
                  root
                </Typography>
                <Box display="flex">
                  {PERMISSION_LEVELS_MAP.map((permission, i) => {
                    const permissionLevel = PERMISSION_LEVELS[permission].level;
                    const activeIcon = PERMISSION_LEVELS[permission].activeIcon;
                    const inheritIcon = PERMISSION_LEVELS[permission].inheritIcon;
                    const hiddenIcon = PERMISSION_LEVELS[permission].hiddenIcon;
                    const name = PERMISSION_LEVELS[permission].name;
                    const icon = PERMISSION_LEVELS[permission].icon;

                    return (
                      <Box
                        display="flex"
                        flexDirection="column"
                        key={i}
                        flex={1}
                        alignItems="center"
                        fontSize="10px"
                        textAlign="center"
                        onClick={() => changePermission(permission, file)}
                      >
                        {icon}
                        <Typography my="5px" >{lange(name)}</Typography>
                        <Box marginTop="auto" height="17px">
                          {currentPermissionLevel === permissionLevel && !isInherited && (activeIcon)}
                          {isInherited && currentPermissionLevel === permissionLevel && (inheritIcon)}
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </Card>
            )
            : <Box>
              {children.map(res => {
                return (
                  <Card
                    key={res._id}
                    variant="outlined"
                    sx={{
                      padding: "5px 10px",
                      backgroundColor: "#F4F4F4",
                      marginBottom: "15px"
                    }}>
                    <Typography
                      display="flex"
                      mb="15px"
                      alignItems="center"
                      onClick={() => folderOpen(res)}
                      variant="h1">
                      {res.type === "folder"
                        ? <FolderIcon sx={{ marginRight: "5px" }} />
                        : <InsertDriveFileIcon sx={{ marginRight: "5px" }} />
                      }
                      {res.name}
                    </Typography>
                    <Box display="flex">
                      {PERMISSION_LEVELS_MAP.map((permission, i) => {
                        const permissionLevel = PERMISSION_LEVELS[permission].level;
                        const activeIcon = PERMISSION_LEVELS[permission].activeIcon;
                        const inheritIcon = PERMISSION_LEVELS[permission].inheritIcon;
                        const hiddenIcon = PERMISSION_LEVELS[permission].hiddenIcon;
                        const name = PERMISSION_LEVELS[permission].name;
                        const icon = PERMISSION_LEVELS[permission].icon;
                        const _isInherited = (res?.permissions?.[groupId] == null || !res?.permissions);
                        const _currentPermissionLevel = _isInherited
                          ? parentPermissionLevel
                          : res?.permissions?.[groupId];

                        return (
                          <Box
                            display="flex"
                            flexDirection="column"
                            key={i}
                            flex={1}
                            alignItems="center"
                            fontSize="10px"
                            textAlign="center"
                            onClick={() => changePermission(permission, res, true)}
                          >
                            {icon}
                            <Typography my="5px" >{lange(name)}</Typography>
                            <Box marginTop="auto" height="17px">
                              {_currentPermissionLevel === permissionLevel && !_isInherited && (activeIcon)}
                              {_isInherited && _currentPermissionLevel === permissionLevel && (inheritIcon)}
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                  </Card>
                )
              })}
            </Box>
          }
        </Box>
      )}
    </Box>
  )
}

export default FileMobileView