// * create a event type object const enum [read, write, update]
import lange from "@i18n";
import React from "react";
import { useRouter } from "next/router";
import { ConstructionOutlined } from "@mui/icons-material";

const unknownFile = lange("Unknown", "File");

module.exports.EVENT_TYPES = {
    // * Dataroom
    Dataroom_add: {
        name: lange("Create", "Dataroom"),
        category: "Dataroom",
        description: () => {
            return `Dataroom is created`;
        },
        bgColor: "rgba(255, 72, 72, 1)",
    }, // done
    Dataroom_update: {
        name: lange("Update", "Dataroom"),
        category: "Dataroom",
        description: (activity) => {
            const oldDataroom = activity?.details?.oldDataroom;
            const newDataroom = activity?.details?.newDataroom;
            const oldDataroomParsed = JSON.parse(oldDataroom);
            const newDataroomParsed = JSON.parse(newDataroom);
            const oldDataroomName = oldDataroomParsed?.name;
            const newDataroomName = newDataroomParsed?.name;
            const oldDataroomDescription = oldDataroomParsed?.description;
            const newDataroomDescription = newDataroomParsed?.description;
            const oldDataroomOrganization = oldDataroomParsed?.organization;
            const newDataroomOrganization = newDataroomParsed?.organization;
            const oldDataroomPhase = oldDataroomParsed?.phase;
            const newDataroomPhase = newDataroomParsed?.phase;
            const oldDataroomMaxStorage = oldDataroomParsed?.maxStorage == -1 ? "Unlimited" : oldDataroomParsed?.maxStorage / 1073741824 + "GB";
            const newDataroomMaxStorage = newDataroomParsed?.maxStorage == -1 ? "Unlimited" : newDataroomParsed?.maxStorage / 1073741824 + "GB";

            const [showDetails, setShowDetails] = React.useState(false)
            const onClick = () => setShowDetails(showDetails => !showDetails)
            return <div className="overflow-x-div">
                <t>Dataroom Information have been updated.</t>
                <br></br>
                <t onClick={onClick} className="show-hide-btn">{showDetails ? <t>hide details</t> : <t>show details</t>}</t>
                <br></br>
                {showDetails ? <div>
                    <t>Name: {oldDataroomName} → {newDataroomName} / </t>
                    <t>Description: {oldDataroomDescription} → {newDataroomDescription} / </t>
                    <t>Organization: {oldDataroomOrganization} → {newDataroomOrganization} / </t>
                    <t>Phase: {oldDataroomPhase} → {newDataroomPhase} / </t>
                    <t>Max Storage: {oldDataroomMaxStorage} → {newDataroomMaxStorage}</t>
                </div> : null}
            </div>
        },
        bgColor: "rgba(34, 68, 187, 1)",
    },
    // * UserGroup
    UserGroup_add: {
        name: lange("Create", "User", "Group"),
        category: "UserGroup",
        description: (activity) => {
            const newGroupName =
                activity?.details?.newGroupName ||
                "Unknown group";
            return `${newGroupName} is created`;
        },
        bgColor: "rgba(255, 72, 72, 1)",
    }, // done
    UserGroup_update: {
        name: lange("Update", "User", "Group"),
        category: "UserGroup",
        description: (activity) => {
            const oldGroupName =
                activity?.details?.oldGroupName ||
                "Unknown group";
            const newGroupName =
                activity?.details?.newGroupName || "Unknown group";
            return `${oldGroupName} is renamed to ${newGroupName}`;
        },
        bgColor: "rgba(34, 68, 187, 1)",
    }, // done
    UserGroup_delete: {
        name: lange("Delete", "User", "Group"),
        category: "UserGroup",
        description: (activity) => {
            const name = activity?.details?.deletedGroupName || "Unknown group";
            return `${name} is deleted`;
        },
        bgColor: "rgba(95, 85, 85, 1)",
    }, // done

    // * File
    File_upload_file: {
        name: lange("Upload", "File"),
        category: "File",
        description: (activity) => {
            const files = activity?.details?.file || unknownFile;
            const type = files[0]?.type || "Unknown";
            const directory = activity?.details?.directory || "Unknown";
            const [showLinks, setShowLinks] = React.useState(false);
            const onClick = () => setShowLinks(showLinks => !showLinks);
            const Links = () => (
                <div>
                  {files?.map((file) => (
                        <><a
                          target="_blank"
                          href={`/dataroom/${activity.dataroomId}/files?filePath=` +
                              file._id}
                          className="link-btn"
                      >
                          {file.name || "Unknown file"}
                      </a>{file != files[files.length - 1] ? <t> , </t> : <t></t>} </>
                ))}
                </div>
            )
            return <div className= "overflow-x-div">
                <div>
                    {files.length > 1 ? (type == "folder" ? "New Folders are " : "New files are " ) : (type == "folder" ? "A new folder is " : "A new file is " )}
                    {lange("Upload_To")}{" "}
                    <a
                        target="_blank"
                        href={
                            `/dataroom/${activity.dataroomId}/files?filePath=` +
                            (activity.details?.directory?._id ||
                                directory)
                        }
                        className="link-btn"
                    >
                        {activity.details?.directory?.path ||
                            directory}
                    </a>
                    {files.length > 1 ?
                        <div>
                            <t onClick={onClick} className="show-hide-btn">{showLinks ? <t>hide files</t> : <t>show files</t>}</t>
                            { showLinks ? <Links /> : null }
                        </div>
                        :
                        <Links />
                    }
                </div>
                
            </div>
        },
        bgColor: "rgba(41, 189, 17, 1)",
    }, // done
    File_view: {
        name: lange("View", "File"),
        category: "File",
        description: (activity) => {
            const filename =
                activity.details?.file?.name || activity.fileId?.name;
            const viewTime = 
                Math.round(
                    (new Date(activity.endTime).getTime() -
                        new Date(activity.timestamp).getTime()) /
                        1000 /
                        60
                )
            return (
                <div>
                    <a
                        target="_blank"
                        href={
                            `/dataroom/${activity.dataroomId}/files?filePath=` +
                            activity.fileId?._id
                        }
                        className="link-btn"
                    >
                        {filename || "Unknown file"}
                    </a>
                    {" is viewed for "}
                    {viewTime}
                    {viewTime > 1 ? " minutes" : " minute"}
                </div>
            );
        },
        bgColor: "rgba(41, 189, 17, 1)",
    },
    File_download: {
        name: lange("Download", "File"),
        category: "File",
        description: (activity) => {
            const userName =
                activity.userId?.firstname + " " + activity.userId?.lastname;
            const userGroup = activity.userGroupId?.name;
            const filename =
                activity.details?.file?.name || activity.fileId?.name;
            const filetype =
                activity.details?.file?.type || activity.fileId?.type;
            return (
                <div>
                    {userName + " (" + userGroup + ") downloaded "}
                    {filetype == "folder" ? "Folder" : "File"}{" "}
                    <a
                        target="_blank"
                        href={
                            `/dataroom/${activity.dataroomId}/files?filePath=` +
                            activity.fileId?._id
                        }
                        className="link-btn"
                    >
                        {filename || "Unknown file"}
                    </a>
                </div>
            );
        },
        bgColor: "rgba(41, 189, 17, 1)",
    },
    File_update_user_group_permission: {
        name: "Update User Group File Permission",
        category: "File",
        description: (activity) => "Not yet implemented",
        bgColor: "rgba(41, 189, 17, 1)",
    },
    File_update_file_info: {
        name: "Update File Permission",
        category: "File",
        description: (activity) => {
            const fileId = activity?.details?.file?._id;
            const fileName = activity?.details?.file?.name;
            const userName =
                activity.userId?.firstname + " " + activity.userId?.lastname;
            const userGroup = activity.userGroupId?.name;
            return (
                <div>
                    File Permission is updated
                    <br></br>
                    <a
                          target="_blank"
                          href={`/dataroom/${activity.dataroomId}/files?filePath=` +
                          fileId}
                          className="link-btn"
                      >
                          {fileName || "Unknown file"}
                      </a>
                </div>
            );
        },
        bgColor: "rgba(41, 189, 17, 1)",
    },
    File_delete: {
        name: lange("Delete", "File"),
        category: "File",
        description: (activity) => {
            const deletedFiles = activity?.details?.deletedFiles;
            const [showLinks, setShowLinks] = React.useState(false)
            const onClick = () => setShowLinks(showLinks => !showLinks)
            const Links = () => (
                <div>
                  {deletedFiles?.map((file) => (
                        <><a
                          target="_blank"
                          href={`/dataroom/${activity.dataroomId}/files?filePath=` +
                              file._id}
                          className="link-btn"
                      >
                          {file.name || "Unknown file"}
                      </a>{file != deletedFiles[deletedFiles.length - 1] ? <t> , </t> : <t></t>} </>
                ))}
                </div>
            )
            return <div className= "overflow-x-div">
                <div>
                    <t>Files are removed from the dataroom</t>
                    <br></br>
                    <t onClick={onClick} className="show-hide-btn">{showLinks ? <t>hide files</t> : <t>show files</t>}</t>
                    { showLinks ? <Links /> : null }
                </div>
                
            </div>
        },
        bgColor: "rgba(95, 85, 85, 1)",
    },
    File_move: {
        name: lange("Move", "File"),
        category: "File",
        description: (activity) => {
            const movedFiles = activity?.details?.movedFiles;
            const [showLinks, setShowLinks] = React.useState(false)
            const onClick = () => setShowLinks(showLinks => !showLinks)
            const oldDirectory = movedFiles[0].oldDirectory;
            const directory = movedFiles[0].directory;
            const Links = () => (
                <div>
                  {movedFiles?.map((file) => (
                        <>
                        <a
                            target="_blank"
                            href={`/dataroom/${activity.dataroomId}/files?filePath=` +
                                file._id}
                            className="link-btn"
                        >
                          {file.name || "Unknown file"}
                        </a>{file != movedFiles[movedFiles.length - 1] ? <t> , </t> : <t></t>} </>
                ))}
                </div>
            )
            return <div className= "overflow-x-div">
                <div>
                    <t>
                        {movedFiles.length == 1 ? <t> File is moved from </t> : <t> Files are moved from </t>}
                        <a
                            target="_blank"
                            href={
                                `/dataroom/${activity.dataroomId}/files?filePath=` +
                                oldDirectory
                            }
                            className="link-btn"
                        > {oldDirectory}
                        </a>
                        <t> to </t>
                        <a
                            target="_blank"
                            href={
                                `/dataroom/${activity.dataroomId}/files?filePath=` +
                                directory
                            }
                            className="link-btn"
                        > {directory}
                        </a>
                        <br></br>
                    </t>
                    <t onClick={onClick} className="show-hide-btn">{showLinks ? <t>hide files</t> : <t>show files</t>}</t>
                    {showLinks ? <Links /> : null}
                </div>
                
            </div>
        },
        bgColor: "rgba(95, 85, 85, 1)",
    },
    Member_add: {
        name: lange("Create", "Members"),
        category: "Member",
        description: (activity) => {
            const emails = activity?.details?.invitation?.success;
            const userIds = activity?.details?.newMembers;
            let profiles = [];
            for (let i = 0; i < userIds.length; i++) {
                let profile = getUserProfile(userIds[i]);
                profiles.push(profile);
            }
            const info = profiles.map((profile) => (profile?.data?.firstname ? profile.data.firstname : "Unregistered")  + " " + (profile?.data?.lastname ? profile.data.lastname : "User") + " (" + profile?.data?.email + ") ").toString();
            const [showInfos, setShowInfos] = React.useState(false);
            const onClick = () => setShowInfos(showInfos => !showInfos);
            return <div className="overflow-x-div">
                {emails?.length > 1 ? "New members are " : "A new member is "}
                <t>invited to the dataroom </t>
                {emails?.length > 1 ?
                <div>
                    <t onClick={onClick} className="show-hide-btn">{showInfos ? <t>hide members</t> : <t>show members</t>}</t>
                    <br></br>
                    { showInfos ? info
                    : null }
                 </div>
                 : "- " + info}
                 null
            </div>
        },
        bgColor: "rgba(255, 72, 72, 1)",
    },
    Member_remove: {
        name: lange("Remove", "Members"),
        category: "Member",
        description: (activity) => {
            const email = activity?.details?.member?.email;
            const userId = activity?.details?.member?.user;
            const profile = getUserProfile(userId);
            const info = (profile?.data?.firstname ? profile.data.firstname : "Unregistered")  + " " + (profile?.data?.lastname ? profile.data.lastname : "User") + " (" + email + ") ";
            return `${info} was removed from the dataroom`;
        },
    },
    Member_group_update: {
        name: lange("User", "Group", "Update"),
        category: "User",
        description: (activity) => {
            const email = activity?.details?.member?.email;
            const userId = activity?.details?.member?.user;
            const profile = getUserProfile(userId);
            const info = (profile?.data?.firstname ? profile.data.firstname : "Unregistered")  + " " + (profile?.data?.lastname ? profile.data.lastname : "User") + " (" + email + ") ";
            const oldGroup = activity?.details?.oldGroup;
            const newGroup = activity?.details?.newGroup;
            return `${info} is moved from ${oldGroup} to ${newGroup}`;
        },
        bgColor: "rgba(95, 85, 85, 1)",
    },
    Member_role_update: {
        name: lange("User", "Role", "Update"),
        category: "User",
        description: (activity) => {
            const email = activity?.details?.member?.email;
            const userId = activity?.details?.member?.user;
            const profile = getUserProfile(userId);
            const info = (profile?.data?.firstname ? profile.data.firstname : "Unregistered")  + " " + (profile?.data?.lastname ? profile.data.lastname : "User") + " (" + email + ") ";
            const oldRole = activity?.details?.oldRole;
            const newRole = activity?.details?.newRole;
            return `${info} is updated from ${oldRole} to ${newRole}`;
        },
        bgColor: "rgba(255, 72, 72, 1)",
    },
    QA_create_a_question: {
        name: lange("Ask", "Question"),
        category: "Question",
        description: (activity) => {
            const questionName = activity?.details?.questionName;
            const questionId = activity?.details?.questionId;
            const openQa = useRouter();
            const navigate =() => openQa.push(`/dataroom/${activity.dataroomId}/qa/detail?qid=${questionId}` )
            return <div>
                <t>A new question - </t>
                <u className = "link-btn" onClick = {navigate}>{questionName || "Unknown Question"}</u>
                <t> is created</t>
            </div>
        },
        bgColor: "rgba(255, 72, 72, 1)",
    },
    QA_answer_a_question: {
        name: lange("Answer", "Question"),
        category: "Question",
        description: (activity) => {
            const questionName = activity?.details?.questionName;
            const questionId = activity?.details?.questionId;
            const openQa = useRouter();
            const navigate =() => openQa.push(`/dataroom/${activity.dataroomId}/qa/detail?qid=${questionId}` )
            return <div>
                <u className = "link-btn" onClick = {navigate}>{questionName || "Unknown Question"}</u>
                <t> is closed</t>
            </div>
        },
        bgColor: "rgba(255, 72, 72, 1)",
    },
    QA_comment_on_answer: {
        name: lange("Comment", "Question"),
        category: "Question",
        description: (activity) => {
            const questionName = activity?.details?.questionName;
            const questionId = activity?.details?.questionId;
            const openQa = useRouter();
            const navigate =() => openQa.push(`/dataroom/${activity.dataroomId}/qa/detail?qid=${questionId}` )
            return <div>
                <t>A comment is made to </t>
                <u className = "link-btn" onClick = {navigate}>{questionName || "Unknown Question"}</u>
            </div>
        },
        bgColor: "rgba(255, 72, 72, 1)",
    },
    QA_update_a_question: {
        name: lange("Update", "Question"),
        category: "Question",
        description: (activity) => {
            const oldQuestion = activity?.details?.oldQuestion;
            const updatedQuestion = activity?.details?.updatedQuestion;
            const oldQuestionParsed= JSON.parse(oldQuestion);
            const updatedQuestionParsed = JSON.parse(updatedQuestion);
            const oldQuestionTitle = oldQuestionParsed?.title;
            const oldQuestionTags = oldQuestionParsed?.tags.length == 0 ? "No Tags" : oldQuestionParsed?.tags.map(tag => tag.name).join(" ");
            const oldQuestionExperts = oldQuestionParsed?.experts.length == 0 ? "No Experts" : oldQuestionParsed?.experts.map(expert => expert.firstname + " " + expert.lastname).join(", ");
            const oldQuestionDescription = oldQuestionParsed?.description.slice(3, -4);
            const updatedQuestionTitle = updatedQuestionParsed?.title;
            const updatedQuestionTags = updatedQuestionParsed?.tags.length == 0 ? "No Tags" : updatedQuestionParsed?.tags.map(tag => tag.name).join(" ");
            const updatedQuestionExperts = updatedQuestionParsed?.experts.length == 0 ? "No Experts" : updatedQuestionParsed?.experts.map(expert => expert.firstname + " " + expert.lastname).join(", ");
            const updatedQuestionDescription = updatedQuestionParsed?.description.slice(3, -4);
            const questionId = oldQuestionParsed?._id;
            const [showDetails, setShowDetails] = React.useState(false);
            const onClick = () => setShowDetails(showDetails => !showDetails);
            const openQa = useRouter();
            const navigate =() => openQa.push(`/dataroom/${activity.dataroomId}/qa/detail?qid=${questionId}` )
            return <div className="overflow-x-div">
                <u className = "link-btn" onClick = {navigate}>{oldQuestionTitle || "Unknown Question"}</u>
                <t> is updated</t>
                <br></br>
                <t onClick={onClick} className="show-hide-btn">{showDetails ? <t>hide details</t> : <t>show details</t>}</t>
                <br></br>
                {showDetails ? <div>
                    <t>Title: {oldQuestionTitle} → {updatedQuestionTitle} / </t>
                    <t>Tags: {oldQuestionTags} → {updatedQuestionTags} / </t>
                    <t>Experts: {oldQuestionExperts} → {updatedQuestionExperts}</t>
                    <t>Description: {oldQuestionDescription} → {updatedQuestionDescription}</t>
                </div> : null}
            </div>
        },
        bgColor: "rgba(255, 72, 72, 1)",
    },
};
