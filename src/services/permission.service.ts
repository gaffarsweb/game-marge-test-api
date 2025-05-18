import { permissionRepository } from "../repositories/permission.repository";

const permissionRepo = new permissionRepository();

export const addUpdatePermission = async (body: any) => {
    return await permissionRepo.addUpdatePermission(body)
};

export const getPermissions = async (id:any)=>{
    return await permissionRepo.getPermissions(id);
};