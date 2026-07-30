import jwt from 'jsonwebtoken'
import { request, response } from 'express'

export function authenticate(request, response, next) {
    const authHeaders = request.headers.authorization;

    if (!authHeaders) {
        return response.status(401).json({
            error: "Invalid credentials"
        });
    }

    const token = authHeaders.split(" ")[1];

    request.user = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    next();
}