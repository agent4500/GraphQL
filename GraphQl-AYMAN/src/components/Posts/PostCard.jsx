import React, { useEffect, useState } from "react";
import { useMutation, gql } from "@apollo/client";

const CREATE_COMMENT = gql`
  mutation createNewComment($input: CommentInput!) {
    createComment(input: $input) {
      name
    }
  }
`;

const DELETE_POST = gql`
  mutation deletePost($postId: Int!) {
    deletePost(input: {
      postId: $postId
    })
  }
`;

export default function PostCard(props) {
  const [imageUrl, setImageUrl] = useState("");
  const [comment, setComment] = useState("");

  const generateNewImage = async () => {
    try {
      const res = await fetch("https://picsum.photos/800/400");
      setImageUrl(res.url);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  useEffect(() => {
    generateNewImage();
  }, []);

  const [mutateCreateComment, { loading: commentLoading, error: commentError }] = useMutation(CREATE_COMMENT);
  const [mutateDeletePost] = useMutation(DELETE_POST);

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleDelete = async () => {
    try {
      await mutateDeletePost({
        variables: {
          postId: props.postId,
        },
      });
      await props.refetch();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const submitComment = async () => {
    if (!comment) return;

    try {
      await mutateCreateComment({
        variables: {
          input: {
            postId: props.postId,
            name: comment,
          },
        },
      });
      await props.refetch();
      setComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  return (
    <div className="post-container mt-8 mx-auto max-w-lg rounded-lg overflow-hidden shadow-xl bg-gray-100">
      <img className="w-full h-64 object-cover" src={imageUrl} alt={props.title} />
      <div className="px-6 py-4">
        <div className="font-bold text-2xl mb-2 text-gray-800">{props.title}</div>
        <p className="text-gray-700 text-lg">{props.body}</p>
      </div>
      <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full ml-6 mt-2">
        Delete Post
      </button>
      <div className="px-6 py-4">
        <span className="inline-block bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
          Comments
        </span>
        <ul>
          {props.comments.map((comment) => (
            <li key={comment.id} className="text-gray-700 text-sm mb-2 ml-2">
              {comment.name}
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Write your comment ..."
          value={comment}
          onChange={handleCommentChange}
          className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 mt-4"
        />
        <button onClick={submitComment} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-2 ml-2">
          {commentLoading ? "Adding Comment..." : "Add Comment"}
        </button>
        {commentError && <p className="text-red-500">Error: {commentError.message}</p>}
      </div>
    </div>
  );
}
