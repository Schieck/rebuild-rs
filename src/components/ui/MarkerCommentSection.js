import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  Stack,
} from "@mui/material";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

const MarkerCommentSection = ({ markerId, user }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const commentsRef = collection(db, "comments");
    const q = query(commentsRef, where("markerId", "==", markerId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const loadedComments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(loadedComments);
    });
    return () => unsubscribe();
  }, [db, markerId]);

  const handlePostComment = async () => {
    const commentsRef = collection(db, "comments");
    await addDoc(commentsRef, {
      text: comment,
      userId: user.uid,
      userName: user.name,
      markerId,
    });
    setComment("");
  };

  const renderComment = (comment) => {
    return (
      <Paper key={comment.id} elevation={1} sx={{ p: 2, mb: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {comment.userName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{comment.userName}</Typography>
            <Typography variant="body2">{comment.text}</Typography>
          </Box>
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {comments.length === 0 && (
        <Typography textAlign="center">Ainda sem comentários.</Typography>
      )}
      {comments.map(renderComment)}
      {user?.role && (
        <Box>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escreva um comentário..."
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handlePostComment}>
            Comentar
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MarkerCommentSection;
