idf_component_register(
    SRCS "json_helper.c"
    PRIV_REQUIRES cjson main mpu6050
    INCLUDE_DIRS "include"
)