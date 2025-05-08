import { saveNewProject} from "../services/project.service";
import { Request, Response } from "express";






export async function createProject(req: Request, res: Response): Promise<void> {

       // const { userLoguedId } = (req as any).user;
      const projectName = req.body.projectName;
      const projectTypeId = req.body.projectTypeId;
              const newProject = await saveNewProject( projectName, projectTypeId);
              res.status(201).json({
                success: true,
                messaje: "El proyecto ha sido creado exitosamente."
              });
    }