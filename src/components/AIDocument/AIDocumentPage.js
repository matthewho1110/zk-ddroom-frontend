// import internal modules
import useUser from "../../hooks/useUser";

import File from "./File";
import DocumentDropdown from "../reusableComponents/dataroom/DocumentDropdown";
// import mui modules
import { Box, Divider, Button, TextField } from "@mui/material";

// import external modules
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useState, useCallback, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { Document, Packer, Paragraph, TextRun } from "docx";
import useAlert from "../../hooks/useAlert";
import DocXViewer from "../dataroom/fileBrowser/fileViewer/DocXViewer";
import useUserProfileQuery from "../../hooks/useUserProfile";
import lange from "@i18n";

const meetingMinutes = [
    {
        section: "Meeting Details",
        description:
            "Review the transcript and identify the key details of the meeting, including the date, time, who called it, and the list of attendees. Present this information clearly and concisely.",
    },
    {
        section: "Action Items",
        description:
            "Review the text and identify any tasks, assignments, or actions that were agreed upon or mentioned as needing to be done. These could be tasks assigned to specific individuals, or general actions that the group has decided to take. Please list these action items clearly and concisely.",
    },
    {
        section: "Agenda",
        description:
            "Based on the transcript, identify the main agendas or topics discussed. Focus on listing each agenda item briefly and clearly, as well as any subtopics if they’re relevant. Ignore informal exchanges, side conversations, or unrelated discussions. Provide the agenda items in a concise, bullet-point format.",
    },
];

const financialReport = [
    {
        section: "Financial Overview",
        description:
            "Provide a summary of the financial performance, including revenue, expenses, and profit/loss.",
    },
    {
        section: "Key Metrics",
        description:
            "Highlight important financial metrics such as gross margin, net profit margin, and return on investment.",
    },
    {
        section: "Comparative Analysis",
        description:
            "Compare current financial performance with previous periods or industry benchmarks.",
    },
];

const termSheet = [
    {
        section: "Overview",
        description:
            "Principal terms for the proposed investment in the company, including parties involved, transaction type, and investment details.",
    },
    {
        section: "Next Steps",
        description:
            "- Complete due diligence.\n" +
            "- Draft and sign definitive agreements.\n" +
            "- Fulfill conditions precedent.\n" +
            "- Issue Series A Preferred Shares.\n" +
            "- Finalise cap table.\n" +
            "- Establish corporate governance structure.\n" +
            "- Appoint directors and observers.\n" +
            "- Implement ESOP.\n" +
            "- Ensure compliance with warranties and representations.",
    },
    {
        section: "Key Terms",
        description:
            "- Investment structure and Series A share details.\n" +
            "- Parties: Company, Existing Shareholders, Investors.\n" +
            "- Investment amount and valuation.\n" +
            "- Shareholding and post-investment capitalisation.\n" +
            "- Use of proceeds.\n" +
            "- Investor rights: liquidation preference, anti-dilution, voting, information rights.\n" +
            "- Board composition and governance.\n" +
            "- ESOP implementation.\n" +
            "- Conditions precedent and closing.\n" +
            "- Confidentiality, exclusivity, governing law.",
    },
];

const commonLanguages = [
    "English",
    "Chinese",
    "Spanish",
    "French",
    "Arabic",
    "Russian",
    "German",
    "Portuguese",
    "Japanese",
    "Hindi",
];

const convertToTreeItems = (nodes, parentId = "") => {
    return Object.entries(nodes).map(([key, value]) => {
        const nodeId = parentId
            ? parentId == "root"
                ? "/" + parentId + "/" + key
                : parentId + "/" + key
            : key;
        let result = {};
        if (value[1]) {
            result = {
                id: nodeId,
                label: value[1] + "    " + key,
            };
        } else {
            result = {
                id: nodeId,
                label: key,
            };
        }

        if (typeof value == "object" && !value[0]) {
            result["children"] = convertToTreeItems(value, nodeId);
        }
        if (result["children"]) {
            let fileIndex = result["children"][0]["label"].split(" ")[0];
            let folderIndex = fileIndex.substr(0, fileIndex.lastIndexOf("."));

            result = {
                id: nodeId,
                label:
                    parentId === "" && key === "root"
                        ? "All Folder"
                        : folderIndex + "    " + key,
                children: result["children"],
            };
        }
        return result;
    });
};

const DEFAULT_FILE_TREE = {
    fileTree: [],
    selectedFiles: [],
    loading: true,
};

