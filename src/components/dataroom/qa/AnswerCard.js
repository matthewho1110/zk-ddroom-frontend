import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { blue, green, red } from "@mui/material/colors";
import dayjs from "dayjs";
import { Comment, ExpandMore } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CommentCard from "./CommentCard";
import { isMobile } from "react-device-detect";

export default function AnswerCard(props) {
    const { answer, setQuestion } = props;
    const [authorName, setAuthorName] = useState("");
    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    return (
        <Card sx={{ marginLeft: 5, marginTop: 1, maxWidth: 945 }}>
            <CardHeader
                avatar={<Avatar sx={{ bgcolor: red[500] }}>A</Avatar>}
                title={authorName}
                subheader={dayjs(answer.answerDate).format("YYYY-MM-DD HH:mm")}
            />
            <CardContent>
                <Typography variant="body1" color="text.primary">
                    {answer.content}
                </Typography>
            </CardContent>
            <CardActions disableSpacing>
                <ExpandMore
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                >
                    <ExpandMoreIcon />
                </ExpandMore>
            </CardActions>
            <CommentCard
                expend={expanded}
                answer={answer}
                setQuestion={setQuestion}
            />
        </Card>
    );
}
