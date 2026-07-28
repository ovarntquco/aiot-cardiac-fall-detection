idf_component_register(
    SRCS "max30102.c"
    PRIV_REQUIRES esp_driver_i2c esp_timer
    INCLUDE_DIRS "include"
)