import { response, request } from "express";
import prisma from "../../../database/database";

export async function getDeviceData(request, response) {
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

    const sensorReading = await prisma.sensor_readings.findFirst({
        where: { device_id: deviceId },
        orderBy: { id: "desc" }
    });

    if (!sensorReading) {
        return response.status(404).json({
            "error": "Not found"
        });
    }

    return response.status(200).json({
        "message": "Success",
        "sensor": sensorReading
    });
}