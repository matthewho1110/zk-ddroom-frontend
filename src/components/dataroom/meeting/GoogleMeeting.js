import useSWR from "swr";
import useUser from "../../../hooks/useUser";
import { Box, TextField, Button, Paper } from "@mui/material";
import { Form, Formik } from "formik";
import GoogleButton from "react-google-button";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import axios from "axios";
import { useRouter } from "next/router";
import {
    dataroomNameYupSchema,
    dataroomDescriptionYupSchema,
    dataroomOrganizationYupSchema,
    dataroomPhaseYupSchema,
    dataroomStorageYupSchema,
} from "../../../utils/inputValidator";

import useAlert from "../../../hooks/useAlert";
import { redirect } from "next/dist/server/api-utils";
import { ConsoleView } from "react-device-detect";
import { set } from "lodash";

const GoogleMeeting = ({ dataroomId }) => {
    const { axiosInstance } = useUser();
    const { setAlert } = useAlert();
    const router = useRouter();
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const {
        data: dataroomData,
        isLoading: isDataroomLoading,
        mutate: mutateDataroomData,
    } = useSWR(dataroomId ? `/datarooms/${dataroomId}` : null, fetcher);

    const [gapiLoaded, setGapiLoaded] = useState(false);
    const [recordings, setRecordings] = useState([]);
    const [accessToken, setAccessToken] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const loadScript = () => {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = () => setGapiLoaded(true);
            document.body.appendChild(script);
        };

        loadScript();
    }, []);

    const getRecordings = async (accessToken) => {
        setFetching(true);
        await fetch("https://meet.googleapis.com/v2/conferenceRecords", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                for (let i = 0; i < data.conferenceRecords.length; i++) {
                    fetch(
                        `https://meet.googleapis.com/v2/${data.conferenceRecords[i].name}/recordings`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                Accept: "application/json",
                            },
                        }
                    )
                        .then((res) => res.json())
                        .then((data) => {
                            if (Array.isArray(data.recordings)) {
                                console.log(data.recordings);
                                data.recordings.map(async (rec) => {
                                    if (rec.driveDestination.file) {
                                        try {
                                            const response = await fetch(
                                                `https://www.googleapis.com/drive/v3/files/${rec.driveDestination.file}`,
                                                {
                                                    method: "GET",
                                                    headers: {
                                                        Authorization: `Bearer ${accessToken}`,
                                                    },
                                                }
                                            );
                                            if (response.ok) {
                                                const res =
                                                    await response.json();

                                                setRecordings((prev) => {
                                                    const updated = [
                                                        ...prev,
                                                        {
                                                            fileName: res.name,
                                                            ...rec,
                                                        },
                                                    ];
                                                    // Sort recordings by startTime descending
                                                    return updated.sort(
                                                        (a, b) => {
                                                            return (
                                                                new Date(
                                                                    b.startTime
                                                                ) -
                                                                new Date(
                                                                    a.startTime
                                                                )
                                                            );
                                                        }
                                                    );
                                                });
                                            }
                                        } catch (error) {
                                            console.error(
                                                "Error fetching file details:",
                                                error
                                            );
                                        }
                                    }
                                });
                            }
                        })
                        .catch((err) => {
                            console.error("Error retrieving recordings:", err);
                        });
                }
                console.log(recordings);
                if (recordings.length == 0) {
                    setAlert({
                        type: "info",
                        message: "No recordings found.",
                    });
                }
                setFetching(false);
            })
            .catch((err) => {
                console.error("Error retrieving recordings:", err);
                alert(
                    "Ensure this Google account has access and the Workspace admin has enabled the API."
                );
                setFetching(false);
            });
    };

    const handleAuth = () => {
        if (!gapiLoaded) return;
        setRecordings([]); // Clear previous recordings
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id:
                "497775175985-j3um7ak8vb629h4se0v0tc55ntvhq1pd.apps.googleusercontent.com",
            scope: "https://www.googleapis.com/auth/meetings.space.readonly",
            callback: (tokenResponse) => {
                setAccessToken(tokenResponse.access_token);
                getRecordings(tokenResponse.access_token);
            },
        });

        tokenClient.requestAccessToken({ prompt: "consent" });
    };

    const uploadRecordingToDataroom = async (fileId) => {
        // Download the recording file from the URL
        // https://www.googleapis.com/drive/v3/files/{fileId}
        setUploading(true);
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        const blob = await response.blob();
        const file = new File(
            [blob],
            "google-recording" + Date.now() + ".mp4",
            {
                type: "video/mp4",
            }
        );
        const tempId = v4();
        const fileList = [
            {
                data: file,
                name: file.name,
                size: file.size,
                type: file.type,
                tempId: tempId,
            },
        ];
        const _path = "/root";
        const responseGetPath = await axiosInstance.get(
            `datarooms/${dataroomId}/files?path=${encodeURIComponent(_path)}`
        );
        const res = await axiosInstance.patch(
            `datarooms/${dataroomId}/files/${responseGetPath.data._id}/upload`,
            {
                uploads: fileList,
            }
        );
        const signedFile = res.data;
        handleS3Upload(signedFile[tempId], file);
        setTimeout(() => {
            setUploading(false);
            router.push(
                `/dataroom/${dataroomId}/files?filePath=${signedFile[tempId].fileId}`
            );
        }, 3000);
    };

    const handleS3Upload = async (signedFile, file) => {
        try {
            await axios.put(signedFile.s3Url, file, {
                headers: {
                    "Content-Type": file.type,
                },
            });
            const form = new FormData();
            form.append("file", file);
            console.log(file);
            await axiosInstance.post(
                `/datarooms/${dataroomId}/files/${signedFile.fileId}/confirmUploadedWithGpt`,
                form,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ mb: 3 }}>
                <GoogleButton onClick={handleAuth} disabled={!gapiLoaded} />
            </Box>

            {!fetching && recordings.length != 0 && (
                <Box sx={{ mt: 3 }}>
                    <h3>Meeting Recordings:</h3>

                    {recordings.map((rec, idx) => (
                        <Paper
                            key={rec.driveDestination.exportUri + idx}
                            sx={{
                                padding: 2,
                                marginBottom: 2,
                                position: "relative",
                                minHeight: 120,
                            }}
                        >
                            <h4>{rec.fileName}</h4>
                            <a
                                href={rec.driveDestination.exportUri}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {rec.driveDestination.exportUri}
                            </a>
                            <Button
                                onClick={() => {
                                    uploadRecordingToDataroom(
                                        rec.driveDestination.file
                                    );
                                }}
                                sx={{
                                    position: "absolute",
                                    bottom: 16,
                                    right: 16,
                                    backgroundColor: "#007bff",
                                    "&:hover": {
                                        backgroundColor: "#0056b3",
                                    },
                                    color: "white",
                                    // disable color gray
                                    "&:disabled": {
                                        backgroundColor: "#ccc",
                                        color: "#666",
                                    },
                                }}
                                disabled={uploading}
                            >
                                Upload to Dataroom
                            </Button>
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default GoogleMeeting;
