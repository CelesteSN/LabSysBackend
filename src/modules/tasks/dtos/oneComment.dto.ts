import { Comment } from "../models/comment.model";
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';


export type OneCommentDto = {
    commentId: string;
    task: string;
    sender: string;
    commentDetail: string;
    commentType: string;
    createdDate: string
};

export function mapOneCommentToDto(comment: Comment): OneCommentDto {
    return {
        commentId: comment.commentId,
        task: comment.Task.taskTitle,
        sender: `${comment.User.userFirstName} ${comment.User.userLastName}`,
        //name: `${user.userFirstName} ${user.userLastName}`,
        commentDetail: comment.commentDetail,
        commentType: comment.CommentType.commentTypeName,
        createdDate: formatDate(comment.createdDate)
    };
}
// function formatDate(date: Date | string): string {
//   return format(new Date(date), 'dd-MM-yyyy');
// }
function formatDate(date: Date): string {
  const timeZone = 'America/Argentina/Buenos_Aires';
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, 'dd-MM-yyyy HH:mm');
}