import bcryptjs from 'bcryptjs';
import { envVars } from "../config/env";
import { User } from "../module/user/user.model";
import { IAuthProvider, IUser, Role } from '../module/user/user.interface';

export const seedSuperAdmin = async () => {
    try {
        console.log("super admin");
        const isSuperAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL })
        if (isSuperAdminExist) {
            console.log("Super admin already exist.");
            return;
        }

        const hashPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_CREDENTIAL, Number(envVars.BCRYPT_SALT_ROUND))

      const authProvider: IAuthProvider = {
            provider: "credential",
            providerId: envVars.SUPER_ADMIN_EMAIL
        }

        console.log("Trying to create super admin");

        const payload: IUser = {
            name: "Super admin",
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashPassword,
            role: Role.SUPER_ADMIN,
            auths: [authProvider],
            isVerified: true
        }

        const superAdmin = await User.create(payload)
        console.log("Super admin created successfully.");
        console.log(superAdmin);
    } catch (error) {
        console.log(error);

    }
}