idf_component_register(
    SRCS "mpu6050_payload.c" "mpu6050.c"
    REQUIRES
        main
        ai_service
    PRIV_REQUIRES 
        cjson
        esp_driver_i2c
        esp_timer
        main
        mqtt
        mqtt_helper
        time_sync
    INCLUDE_DIRS "include"
)