const AIDocumentPage = ({ dataroomId }) => {
    // const { setAlert, alertHandler } = useAlert();
    const { axiosInstance } = useUser();
    const [showDocumentDropdown, setShowDocumentDropdown] = useState(false);
    const [sections, setSections] = useState([
        { section: "", description: "" },
    ]);
    const [template, setTemplate] = useState("");
    const [title, setTitle] = useState(template);
    const [language, setLanguage] = useState("");
    const [fileTree, setFileTree] = useState(DEFAULT_FILE_TREE);
    const [pending, setPending] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [docFile, setDocFile] = useState();
    const { setAlert } = useAlert();
    const { data: user } = useUserProfileQuery();
    // Get groups via SWR hook
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const handleAddNewSection = () => {
        setSections([...sections, { section: "", description: "" }]);
    };
    const handleSubmit = async () => {
        if (fileTree.selectedFiles.length === 0) {
            setAlert("Please select files", "error");
            return;
        }
        if (title == "") {
            setAlert("Please enter a title", "error");
            return;
        }
        if (language == "") {
            setAlert("Please select a language", "error");
            return;
        }
        if (sections.length === 0) {
            setAlert("Please add at least one section", "error");
            return;
        }
        setPending(true);
        try {
            const res = await axiosInstance.patch(
                `/datarooms/${dataroomId}/file/genDoc`,
                {
                    selectedFiles: fileTree.selectedFiles,
                    title: title,
                    sections: sections,
                    language: language,
                    template: template,
                }
            );
            setAlert("Document generated successfully", "success");
            const lines = res.data.doc.split("\n");
            const doc = new Document({
                creator: "AI Document Generator",
                description: "Generated Document",
                title: lines[0] || "Generated Document",
                sections: [], // Initialize with an empty sections array
            });
            let paragraphs = [];

            lines.forEach((line) => {
                if (line.startsWith("###")) {
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line.replace("###", ""),
                                    bold: true,
                                    size: 28,
                                }),
                            ],
                            spacing: { after: 200 },
                        })
                    );
                } else if (line.startsWith("#")) {
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line.replace("#", ""),
                                    bold: true,
                                    size: 36,
                                }),
                            ],
                            spacing: { after: 200 },
                        })
                    );
                } else if (line.startsWith("##")) {
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line.replace("##", ""),
                                    bold: true,
                                    size: 32,
                                }),
                            ],
                            spacing: { after: 200 },
                        })
                    );
                } else if (line.startsWith("- ")) {
                    // Parse for bold text (marked with **)
                    const text = line.substring(2);
                    const parts = text.split(/(\*\*.*?\*\*)/g);

                    const children = [new TextRun({ text: "• ", bold: true })];

                    parts.forEach((part) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                            children.push(
                                new TextRun({
                                    text: part.substring(2, part.length - 2),
                                    bold: true,
                                })
                            );
                        } else if (part) {
                            children.push(new TextRun(part));
                        }
                    });

                    paragraphs.push(new Paragraph({ children }));
                } else if (line.trim() !== "") {
                    // Handle bold text in regular paragraphs too
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    const children = [];

                    parts.forEach((part) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                            children.push(
                                new TextRun({
                                    text: part.substring(2, part.length - 2),
                                    bold: true,
                                })
                            );
                        } else if (part) {
                            children.push(new TextRun(part));
                        }
                    });

                    paragraphs.push(new Paragraph({ children }));
                }
            });

            doc.addSection({ children: paragraphs });
            const docBlob = await Packer.toBlob(doc);
            Packer.toBlob(doc).then(async (blob) => {
                setDocFile({
                    tempUri: docBlob,
                    blob: blob,
                    name: title,
                    dataroom: dataroomId,
                });
                setPending(false);

                setIsPreview(true);
            });
        } catch (err) {
            console.error(err);
            setAlert("Failed to generate document", "error");
            setPending(false);
        }
    };
    const handleChange = (event, index) => {
        const { name, value } = event.target;
        const newSections = [...sections];
        newSections[index][name] = value;
        setSections(newSections);
    };

    const handleRemoveSection = (index) => {
        const tmp = [...sections];
        const removed = tmp.splice(index, 1);
        setSections(tmp);
    };

    const handleSelectFiles = useCallback(async (selectedFiles) => {
        setFileTree((prev) => ({
            ...prev,
            selectedFiles: selectedFiles,
        }));
    }, []);

    const getSelectedFiles = async () => {
        try {
            setFileTree(DEFAULT_FILE_TREE);
            if (!dataroomId) return;
            const response = await axiosInstance.get(
                `/datarooms/${dataroomId}/chats/selectedFiles`
            );
            setFileTree({
                fileTree: convertToTreeItems(response.data.fileTree),
                selectedFiles: [],
                loading: false,
            });
        } catch (err) {
            setAlert("Failed to get selected files", "error");
            setFileTree({ ...DEFAULT_FILE_TREE, loading: false });
        }
    };

    useEffect(() => {
        if (dataroomId) {
            getSelectedFiles();
        }
    }, [dataroomId]);

    if (!isPreview) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                position="relative"
                p={isMobile ? 0 : 2}
                height="100vh"
                width="100%"
            >
                <h2>{lange("AI_Document_Generator")}</h2>
                <Box display="flex" flexDirection={"row"} height="100%">
                    <Box
                        width={"40%"}
                        borderRadius={2}
                        backgroundColor="white"
                        sx={{ ml: 2 }}
                    >
                        <h4>{lange("Select_Files")}</h4>
                        <div>
                            {/* <h5>File/Document</h5> */}
                            <Divider />
                            <File
                                fileTree={fileTree.fileTree}
                                handleSelectFiles={handleSelectFiles}
                            />
                        </div>
                    </Box>
                    <Box
                        width={"60%"}
                        borderRadius={2}
                        sx={{ ml: 5 }}
                        backgroundColor="white"
                    >
                        <h4>{lange("Output_document")}</h4>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <p style={{ fontSize: "15px" }}>
                                {lange("Template")}
                            </p>
                            <DocumentDropdown
                                onSelect={(document) => {
                                    setShowDocumentDropdown(false);
                                    if (template != document) {
                                        setTemplate(document);
                                        setTitle(document);
                                    }
                                    if (document === "Meeting Minutes") {
                                        setSections(meetingMinutes);
                                    } else if (
                                        document === "Financial Report"
                                    ) {
                                        setSections(financialReport);
                                    } else if (document === "Term Sheet") {
                                        setSections(termSheet);
                                    }
                                }}
                                selectedDocument={template}
                                label={lange("Template")}
                                documents={[
                                    "Meeting Minutes",
                                    // "Financial Report",
                                    // "Term Sheet",
                                ]}
                                sx={{ width: "80%", ml: 5, mt: 1 }}
                            />
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <p style={{ fontSize: "15px" }}>
                                {lange("Language")}
                            </p>
                            <DocumentDropdown
                                onSelect={(langName) => {
                                    const selectedLang = commonLanguages.find(
                                        (lang) => lang === langName
                                    );
                                    if (selectedLang) {
                                        setLanguage(selectedLang);
                                    }
                                }}
                                selectedDocument={language}
                                documents={commonLanguages}
                                label={lange("Language")}
                                sx={{ width: "80%", ml: 5, mt: 1 }}
                            />
                        </div>

                        <h4>{lange("Instruction_for_the_AI")}</h4>
                        <Box
                            height={"45vh"}
                            borderRadius={2}
                            border={1}
                            p={2}
                            overflow="auto"
                        >
                            <TextField
                                label="Document Title"
                                value={template}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                sx={{ width: "80%" }}
                            />

                            {sections.map((section, index) => (
                                <>
                                    <TextField
                                        label="Section"
                                        name="section"
                                        placeholder="Section name"
                                        value={section.section}
                                        sx={{ marginTop: "30px" }}
                                        onChange={(event) =>
                                            handleChange(event, index)
                                        }
                                    />
                                    <RemoveCircleOutlineIcon
                                        sx={{
                                            float: "right",
                                            marginTop: "30px",
                                        }}
                                        onClick={() =>
                                            handleRemoveSection(index)
                                        }
                                    />
                                    <p style={{ fontSize: "10px" }}>
                                        # AI will generate the content based on
                                        the section description
                                    </p>
                                    <TextField
                                        label="Description"
                                        name="description"
                                        placeholder="Section description"
                                        multiline={true}
                                        rows={3}
                                        value={section.description}
                                        sx={{
                                            width: "100%",
                                            marginTop: "10px",
                                        }}
                                        onChange={(event) =>
                                            handleChange(event, index)
                                        }
                                    />
                                    <br></br>
                                </>
                            ))}
                            <br></br>
                            <Button onClick={handleAddNewSection}>
                                Add New section
                            </Button>
                        </Box>
                        <br></br>
                        {pending ? (
                            <Button
                                variant="contained"
                                sx={{ float: "right" }}
                                disabled={pending}
                            >
                                Generating...
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                sx={{ float: "right" }}
                                onClick={() => handleSubmit()}
                                disabled={pending}
                            >
                                Generate
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        );
    } else {
        return (
            <Box
                display="flex"
                flexDirection="column"
                position="relative"
                p={isMobile ? 0 : 2}
                height="100vh"
                width="100%"
            >
                <h2>{lange("AI_Document_Generator")}</h2>

                <DocXViewer file={docFile} user={user} permission={-1} />
            </Box>
        );
    }
};

export default AIDocumentPage;
