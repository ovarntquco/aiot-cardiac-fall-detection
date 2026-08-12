idf_component_register(
    SRCS "mpu6050_payload.c" "mpu6050.c"
    REQUIRES 
        esp_driver_i2c
    PRIV_REQUIRES
        esp_driver_i2c
        esp_timer
        ai_service
        main
        time_sync
    INCLUDE_DIRS "include"
)