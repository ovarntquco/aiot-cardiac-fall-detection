import { request, response } from "express";

export function verifyRequest(request, response, next) {
    const body = request.body

    if (Object.keys(body).length !== 2) {
        return response.status(400).json({
            error: "Bad request"
        });
    }

    if (!body.get("email") || !body.get("password")) {
        return response.status(400).json({
            error: "Bad request"
        });
    }

    next();
}