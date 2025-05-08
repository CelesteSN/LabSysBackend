//import { add } from "winston";
import { Project } from "../models/project.model";
import bcrypt from "bcrypt";
import { ProjectStatus } from "../models/projectStatus.model";
import { ProjectStatusEnum } from "../enums/projectStatus.enum";
import {ProjectTypeEnum} from "../enums/projectType.enum";
import {ProjectType} from "../models/projectType.model";
import { randomUUID } from "crypto";

export async function listProjects(): Promise<Project[]> {
  try {
    const listProjects = await Project.findAll(
  //     {
  //     include: [
  //       { model: UserStatus },
  //       { model: UserRole }
  //     ]
  // }
  );
    return listProjects;
  } catch (error) {
    return [];
  }
}

export async function saveNewProject( projectName: string, projectTypeId: string): Promise<Project> {
    
    //llamr a la funcion para validar al usuario Activo
    

    //obtengo el tipo de proyecto ingresado
    const type = await ProjectType.findByPk(projectTypeId);
    if (!type) {throw new Error("No se encontró el estado ingresado"); }
   

    //obtengo el estado activo
      let status = await ProjectStatus.findOne({
        where: {
            "projectStatusName":ProjectStatusEnum.ACTIVE
            }
        });
       // console.log(status?.userStatusName)
        if(!status){
          throw new Error("Estado no encontrado");

        }

        //creo el proyecto
      const newProject = await Project.build();
      newProject.projectName = projectName,     
      newProject.createdDate = new Date(),
      newProject.updatedDate = new Date(),
      newProject.projectStatusId = status.projectStatusId
      newProject.projectTypeId = type.projectTypeId;
       
        await newProject.save()
      return newProject;
    } 


export async function getProject(id: string): Promise<Project | null> {
  try {
    const oneLab = await Project.findByPk(id);
    return oneLab;
  } catch (error) {
    throw new Error("Error al obtener el laboratorio");
  }
}

export async function modifyproject(id: string, name: string, capacity: number, description: string): Promise<Project | null> {
  
        const updatedProject = await Project.findByPk(id);
        if (!updatedProject) {
        return null; // Usuario no encontrado
        }
    
        updatedProject.projectName = name;
        //updatedProject.projectCapacity = capacity;
        updatedProject.projectDescription = description;
        updatedProject.updatedDate = new Date();
    
    
        await updatedProject.save(); // Guardar los cambios en la base de datos
    
        return updatedProject;
    }



    export async function lowproject(id: string): Promise<Project> {
            const deletedLab = await Project.findByPk(id);
            if (!deletedLab) {
                throw new Error("Laboratorio no encontrado");
            }
            await deletedLab.destroy(); // Eliminar el usuario de la base de datos
        
            return deletedLab
        }
    