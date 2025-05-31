import { Attachment } from "../models/attachment.model";
import { format } from 'date-fns';

export type ProjectAttachmentDto = {
  projectId: string;
   projectStatus: string; // Nombre del estado del proyecto
  attachments: AllAttachmentDto[]; // Lista de miembros
};
export type AllAttachmentDto = {
  id: string;
  task: string;
  fileName: string;
  createdDate: string
  owner: string;
};

export function mapAttachmentsToProjectDto(attachments: Attachment[]): ProjectAttachmentDto {
  

  const firstAttachment = attachments[0];
  const project = firstAttachment.Task.Stage.Project;

  return {
    projectId: project?.projectId ?? "",
    projectStatus: project?.ProjectStatus?.projectStatusName ?? "Sin estado",
    attachments: attachments.map(a => ({
      id: a.attachmentId,
      task: a.Task.taskTitle,
      fileName: a.attachmentFileName,
      createdDate: formatDate(a.createdDate),
      owner: `${a.User?.userFirstName ?? ""} ${a.User?.userLastName ?? ""}`.trim() || "Sin asignar",
    }))
  };
}




function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd-MM-yyyy');
}

