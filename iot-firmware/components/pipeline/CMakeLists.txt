idf_component_register(
    SRCS "pipeline.c"
    PRIV_REQUIRES 
        mpu6050
        max30102
        mqtt_helper
        nmea_parser
        network_prov_helper

        nvs_flash
        esp_timer
        esp_driver_i2c
        esp_driver_ledc
        
        cjson
        esp_ssd1306
    INCLUDE_DIRS "include"
)
