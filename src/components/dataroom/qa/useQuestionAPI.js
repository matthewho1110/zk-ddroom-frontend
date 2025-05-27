import axios from "axios";
import useUser from "../../../hooks/useUser";

const useQuestionAPI = () => {
    const { axiosInstance } = useUser();
    const getAllQuestions = async (did, params) => {
        const { condition, status, tags } = params || {};
        return (
            await axiosInstance.get(`/datarooms/${did}/questions`, {
                params: {
                    bookmark: condition === "bookmarked" ? true : null,
                    assignedToMe: condition === "assignedToMe" ? true : null,
                    myQuestion: condition === "myQuestion" ? true : null,
                    status: status || null,
                    tags: tags?.length > 0 ? tags : null,
                },
            })
        ).data;
    };

    const getAllTags = async (did) => {
        return (await axiosInstance.get(`/datarooms/${did}/tags`)).data;
    };

    const getQuestionDetail = async (did, qid) => {
        return (await axiosInstance.get(`/datarooms/${did}/questions/${qid}`))
            .data;
    };

    const createTag = async (did, newTag) => {
        return (await axiosInstance.post(`/datarooms/${did}/tags`, newTag))
            .data;
    };

    const updateTag = async (did, tid, changes) => {
        return (
            await axiosInstance.patch(`/datarooms/${did}/tags/${tid}`, changes)
        ).data;
    };

    const removeTag = async (did, tid) => {
        return (await axiosInstance.delete(`/datarooms/${did}/tags/${tid}`))
            .data;
    };

    const createQuestion = (newQuestion, did) => {
        return axiosInstance.post(`/datarooms/${did}/questions`, newQuestion);
    };

    const updateQuestion = (did, qid, changes) => {
        return axiosInstance.patch(
            `/datarooms/${did}/questions/${qid}`,
            changes
        );
    };

    const bookQuestion = (did, qid) => {
        return axiosInstance.patch(
            `/datarooms/${did}/questions/${qid}/bookmark`,
            {
                bookmarked: true,
            }
        );
    };

    const unbookQuestion = (did, qid) => {
        return axiosInstance.patch(
            `/datarooms/${did}/questions/${qid}/bookmark`,
            {
                bookmarked: false,
            }
        );
    };

    const commentQuestion = (did, qid, comment) => {
        return axiosInstance.post(
            `/datarooms/${did}/questions/${qid}/comments`,
            { comment }
        );
    };

    const answerQuestion = async (did, qid, answer) => {
        return (
            await axiosInstance.post(`/datarooms/${did}/questions/answer`, {
                questionId: qid,
                content: answer,
            })
        ).data;
    };

    const commentAnswer = async (did, aid, comment) => {
        return (
            await axiosInstance.post(
                `/datarooms/${did}/questions/answer-comment`,
                {
                    answerId: aid,
                    comment: comment,
                }
            )
        ).data;
    };

    return {
        getAllQuestions,
        getAllTags,
        getQuestionDetail,
        removeTag,
        createQuestion,
        bookQuestion,
        unbookQuestion,
        updateQuestion,
        answerQuestion,
        commentAnswer,
        commentQuestion,
        createTag,
        updateTag,
    };
};

export default useQuestionAPI;
