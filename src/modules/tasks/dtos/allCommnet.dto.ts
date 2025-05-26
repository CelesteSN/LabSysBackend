import { Comment } from "../models/comment.model";
import { format } from 'date-fns';

export type TaskDetailsDto = {
  taskId: string;
  taskStatus: string;
  comments: AllCommentsDto[];
};

export type AllCommentsDto = {
  commentId: string;
  commentDetail: string;
  commentType: string;
  createdDate: string;
  sender: string;
};

export function mapCommentToTaskDetailsDto(comments: Comment[]): TaskDetailsDto {
  if (!comments || comments.length === 0) {
    throw new Error("No hay comentarios para mapear.");
  }

  const firstComment = comments[0];
  const task = firstComment.Task;

  return {
    taskId: task?.taskId ?? '',
    taskStatus: task?.TaskStatus?.taskStatusName ?? '',
    comments: comments.map(c => ({
      commentId: c.commentId,
      commentDetail: c.commentDetail,
      commentType: c.CommentType?.commentTypeName ?? '',
      createdDate: formatDate(c.createdDate),
      sender: `${c.User?.userFirstName ?? ''} ${c.User?.userLastName ?? ''}`.trim(),
    })),
  };
}

// Utilidad para formatear fecha
function formatDate(date: Date): string {
  return format(date, 'dd-MM-yyyy HH:mm');
}
