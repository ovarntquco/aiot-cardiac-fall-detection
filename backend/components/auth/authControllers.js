import { request, response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../../../database/database";

export async function verifyUser(request, response) {
    const { email, password } = request.body

    const verifiedUser = await prisma.users.findUnique({
        where: {
            email: email
        }
    })

    if (!verifiedUser) {
        return response.status(404).json({
            error: "User not found"
        })
    }

    const valid = await bcrypt.compare(password, verifiedUser.password)

    if (!valid) {
        return response.status(401).json({
            error: "Invalid credentials"
        });
    }

    const token = jwt.sign(
        {
            email: email
        },
        process.env.JWT_SECRETS,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    )

    return response.status(200).json({
        accessToken: token,
        message: "User verified"
    });
}