"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResetPasswordZodSchema = void 0;
const zod_1 = require("zod");
exports.createResetPasswordZodSchema = zod_1.z.object({
    oldPassword: zod_1.z
        .string({ invalid_type_error: "Password must be string" }),
    newPassword: zod_1.z
        .string({ invalid_type_error: "Password must be string" })
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter.",
    })
        .regex(/^(?=.*[!@#$%^&*])/, {
        message: "Password must contain at least 1 special character.",
    })
        .regex(/^(?=.*\d)/, {
        message: "Password must contain at least 1 number.",
    })
});
