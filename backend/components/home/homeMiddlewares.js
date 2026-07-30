import { request, response } from "express";

export function verifyRequest(request, response, next) {
    const params = request.params;

    if (Object.keys(params).length !== 2) {
        return response.status(400).json({
            error: "Bad request"
        });
    }

    if (!params.get("user_id") || !params.get("role")) {
        return response.status(400).json({
            error: "Bad request"
        });
    }
    
    next();
}