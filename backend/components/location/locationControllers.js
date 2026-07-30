import { request, response } from "express";
import prisma from "../../../database/database";

export async function getLocation(request, response) {
    const params = request.params;

    let userId = params.get("user_id");
    const role = params.get("role");

    if (role !== "patient") {
        const caregiverId = userId;
        userId = await prisma.patients.findUnique({
            where: {
                primary_caregiver_id: caregiverId 
            }
        });
    }

    const deviceId = (
        await prisma.devices.findUnique({
            where: { patient_id: userId },
            select: { id: true }
        })
    )?.id;

    const gpsReading = await prisma.gps_readings.findFirst({
        where: { device_id: deviceId },
        orderBy: { id: "desc" }
    });

    if (!gpsReading) {
        return response.status(404).json({
            "error": "Not found"
        });
    }

    return response.status(200).json({
        "message": "Success",
        "gps": gpsReading
    });
}