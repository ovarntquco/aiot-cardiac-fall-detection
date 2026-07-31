idf_component_register(
    SRCS "json_helper.c"
    PRIV_REQUIRES cjson main max30102 mpu6050 nmea_parser
    INCLUDE_DIRS "include"
)