import { request, response } from "express";
import prisma from "../../../database/database";

export async function getHistory(request, response) {
    const params = request.params;

    let userId = params.get("user_id");
    const role = params.get("role");

    if (role !== "patient") {
        const caregiverId = userId;
        userId = (
            await prisma.patients.findUnique({
                where: { primary_caregiver_id: caregiverId },
                select: { user_id: true }
            })
        )?.id;
    }

    const deviceId = (
        await prisma.devices.findUnique({
            where: { patient_id: userId },
            select: { id: true }
        })
    )?.id;

    const events = await prisma.events.findMany({
        where: {
            sensor_reading_id: {
                device_id: deviceId
            },
            gps_reading_id: {
                device_id: deviceId
            }
        },
        select: {
            id: true
        }
    });

    let eventIds = events.map(e => e.id)

    const alerts = await prisma.alerts.findMany({
        where: {
            event_id: {
                in: eventIds,
            },
        },
    });

    if (!alerts) {
        return response.status(404).json({
            "error": "Not found"
        });
    }

    return response.status(200).json({
        "message": "Success",
        "alerts": alerts
    });
}