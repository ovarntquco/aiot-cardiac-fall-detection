idf_component_register(
    SRCS "task.c" "main.c"
    REQUIRES 
        esp_driver_ledc
    PRIV_REQUIRES
        nvs_flash
        ai_service
        button_
        buzzer
        json_
        led
        max30102
        mpu6050
        mqtt_
        network_prov_
        nmea_parser
        time_sync
    INCLUDE_DIRS "."
)
