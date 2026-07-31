idf_component_register(
    SRCS "mpu6050_batch.c" "mpu6050.c"
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